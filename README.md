## Synopsis

bicycle-parking is a HTML/Javascript website which contains a Google Maps populated with markers for all bicycle parking racks and lockers in San Francisco.

I chose to use a front-end technical stack only for this project as all APIs were available in javascript, so no server-side logic was needed.

www.linkedin.com/in/craigpestell/

This application still needs:

- A message within the circle if there are no markers within it on map load saying something like "No bicycle parking areas nearby.  Expand your search radius."
- Unit tests.
- Drop-down to filter parking areas by type (locker, rack)

## Code Example

Your HTML page must have the #map and #search-radius elements defined (see supplied index.html).
Call the initialize function (in bicycle-parking.js) on the Google Map's load event:
google.maps.event.addDomListener(window, 'load', SfBikeParking.initialize);

## Installation

The files for this project can be pulled from this git repository: https://github.com/craigpestell/bicycle-parking.git

Upload all files to the HTTP server directory as your choice.  Ensure all files are readable by your HTTP server's user.

## Tests

There are currently no tests.

## License

GNU General Public License (GPL)
