var SfBikeParking = SfBikeParking || {};

/**
 * Create a new map object, decorate it, and populate data.
 */
SfBikeParking.initialize = function (){
  var mapOptions = {
    center: new google.maps.LatLng(37.7833, -122.4167),
    zoom: 16,
    scaleControl: true
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  map['marker'] = new google.maps.Marker({
    map: map
  });
  map.marker.setVisible(false);
  map.marker.bindTo('position', map, 'center'); 

  map['circle'] = new google.maps.Circle({
    strokeColor: "#0000FF",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#0000FF",
    fillOpacity: 0.25,
    map: map,
    center: map.getCenter(),
    radius: 500
  });
  map.circle.bindTo('center', map.marker, 'position');

  $("#slide").slider({
    orientation: "horizontal",
    range: "min",
    max: 3000,
    min: 500,
    value: 500,
    slide: function (event, ui) {
      SfBikeParking.updateRadius(map.circle, ui.value);
    }
  });
  var url = 'http://data.sfgov.org/resource/w969-5mn4.json?' +
            'status=COMPLETE&status_detail=INSTALLED';
  $.get(url, function( data ) {
    if (!data.length) {
      alert('There was a problem downloading the San Francisco Bicycle ' +
            'Parking dataset.'); 
    } else {
      map['bicycleCoords'] = data;
      console.log(data);
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
  coords = map.bicycleCoords;
  //Set bicycle parking area's distance to center of map/circle.
  for (i=0; i < coords.length; i++) {
    var mlat = coords[i].coordinates.latitude;
    var mlng = coords[i].coordinates.longitude;
    var dLat  = SfBikeParking.rad(mlat - lat);
    var dLong = SfBikeParking.rad(mlng - lng);
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
    c = coords[i];
    var cLatlng = new google.maps.LatLng(c.coordinates.latitude,
                                         c.coordinates.longitude);
    var distanceBtwn = google.maps.geometry.spherical.computeDistanceBetween(
                           cLatlng, map.getCenter());
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
