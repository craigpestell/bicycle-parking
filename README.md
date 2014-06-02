## Synopsis

bicycle-parking is a HTML/Javascript website which contains a Google Maps populated with markers for all bicycle parking racks and lockers in San Francisco.

At the top of the file there should be a short introduction and/ or overview that explains **what** the project is. This description should match descriptions added for package managers (Gemspec, package.json, etc.)

## Code Example

Your HTML page must have the #map and #slide elements defined (see supplied index.html).
Call the initialize function (in bicycle-parking.js) on the Google Map's load event:
google.maps.event.addDomListener(window, 'load', SfBikeParking.initialize);

## Installation

The files for this project can be pulled from this git repository: https://github.com/craigpestell/bicycle-parking.git
Upload all files to the HTTP server directory as your choice.  Ensure all files are readable by your HTTP server's user.

## Tests

Describe and show how to run the tests with code examples.

## License

GNU General Public License (GPL)
