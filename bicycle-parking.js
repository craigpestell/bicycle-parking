function rad(x) {return x*Math.PI/180;}

function find_closest_marker( event ) {
	var lat = event.latLng.lat();
	var lng = event.latLng.lng();
	var R = 6371; // radius of earth in km
	var distances = [];
	var closest = -1;
	coords = map.bicycleCoords.data;
	for( i=0;i<coords.length; i++ ) {
		var mlat = coords[i][20][1];
		var mlng = coords[i][20][2];
		var dLat  = rad(mlat - lat);
		var dLong = rad(mlng - lng);
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		distances[i] = d;
		if ( closest == -1 || d < distances[closest] ) {
			closest = i;
		}
	}

	closest = coords[closest];
	var closestLatlng = new google.maps.LatLng(closest[20][1],closest[20][2]);

	console.log (closest);
	var marker = new google.maps.Marker({
		position: closestLatlng,
		map: map,
		title: closest[13]
	});
}
