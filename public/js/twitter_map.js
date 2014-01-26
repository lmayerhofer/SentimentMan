$(document).ready(function() {
  var tweetCnt = 0;
  var tweets = {};
  var markerInterval;

  var map = L.mapbox.map('map', 'examples.map-9ijuk24y').setView([37.8, -96], 4);

  map.addControl(L.mapbox.geocoderControl('examples.map-9ijuk24y'));
  map.addControl(L.mapbox.shareControl());

  var getMapPosition = function() {
    var mapPosition = {}

    if(tweets[tweetCnt].place) {
      var coordinates = tweets[tweetCnt].place.bounding_box.coordinates[0][0];
      mapPosition['lat'] = coordinates[1];
      mapPosition['long'] = coordinates[0];
    }
    else if (tweets[tweetCnt].geo) {
      var coordinates = tweets[tweetCnt].geo.coordinates;
      mapPosition['lat'] = coordinates[0];
      mapPosition['long'] = coordinates[1];
    }

    return mapPosition;
  }  

  var addMarker = function() {
    var mapPosition = getMapPosition(tweetCnt);
    console.log(mapPosition['lat'] + '/' + mapPosition['long']);

    L.mapbox.markerLayer({
      // this feature is in the GeoJSON format: see geojson.org
      // for the full specification
      type: 'Feature',
      geometry: {
          type: 'Point',
          // coordinates here are in longitude, latitude order because
          // x, y is the standard for GeoJSON and many formats
          coordinates: [mapPosition['long'], mapPosition['lat']]
      },
      properties: {
          title: 'A Single Marker',
          description: 'Just one of me',
          // one can customize markers by adding simplestyle properties
          // http://mapbox.com/developers/simplestyle/
          'marker-size': 'small',
          'marker-color': '#fff'
      }
    }).addTo(map);

    console.log(tweetCnt);
    tweetCnt++;
    console.log(tweetCnt);

    if(tweetCnt == 10000) {
      clearInterval(markerInterval);
      tweetCnt = 0;
    }
  }

  var addMarkers = function() {
    markerInterval = setInterval(addMarker, 50);
  }

  $.getJSON( "/tweets.json", function(data) {
    $('#loading').show();
  }).done(function(data) {
    $.each(data, function(key, value) {
      tweets[key] = value;
    });
    $('#loading').hide();
    addMarkers();
  });
});