import './map.html';
import  {Players} from '../../api/players.js';
import {CHARACTERS} from '../commons/commons.js';

var latLng;
var marker;

//initilize a list of markers for any other players in a visible range
var markersClick=[];
var markers=[];

var arcadeclassic = new FontFace('arcadeclassic', 'url(/fonts/ARCADECLASSIC.ttf)');

function set_map_ready(){
    localStorage.setItem('map_status','shown');
    Session.set('map_status','shown');
    localStorage.setItem('loading_status','hidden');
    Session.set('loading_status','hidden');
}

Template.map.onCreated(function() { 
  self=this;
  self.autorun(function() {
      var profile = self.subscribe('profile',Meteor.userId());
      if (profile.ready()) {
        var index = Players.findOne({owner: Meteor.userId()}).role;
        Session.set('curRoleIndex',index);
        if(marker)
          marker.setIcon({url: '/images/char/'+CHARACTERS[index]+'.png', scaledSize : new google.maps.Size(30, 95)});
      }
  });

  GoogleMaps.ready('map', function(map) {
    //set map status when map is ready
    set_map_ready();

    var intiaillatLng = Geolocation.latLng();
    var index = Session.get('curRoleIndex');
    //initilze player on map
    marker = new google.maps.Marker({
          icon: {url: '/images/char/'+CHARACTERS[index]+'.png', scaledSize : new google.maps.Size(30, 95)}, //customized
          position: intiaillatLng,
          map : map.instance
    });

    //update all players' location realtimely
    var watchID = navigator.geolocation.watchPosition(
      function(position) {onSuccess(position, map);}, 
      onError, 
      { timeout: 30000 }
    );


  });
     Meteor.call('players.countPlayers');

});

//update all players' location on map. onSuccess() is triggered when up-to-date geolocation data is received
function onSuccess(position,map) {
    console.log("geoposition updated");
    let lng = position.coords.longitude;
    let lat = position.coords.latitude;

    latLng = new google.maps.LatLng(lat, lng);

    //update current positions in database
    Meteor.call('players.updatePosition',lat,lng);
    marker.setPosition(latLng);

    //create circle around player1
    var circle = new google.maps.Circle({
     map : map.instance,
     radius: 400, 
     strokeColor: "#E0FFFF",
     fillOpacity: 0,
     strokeWeight: 1,
   });
    circle.bindTo('center', marker, 'position');

//=======================last try
  // var topRight = map.instance.getProjection().fromLatLngToPoint(map.instance.getBounds().getNorthEast());
  // var bottomLeft = map.instance.getProjection().fromLatLngToPoint(map.instance.getBounds().getSouthWest());
  // var scale = Math.pow(2, map.instance.getZoom());
  // var worldPoint = map.instance.getProjection().fromLatLngToPoint(latLng);
  // var x = (worldPoint.x - bottomLeft.x) * scale;
  // var y = (worldPoint.y - topRight.y) * scale;
  // console.log(x +" "+ y);

  // var element = document.getElementById("test");
  // element.style.left = x + "px";
  // element.style.top = y + "px";

  // google.maps.event.addListener(map.instance,'idle', function () {
  //   //=============================================
  //   var projection = map.instance.getProjection();
  //   var markerLocation = marker.getPosition();
  //   var screenPosition = projection.fromLatLngToPoint(markerLocation);
  //   console.log("=============");
  //   console.log(screenPosition);

  // var element = document.getElementById("test");
  // element.style.left = screenPosition.x + "px";
  // element.style.top = screenPosition.y + "px";
  // //=============================================

  // });


    Meteor.call('players.getTargetsinView', function(error, targets){
      if(error){
        console.log(error.reason);
        return;
      }
      console.log("there are "+targets.length +" targets");
      // console.log(JSON.stringify(targets));

      //check if a currently selected player (if any) is within a attackable range/circle
      selectedPlayerId = Session.get("p2Id");
      inrange = false;
      if (selectedPlayerId){
        for(i=0;i<targets.length;i++){
          if(targets[i]._id === selectedPlayerId)
            inrange = true;
        }
        if (!inrange){ //selected player walk off the range/circle
          turnOffAttackBtn();
        }
      }
      else //to rpevent p2Id session value loss after refresh
        turnOffAttackBtn();

      //disply all visible players on map
      for(i=0;i<targets.length;i++){
        if(!markers[i]){
          var level = targets[i].level;
          markers[i] = new google.maps.Marker({
            position: new google.maps.LatLng(targets[i].position.lat, targets[i].position.lng),
            map: map.instance,
            icon: {url: '/images/char/char.png', scaledSize : new google.maps.Size(20, 55)}, 
            name: targets[i]._id,
            label: {text: "lv"+level, color: "DarkGoldenRod ", fontSize: "15px", fontFamily:"arcadeclassic"},
          });
        }else{
             markers[i].setPosition(new google.maps.LatLng(targets[i].position.lat, targets[i].position.lng));
        }
      }
           
      markers.forEach(function(marker){
        google.maps.event.addListener(marker,'click',function() {
         if(marker){
            Session.set("p2Id", marker.name);//marker.name is _id
            //Meteor.call("players.setSelectedPlayerSession", marker.name); //pass playerid
            if(Session.get(marker.name) == 'locked'){
              turnOffAttackBtn(marker.name); 
            }else{
              turnOnAttackBtn(marker.name); 
            }
            //update the image of selected marker (could be slow when there are too many targets in view --TODO improve)
            markers.forEach(function(mm){
              mm.setIcon({url: '/images/char/char.png', scaledSize : new google.maps.Size(20, 55)});
            });
            marker.setIcon({url: '/images/char/char_selected.png', scaledSize : new google.maps.Size(20, 55)}); 
          }
        });
      });

      //clean the markers that no longer need
      if(targets.length < markers.length){
        for(bound=targets.length; bound<markers.length;bound++){
          markers[bound+1]=null;
        }
      }

    }.bind(this));
  }

  makePlayerTransparent = function (userId){
        markers.forEach(function(marker){
          if(marker.name == userId)
              marker.setOpacity(0.5);
        });
  };

  makePlayerOpaque = function (userId){
          markers.forEach(function(marker){
          if(marker.name == userId)
              marker.setOpacity(1.0);
        });
  };

  function onError(error) {
    console.log("ERROR: geolocation update error");
  }

    // Use the DOM setInterval() function to change the offset of the symbol
    // at fixed intervals.
    function animateCircle(line) {
      var count = 0;
      window.setInterval(function() {
        count = (count + 1) % 200;

        var icons = line.get('icons');
        icons[0].offset = (count / 2) + '%';
        line.set('icons', icons);
      }, 20);
    }


    Template.map.helpers({  
      geolocationError: function() {
        var error = Geolocation.error();
        return error && error.message;
      },
      mapOptions: function() {
        var latLng = Geolocation.latLng();

        if (GoogleMaps.loaded() && latLng) {
          return {
            center: new google.maps.LatLng(latLng.lat+0.004, latLng.lng),
            zoom: 15,
        ////Enable following...
        mapTypeControl: false,
        draggable: false,
        scaleControl: false,
        scrollwheel: false,
        disableDefaultUI: true,
        styles: [
        {
          "elementType": "labels",
          "stylers": [
          {
            "visibility": "off"
          }
          ]
        },
        {
          "featureType": "landscape",
          "stylers": [
          {
            "color": "#c9e2d2"
          },
          {
            "weight": 5
          }
          ]
        },
        {
          "featureType": "poi",
          "stylers": [
          {
            "color": "#cae2d2"
          }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [
          {
            "color": "#eceeea"
          },
          {
            "weight": 20
          }
          ]
        },
        {
          "featureType": "road.local",
          "stylers": [
          {
            "visibility": "off"
          }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
          {
            "color": "#bfe1e2"
          },
          {
            "weight": 8
          }
          ]
        }
] //style ends

};
}
}
});




