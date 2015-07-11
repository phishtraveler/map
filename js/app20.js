/*  Jevon Grimes FEWD November Cohort
Neighborhood Map Project Revision #2
*/

var viewModel = { 
  locations : ko.observableArray([ 


    // Highlights of the French Quarter in New Orleans
    // Google Street View Api Key   AIzaSyD0lABvSyD76CFiptJA95JKC56uwp6-RSM
    {
      name: "Cafe Du Monde",
      street: "800 Decatur Street",
      city: "New Orleans",
      zip: "70116",
      latlng: [29.957507, -90.061799],
      category: Food,
      show: ko.observable(true),
      //url: "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=29.957507, -90.061799&key=AIzaSyD0lABvSyD76CFiptJA95JKC56uwp6-RS-sVXrows",
    },
    {
      name: "Preservation Hall",
      street: "726 St. Peter Street",
      city: "New Orleans",
      zip: "70116",
      latlng: [29.958285, -90.065384],
      category: Music
      show: ko.observable(true),
    },
    {
      name: "House of Blues New Orleans",
      street: "225 Decatur Street",
      city: "New Orleans",
      zip: "70130"
      latlng: [29.953340, -90.066193],
      category: Music
      show: ko.observable(true),
    },
    {
      name: "Antoine's Restaurant",
      street: "713 St. Louis Street",
      city: "New Orleans",
      zip: "70130",
      latlng: [29.956717, -90.066405],
      category: Food,
      show: ko.observable(true),
    },  
    {
      name: "Oceana Grill",
      street: "739 Conti Street",
      city: "New Orleans",
      zip: "70130",
      latlng: [29.956252, -90.067642],
      category: Food,
      show: ko.observable(true),
    },
    {
      name: "Broussard's Restaurant",
      street: "819 Conti Street",
      city: "New Orleans",
      zip: "70112",
      latlng: [29.956638, -90.068062],
      category: Food,
      show: ko.observable(true),
    },
    {
      name: "Pat O'Brien's",
      street: "718 St. Peter Street",
      city: "New Orleans",
      zip: "70116",
      latlng: [29.958203, -90.065202],
      category: Tavern,
      show: ko.observable(true),
    },
    {
      name: "Gumbo Shop",
      street: "630 St. Peter Street",
      city: "New Orleans",
      zip: "70116",
      latlng: [29.957730, -90.064519],
      category: Food,
      show: ko.observable(true),
    },
    {
      name: "Brennans",
      street: "417 Royal Street",
      city: "New Orleans",
      zip: "70130",
      latlng: [29.956158, -90.066623],
      category: Food,
      show: ko.observable(true),
    },
    {
      name: "Acme Oyster House",
      street: "724 Iberville Street",
      city: "New Orleans",
      zip: "70130",
      latlng: [29.954326, -90.068957],
      category: Food,
      show: ko.observable(true),
    {
      name: "LaFitte's Blacksmith Shop Nar",
      street: "941 Bourbon Street",
      city: "New Orleans",
      zip: "70116"
      latlng: [29.961037, -90.063648],
      category: Tavern,
      show: ko.observable(true),
    }
  ]
)
};

   
  //Knockout's ViewModel

  var bouncingMarker = null; //global variable setting initial bounce of marker to null--for togglebounce functionality 

 
  function initialize() { 
    var myLatlng = new google.maps.LatLng(29.955899, -90.065224); 
    var mapOptions = { 
       zoom: 16, 
       center: myLatlng 
    }; 
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);//creates map 
      setMarkers(map, viewModel.locations()); 
}//close initialize function 

 
//Functions and variables used to display individual location markers and infowindow content 
var infoWindow = new google.maps.InfoWindow(); 
function setMarkers(map, locations){ 
  locations.forEach(function(location, index){ 
    if (location.show()){ 
      //infowindow content 
      var contents = '<h3 id="firstHeading" class="firstHeading">' + location.name + '</h1>' +  '<em>' + location.stars  + ' '+ ' ' + 'Stars' + '</em>' + '<h4>' + location.street + ',' +' '+ location.city + ',' +' '+ 'CO' + ' ' + location.zip + '</h4>' + '<a href="' + location.url + '">' + 'Street View </a>'; 
      //foursquare api url 
      var fsLink = 
      "https://api.foursquare.com/v2/venues/search?client_id=B2X0F1HEEJ53N03UU4JM2NWU1TY5TAMELW2QPCSL2CSEKQQY&client_secret=C0GS2XJKGULAPMJZUJBHTMHKYQU413C40MYQP0RQZQ0FMSXR="+ location.lat + "," + location.lng + "&query=" + location.name; 
      var latlong = new google.maps.LatLng(location.lat, location.lng); 
 
      var venues = ""; 
      //ajax call to display foursquare api & includes error handling 
      $.ajax({ 
        url: fsLink, 
        dataType: "jsonp", 
      success: function(response){ 
        venues = response.response.venues[0]; 
        contents = contents + "Foursquare Phone:" + " " + venues.contact.formattedPhone; 
          }, 
      error: function(jqXHR, status, error){ 
        contents = contents + "Sorry, we cannot find a phone number for" + " " + location.name +" " + "at this time."; 
       } 
      });//close .ajax 

        //create our map markers 
        var marker = new google.maps.Marker({ 
        position: latlong,
        icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
        animation: google.maps.Animation.DROP,
        map: map,
        title: location.name,
        url: location.url,
        });


      //set toggleBounce function 
      google.maps.event.addListener(marker, 'click', toggleBounce); 
      function toggleBounce() { 
        if (marker.getAnimation() !== null) { 
          marker.setAnimation(null); 
        } 
        else { 
          marker.setAnimation(google.maps.Animation.BOUNCE); 
          setTimeout(function() { 
            marker.setAnimation(null); 
            }, 3000); 
        } 
      }//close toggleBounce function 
 
    var clickListener = function() { //add clicklistner function to address if marker is bouncing or not 
        if(bouncingMarker) 
             bouncingMarker.setAnimation(null); 
        if(bouncingMarker != this) { 
            this.setAnimation(google.maps.Animation.BOUNCE); 
            bouncingMarker = this; 
        } else 
            bouncingMarker = null; 
    };//close clickListener function 


    google.maps.event.addListener(marker, 'click', clickListener); //for togglebounce 
    google.maps.event.addListener(marker, 'click', (function(marker) { 
        return function(){ 
          infoWindow.setContent(contents); 
          infoWindow.open(map, this); 
          }; 
        })(marker)); 
 
    }//close if statement in setMarkers function 
  });//close locations.forEach function 
}//close setMarker function 
 
google.maps.event.addDomListener(window, 'load', initialize); 
//function to update locations list and map markers based on selected star value from select box--search functionality 
$("#ratings").change(function(){ 
  var val = $("#ratings").val(); 
  viewModel.locations().forEach(function(location, index){ 
    if (location.stars==val){ 
      location.show(true); 
    } 
    else{ 
      location.show(false); 
    } 
  }); 
  initialize(); 
}); 
 
 
//View// 
function ViewModel() { 
  var self = this; 
} 
// Activates knockout.js 
ko.applyBindings(viewModel); 
});