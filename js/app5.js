/*  Jevon Grimes FEWD November Cohort
Neighborhood Map Project Revision #2
*/
$(document).ready(function(){

    var self = this;
    var frenchQuarter, map, infoWindow;

    // Highlights of the French Quarter in New Orleans
var Model = [
    {
      "name": "Cafe Du Monde",
      "latlng": [29.957507, -90.061799]
    },
    {
      "name": "Preservation Hall",
      "latlng": [29.958285, -90.065384]
    },
    {
      "name": "Muriel's Jackson Square",
      "latlng": [29.958326, -90.063148]
    },
    {
      "name": "Antoine's Restaurant",
      "latlng": [29.956717, -90.066405]
    },  
    {
      "name": "Oceana Grill",
      "latlng": [29.956252, -90.067642]
    },
    {
      "name": "Broussard's Restaurant",
      "latlng": [29.956638, -90.068062]
    },
    {
      "name": "Pat O'Brien's",
      "latlng": [29.958203, -90.065202]
    },
    {
      "name": "Gumbo Shop",
      "latlng": [29.957730, -90.064519]
    },
    {
      "name": "Brennans",
      "latlng": [29.956158, -90.066623]
    },
    {
      "name": "Acme Oyster House",
      "latlng": [29.954326, -90.068957]
    }
];

    //google.maps.event.addDomListener(window, 'load', initialize);

    
    //Knockout's ViewModel

    var appViewModel = function() {
      var self = this;
      self.markers = ko.observableArray([]);
      self.allLocations = ko.observableArray([]);


      self.filter =  ko.observable("");
      self.search = ko.observable("");

      var map = initialize();
      // if google map is not displaying, alert the user
      if (!map) {
        alert("Sorry, Google Maps is unavailable. Please try your search again later.");
        return;
      }  
      self.map = ko.observable(map);
      fetchForsquare(self.allLocations, self.map(), self.markers);

      // Filter the list based on search
      self.filteredArray = ko.computed(function() {
        return ko.utils.arrayFilter(self.allLocations(), function(item) {
          if (item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
            if(item.marker)
              item.marker.setMap(map); 
          } else {
            if(item.marker)
              item.marker.setMap(null);
          }     
          return item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
        });
      }, self);

      self.clickHandler = function(data) {
        centerLocation(data, self.map(), self.markers);
      };
    };

    // Initialize Google Map of the French Quarter
    function initialize() {

      var mapOptions = {
        center: new google.maps.LatLng(29.955899, -90.065224),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);  
    }


    // Pull Location data from Foursquare
    function fetchForsquare(allLocations, map, markers) {
      var locationDataArr = [];
      var foursquareUrl = "";
      var location = [];
      for (var place in Model) {
        foursquareUrl = 'https://api.foursquare.com/v2/venues/search' +
          '?client_id=B2X0F1HEEJ53N03UU4JM2NWU1TY5TAMELW2QPCSL2CSEKQQY' +
          '&client_secret=C0GS2XJKGULAPMJZUJBHTMHKYQU413C40MYQP0RQZQ0FMSXR' +
          '&v=20130815' +
          '&m=foursquare' +
          '&ll=' + Model[place]["latlng"][0] + ',' + Model[place]["latlng"][1] + 
          '&query=' + Model[place]["name"] + 
          '&intent=match';

        $.getJSON(foursquareUrl, function(data) {         
          if(data.response.venues){
            var item = data.response.venues[0];
            allLocations.push(item);
            location = {lat: item.location.lat, lng: item.location.lng, name: item.name, loc: item.location.address + " " + item.location.city + ", " + item.location.state + " " + item.location.postalCode};
            locationDataArr.push(location);
            placeMarkers(allLocations, place, location, map, markers);
          } else {
            alert("Sorry, Foursquare data is unavailable. Please try your search again later.");
            return;
          }
        });    
      }
    }


    // Show the Map Location Markers on the Map
  function placeMarkers(allLocations, place, data, map, markers) {
    var latlng = new google.maps.LatLng(data.lat, data.lng);
    var marker = new google.maps.Marker({
      position: latlng,
      icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      map: map,
      animation: google.maps.Animation.DROP,
      content: data.name + "<br>" + data.loc
    });
  
    // Create an infoWindow for each marker
    var infoWindow = new google.maps.InfoWindow({
      content: marker.content
    });
    marker.infowindow = infoWindow;
    markers.push(marker);
    allLocations()[allLocations().length - 1].marker = marker;

    // Additional details when a marker is clicked
    google.maps.event.addListener(marker, 'click', function() {
      // close the open infowindow
      for (var i = 0; i < markers().length; i++) {
        markers()[i].infowindow.close(); 
      }
      infoWindow.open(map, marker);
    });

    // toggle bounce when user clicks on a location marker on google map
    google.maps.event.addListener(marker, 'click', function() {
      toggleBounce(marker);
    });
}

// Add Animation to Marker
function toggleBounce(marker) {  
  // Google map documentation shows to keep one "=" instead of two. Does not work with "=="
  if (marker.setAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1500);
  }
}

// Click on locations in list view
function centerLocation(data, map, markers) {
  // close the open infowindow  
  for (var i = 0; i < markers().length; i++) {
    markers()[i].infowindow.close(); 
  }  
  map.setCenter(new google.maps.LatLng(data.location.lat, data.location.lng));
  map.setZoom(16);
  for (var i = 0; i < markers().length; i++) {  
    var content = markers()[i].content.split('<br>');
    if (data.name === content[0]) {     
      toggleBounce(markers()[i]);
    }
  }
}   

  ko.applyBindings(new appViewModel());
});