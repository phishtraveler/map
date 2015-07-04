function LocationModel() {
  var self = this; 
  var map, service, infowindow, lat = '', lng = '';
  var frenchQuarter = new google.maps.LatLng(29.955899, -90.065224);
  var markersArray = [];  

  // placeholder that holds info for knockout array (removed brackets that were not necessary ([])
  self.allPlaces = ko.observableArray();

  // placeholder to hold foursquare info
  self.foursquareInfo = '';

  // Calculates the center of the map to get lat and lng values
  function calcCenter() {
    var latAndLng = map.getCenter();
      lat = latAndLng.lat();
      lng = latAndLng.lng(); 
  }

  
  /*
  Initialize loads the map and searchbox for highlights
  */
  function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: frenchQuarter, 
    });
    getPlaces();
    calcCenter();       

    var list = (document.getElementById('list'));
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(list);
   
    var input = (document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var searchBox = new google.maps.places.SearchBox(
      (input));

    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();
      resetMap();
      self.allPlaces.removeAll();
      var bounds = new google.maps.LatLngBounds();  


      for(var i=0, place; i<10; i++){
        if (places[i] !== undefined){
          place = places[i];

          getLocations(place);
          createMarker(place);
          bounds.extend(place.geometry.location);          
        }        
      } 
      map.fitBounds(bounds); 
      calcCenter();                
    });
    google.maps.event.addListener(map, 'bounds_changed', function(){
      var bounds = map.getBounds();
      searchBox.setBounds(bounds);
    }); 

    // This loads the Google Maps error message if over 5000
    var timer = window.setTimeout(timeOut, 5000);
    google.maps.event.addListener(map, 'tilesloaded', function() {
      window.clearTimeout(timer);
    });
  }

  // Google Maps error message is displayed if a load is over 5000
  function timeOut() {
    $('#map-canvas').html("Sorry, Google Maps Failed to Load");
  }

  /*
  Function to pre-populate the map with place types.  nearbySearch retuns up to 20 places.
  */
  function getPlaces() {
    var request = {
      location: frenchQuarter,
      radius: 550,
      types: ['cafe', 'restaurant', 'bar', 'grocery']
    };

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);    
  }

  /*
  Function pulls the info from Google and sends it to getLocations
  */
  function callback(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK){
      bounds = new google.maps.LatLngBounds();
      results.forEach(function (place){
        place.marker = createMarker(place);
        bounds.extend(new google.maps.LatLng(
          place.geometry.location.lat(),
          place.geometry.location.lng()));
      });
      map.fitBounds(bounds);
      results.forEach(getLocations);                 
    }
  }

  /*
  Function to create map makers at each place.  Then push markers into the markers Array.
  */
  function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      name: place.name.toLowerCase(),
      position: place.geometry.location,
      place_id: place.place_id,
      
    });    
    var address;
    if (place.vicinity !== undefined) {
      address = place.vicinity;
    } else if (place.formatted_address !== undefined) {
      address = place.formatted_address;
    }       
    var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>' + address + '</div>' + self.foursquareInfo ;

    google.maps.event.addListener(marker, 'click', function() {      
      infowindow.setContent(contentString);      
      infowindow.open(map, this);
      map.panTo(marker.position); 
      setTimeout(function(){marker.setAnimation(null);}, 1450);
    });

    markersArray.push(marker);
    return marker;
  }

  // Foursquare Credentials
  var clientID = 'B2X0F1HEEJ53N03UU4JM2NWU1TY5TAMELW2QPCSL2CSEKQQY';
  var clientSecret = 'C0GS2XJKGULAPMJZUJBHTMHKYQU413C40MYQP0RQZQ0FMSXR';

  this.getFoursquareInfo = function(point) {
    // creates a foursquare URL
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20150321' + '&ll=' +lat+ ',' +lng+ '&query=\'' +point.name +'\'&limit=1';
    
    // Downloads Foursquare info Asynchronously.  (Had to change this from $.getJSON to $.ajax for error handling)
    $.ajax(foursquareURL)
    .done(function(response) {  console.log('Foursquare Info Loaded Successfully!')
    .fail(function(jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus); })  
      self.foursquareInfo = '<p>Foursquare:<br>';
      var venue = response.response.venues[0];
         
      // Name and Error Handling     
      var venueName = venue.name;
          if (venueName !== null && venueName !== undefined) {
              self.foursquareInfo += 'Name: ' +
                venueName + '<br>';
          } else {
            self.foursquareInfo += 'Name: Not Found' + '<br>';
          } 
      // Phone Number and Error Handling    
      var phoneNum = venue.contact.formattedPhone;
          if (phoneNum !== null && phoneNum !== undefined) {
              self.foursquareInfo += 'Phone: ' +
                phoneNum + '<br>';
          } else {
            self.foursquareInfo += 'Phone: Not Found' + '<br>';  
          }
      });
  };  
 
  /*
  Infowindow for items clicked on the highlights list
  */
  self.clickMarker = function(place) {
    var marker;

    for(var e = 0; e < markersArray.length; e++) {      
      if(place.place_id === markersArray[e].place_id) { 
        marker = markersArray[e];
        break; 
      }
    } 
    self.getFoursquareInfo(place);         
    map.panTo(marker.position);   

    // Allows a 2000 ms delay for Foursquare async load
    setTimeout(function() {
      var contentString = '<div style="font-weight: bold">' + place.name + '</div><div>' + place.address + '</div>' + self.foursquareInfo;
      infowindow.setContent(contentString);
      infowindow.open(map, marker); 
      }, 2000);     
  };


  /*
  This pulls the information from places searched and then pushes the info to the allPlaces array.
  */
  function getLocations(place){
    var myPlace = {};    
    myPlace.place_id = place.place_id;
    myPlace.position = place.geometry.location.toString();
    myPlace.name = place.name;

    var address;    
    if (place.vicinity !== undefined) {
      address = place.vicinity;
    } else if (place.formatted_address !== undefined) {
      address = place.formatted_address;
    }
    myPlace.address = address;
    
    self.allPlaces.push(myPlace);                
  }
  
  /*
  Clears map markers
  */
  function resetMap() {
    for (var i = 0; i < markersArray.length; i++ ) {
     markersArray[i].setMap(null);
    }
    markersArray.length = 0;
  } 

  google.maps.event.addDomListener(window, 'load', initialize);
}

$(function(){
ko.applyBindings(new LocationModel());
});