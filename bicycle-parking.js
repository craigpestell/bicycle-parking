/*jslint browser: true*/
/*global alert, $, google*/

"use strict";
var SfBikeParking = {};

SfBikeParking.config = {
    circleFillColor: "#0000FF",
    circleFillOpacity: 0.25,
    circleStartRadius: 500,
    circleStrokeColor: "0000FF",
    circleStrokeOpacity: 0.8,
    circleStrokeWeight: 2,
    startLat: 37.7833,
    startLng: -122.4167,
    startZoom: 16,
    searchRadiusMin: 500,
    searchRadiusMax: 3000,
    searchRadiusStart: 500
};

/**
 * Create a new map object, decorate it, and populate data.
 */
SfBikeParking.initialize = function () {
    var mapOptions = {
            center: new google.maps.LatLng(SfBikeParking.config.startLat,
                                           SfBikeParking.config.startLng),
            zoom: SfBikeParking.config.startZoom
        },
        url = 'http://data.sfgov.org/resource/w969-5mn4.json?' +
                        'status=COMPLETE&status_detail=INSTALLED';
        
    SfBikeParking.map = new google.maps.Map(
        document.getElementById("map-canvas"),
        mapOptions
    );

    //Create an invisible marker bound to the center of the map
    SfBikeParking.map.center_marker = new google.maps.Marker({
        map: SfBikeParking.map
    });
    SfBikeParking.map.center_marker.setVisible(false);
    SfBikeParking.map.center_marker.bindTo('position', SfBikeParking.map,
                                           'center');

    //Create a circle and bind to center marker.
    SfBikeParking.map.circle = new google.maps.Circle({
        center: SfBikeParking.map.getCenter(),
        fillColor: SfBikeParking.config.circleFillColor,
        fillOpacity: SfBikeParking.config.circleFillOpacity,
        map: SfBikeParking.map,
        radius: SfBikeParking.config.circleStartRadius,
        strokeColor: SfBikeParking.config.circleStrokeColor,
        strokeOpacity: SfBikeParking.config.circleStrokeOpacity,
        strokeWeight: SfBikeParking.config.strokeWeight
    });
    SfBikeParking.map.circle.bindTo('center', SfBikeParking.map.center_marker,
                                    'position');

    // initialize jquery slider
    $("#search-radius").slider({
        orientation: "horizontal",
        range: "min",
        max: SfBikeParking.config.searchRadiusMax,
        min: SfBikeParking.config.searchRadiusMin,
        value: SfBikeParking.config.searchRadiusStart,
        slide: function (event, ui) {
            SfBikeParking.updateRadius(SfBikeParking.map.circle, ui.value);
        }
    });

    // fetch data
    $.get(url, function (data) {
        if (!data.length) {
            alert('There was a problem downloading the San Francisco Bicycle ' +
                  'Parking dataset.');
        } else {
            SfBikeParking.coordinates = data;
            google.maps.event.addListener(SfBikeParking.map, 'idle',
                                          SfBikeParking.showMarkers);
        }
    });
};

/**
 * Set the radius of a circle and trigger map idle event.
 * @param circle the circle to set radius.
 * @param rad radius to set.
 */
SfBikeParking.updateRadius = function (circle, rad) {
    circle.setRadius(rad);
    google.maps.event.trigger(SfBikeParking.map, 'idle');
};

/**
 * Convert degrees to radians.
 * @param x degrees to convert.
 * @return float radians
 */
SfBikeParking.rad = function (x) {
    return x * Math.PI / 180;
};

/**
 * Calculate distance between one coordinate and many.
 * This populates coords array of objects with distance property.
 * @param lat latitude
 * @param lng longitude
 * @param coords array of coordinates to populate distance property.
 */
SfBikeParking.calculateDistances = function (lat, lng, coords) {
    var a,
        c,
        d,
        distances = [],
        dLat,
        dLng,
        i,
        R = 6371; //radius of earth in km

    //Set coordinate distances to center of map/circle.
    for (i = 0; i < coords.length; i += 1) {
        dLat    = SfBikeParking.rad(coords[i].coordinates.latitude - lat);
        dLng = SfBikeParking.rad(coords[i].coordinates.longitude - lng);
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(SfBikeParking.rad(lat)) *
            Math.cos(SfBikeParking.rad(lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        d = R * c;
        distances[i] = d;
        coords[i].distance = d;
    }
};

/**
 * Shows the bicycle racks within the map circle's radius.
 * @param event event which triggered this function.
 */
SfBikeParking.showMarkers = function (event) {
    var c,
        cLatlng,
        distanceBtwn,
        i,
        lat = SfBikeParking.map.getCenter().k,
        lng = SfBikeParking.map.getCenter().A,
        marker;

    SfBikeParking.calculateDistances(lat, lng, SfBikeParking.coordinates);

    SfBikeParking.coordinates.sort(function (a, b) {
        return a.distance - b.distance;
    });

    //clear markers
    if (SfBikeParking.map.hasOwnProperty("markers")) {
        for (i = 0; i < SfBikeParking.map.markers.length; i += 1) {
            SfBikeParking.map.markers[i].setMap(null);
        }
        SfBikeParking.map.markers = [];
    }

    for (i = 0; i < SfBikeParking.coordinates.length; i += 1) {
        c = SfBikeParking.coordinates[i];
        cLatlng = new google.maps.LatLng(c.coordinates.latitude,
                                         c.coordinates.longitude);
        distanceBtwn = google.maps.geometry.spherical.computeDistanceBetween(
            cLatlng,
            SfBikeParking.map.getCenter()
        );
        // only show markers inside the circle.
        if (distanceBtwn > SfBikeParking.map.circle.radius) {
            i = SfBikeParking.coordinates.length;
        } else {
            marker = new google.maps.Marker({
                position: cLatlng,
                map: SfBikeParking.map,
                title: c.location_name + ', ' + c.yr_inst +
                            ', type: ' + c.bike_parking +
                            ', spaces: ' + c.spaces
            });
            if (!SfBikeParking.map.hasOwnProperty("markers")) {
                SfBikeParking.map.markers = [marker];
            } else {
                SfBikeParking.map.markers.push(marker);
            }
        }
    }
};
