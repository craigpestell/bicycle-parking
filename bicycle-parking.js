var SfBikeParking = SfBikeParking || {};

SfBikeParking.config = {
  circleFillColor: "#0000FF",
  circleFillOpacity: 0.25,
  circleStartRadius: 500,
  circleStrokeColor: "0000FF",
  circleStrokeOpacity: 0.8,
  circleStrokeWeight: 2,
  startLat:37.7833,
  startLng: -122.4167,
  startZoom: 16,
  searchRadiusMin: 500,
  searchRadiusMax: 3000,
  searchRadiusStart: 500
};

/**
 * Create a new map object, decorate it, and populate data.
 */
SfBikeParking.initialize = function (){
  var mapOptions = {
    center: new google.maps.LatLng(SfBikeParking.config.startLat,
                                   SfBikeParking.config.startLng),
    zoom: SfBikeParking.config.startZoom
  };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  //Create an invisible marker bound to the center of the map
  map['center_marker'] = new google.maps.Marker({
    map: map
  });
  map.center_marker.setVisible(false);
  map.center_marker.bindTo('position', map, 'center'); 

  //Create a circle and bind to center marker.
  map['circle'] = new google.maps.Circle({
    center: map.getCenter(),
    fillColor: SfBikeParking.config.circleFillColor,
    fillOpacity: SfBikeParking.config.circleFillOpacity,
    map: map,
    radius: SfBikeParking.config.circleStartRadius,
    strokeColor: SfBikeParking.config.circleStrokeColor,
    strokeOpacity: SfBikeParking.config.circleStrokeOpacity,
    strokeWeight: SfBikeParking.config.strokeWeight
  });
  map.circle.bindTo('center', map.center_marker, 'position');

  // initialize jquery slider
  $("#search-radius").slider({
    orientation: "horizontal",
    range: "min",
    max: SfBikeParking.config.searchRadiusMax,
    min: SfBikeParking.config.searchRadiusMin,
    value: SfBikeParking.config.searchRadiusStart,
    slide: function (event, ui) {
      SfBikeParking.updateRadius(map.circle, ui.value);
    }
  });

  // fetch data
  var url = 'http://data.sfgov.org/resource/w969-5mn4.json?' +
            'status=COMPLETE&status_detail=INSTALLED';
  $.get(url, function( data ) {
    if (!data.length) {
      alert('There was a problem downloading the San Francisco Bicycle ' +
            'Parking dataset.'); 
    } else {
      map['bicycleCoords'] = data;
      google.maps.event.addListener(map, 'idle', SfBikeParking.showMarkers);
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
  google.maps.event.trigger(map, 'idle');
};

/**
 * Convert degrees to radians.
 * @param x degrees to convert.
 * @return float radians
 */
SfBikeParking.rad = function(x) {
  return x * Math.PI / 180;
};

/**
 * Shows the bicycle racks within the map circle's radius.
 * @param event event which triggered this function.
 */
SfBikeParking.showMarkers = function (event) {
  var lat = map.getCenter().k;
  var lng = map.getCenter().A;
  var R = 6371; // radius of earth in km
  var distances = [];
  var coords = map.bicycleCoords;
  //Set coordinate distances to center of map/circle.
  for (i=0; i < coords.length; i++) {
    var dLat  = SfBikeParking.rad(coords[i].coordinates.latitude - lat);
    var dLong = SfBikeParking.rad(coords[i].coordinates.longitude - lng);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(SfBikeParking.rad(lat)) *
      Math.cos(SfBikeParking.rad(lat)) *
      Math.sin(dLong/2) * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    distances[i] = d;
    coords[i]['distance'] = d;
  }

  coords.sort(function (a, b) {
    return a.distance - b.distance;
  });

  //clear markers
  if (map.hasOwnProperty("markers")) {
    for (i=0; i<map.markers.length; i++) {
      map.markers[i].setMap(null);
    }
    map.markers = [];
  }

  for (i=0; i < coords.length; i++) {
    var c = coords[i];
    var cLatlng = new google.maps.LatLng(c.coordinates.latitude,
                                         c.coordinates.longitude);
    var distanceBtwn = google.maps.geometry.spherical.computeDistanceBetween(
                           cLatlng, map.getCenter());
    // only show markers inside the circle.
    if (distanceBtwn > map.circle.radius) {
      break;
    } else {
      var marker = new google.maps.Marker({
        position: cLatlng,
        map: map,
        title: c.location_name + ', ' + c.yr_inst +
              ', type: ' + c.bike_parking + ', spaces: ' + c.spaces
      });
      if (!map.hasOwnProperty("markers")) {
        map['markers'] = new Array(marker);
      } else {
        map.markers.push(marker);
      }
    }
  }
};
