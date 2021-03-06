var fsClientId = '2JWLLGNETKFLPRN5QQW1HVUMRASWDSQBJOR4QWD44MVOJCBH'
var fsClientSecret = 'ULVLGGM5YRR5J45X5T3GK3UYJMGL31VKL0MI1JFHBNNJNB2F'

var map;
var defaultIcon;
var highlightedIcon;
// Create a new blank array for all the listing markers.
var markers = [];
var locations = [
    {title: 'Uber', location: {lat: 37.77583, lng: -122.41828}, visible: ko.observable(true)},
    {title: 'Twitter', location: {lat: 37.77679, lng: -122.4166}, visible: ko.observable(true)},
    {title: 'GotIt!', location: {lat: 37.57847, lng: -122.34838}, visible: ko.observable(true)},
    {title: 'Apple', location: {lat: 37.332, lng: -122.03078}, visible: ko.observable(true)},
    {title: 'Facebook', location: {lat: 37.48507, lng: -122.14742}, visible: ko.observable(true)},
    {title: 'Google', location: {lat: 37.42199, lng: -122.08405}, visible: ko.observable(true)},
    {title: 'Lyft', location: {lat: 37.7771, lng: -122.3931}, visible: ko.observable(true)},
    {title: 'HP', location: {lat: 37.41232, lng: -122.14799}, visible: ko.observable(true)},
    {title: 'Netflix', location: {lat: 37.25958, lng: -121.96269}, visible: ko.observable(true)},
    {title: 'Oracle', location: {lat: 37.39329, lng: -121.95213}, visible: ko.observable(true)},
    {title: 'Tesla', location: {lat: 37.3947, lng: -122.15032}, visible: ko.observable(true)}
  ];
  var infowindow = null;
function initMap() {
  // Create a styles array to use with the map.
  
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.516033302497206, lng: -122.2360711},
    zoom: 10,
    mapTypeControl: false
  });
  
  infowindow = new google.maps.InfoWindow();
  // Style the markers a bit. This will be our listing marker icon.
  defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  highlightedIcon = makeMarkerIcon('FFFF24');
  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    //Show marker on map
    marker.setMap(map);
    
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, infowindow);
    });

    // Push the marker to our array of markers.
    markers.push(marker);

    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', hideListings);
}

function getMarkerByLocation(location) {
  for (var i = 0; i < markers.length; i++) {
    if (location.title == markers[i].title) {
      return markers[i];
    } 
  }
}

function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    var content = '';
    var content2='';
    
    /*
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        content += '<div>' + marker.title + '</div><div id="pano"></div>';
          infowindow.setContent(content);
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        content += '<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>'
        infowindow.setContent(content);
      }
    }

    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    */
    //add foursquare information
    var url = 'https://api.foursquare.com/v2/venues/explore?';
    url += 'client_id=' + fsClientId + '&';
    url += 'client_secret=' + fsClientSecret + '&'
    url += 'v=20180323&' + '&';
    url += 'll=' + marker.getPosition().lat()+','+marker.getPosition().lng()+'&';
    url += 'radius=500&';
    url += 'limit=5';

    $.ajax({
      url: url,
      type: "GET",
    });

    var items;
     $.get(url, function(data, status){
            items = data.response.groups[0].items;
            content += '<h2>' + marker.title +'</h2>'
            content += '<h4>Nearby Points of Interest: </h4>';
            for(var i=0; i<items.length; i++){
              console.log(items[i].venue.name);
              content += '<strong>'+ items[i].venue.name + '</strong>'
              content += '<p>Distance: ' + items[i].venue.location.distance + 'm</p>'
            }
            infowindow.setContent(content);
        }).fail(function() {
            alert('failed to fetch nearby places');
            marker.setAnimation(null);
        });

    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}
// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}
// This function will loop through the listings and hide them all.
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}



var MapViewModel = function() {
  var self = this;

  self.places = ko.observableArray(locations);
  self.filterText = ko.observable('');

  self.showSelected = function(place) { 
      console.log(place.title);
      var marker = getMarkerByLocation(place);
      google.maps.event.trigger(marker, 'click');
    }

    self.filterText.subscribe(function(newValue) {
      for(var i = 0; i < self.places().length; i++){
        var marker = getMarkerByLocation(self.places()[i]);
        if (self.places()[i].title.toLowerCase().startsWith(newValue.toLowerCase())){
          marker.setMap(map);
          self.places()[i].visible(true);
        }
        else{
          marker.setMap(null);
          self.places()[i].visible(false);
        }
      }
    });

}

ko.applyBindings(new MapViewModel());