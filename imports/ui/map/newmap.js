import './newmap.html';
// import '../../api/players.js';
import  {Players} from '../../api/players.js';

import {CHARACTERS} from '../characters/characters.js';
  var latLng;
  var marker;

Template.newmap.onCreated(function() { 
  //add a person with fake position in db
  Meteor.call('players.addFakePerson', {'lat': 49.2671844,'lng':-123.25237});
  //Meteor.call('players.addFakePerson', {'lat': 49.263003,'lng':  -123.179337}); //2656waterloo st

  self=this;
  self.autorun(function() {
      var profile = self.subscribe('profile',Meteor.userId()); //recover
      if (profile.ready()) {
        console.log("map subs ready>>");
        var index = Players.findOne({owner: Meteor.userId()}).selected;
        Session.set('curRoleIndex',index);
        if(marker)
          marker.setIcon({url: '/images/char/'+CHARACTERS[index]+'.png', scaledSize : new google.maps.Size(30, 95)});
      }
  });

  GoogleMaps.ready('map', function(map) {
    var intiaillatLng = Geolocation.latLng();
    var index = Session.get('curRoleIndex');
    //initilze player on map
    marker = new google.maps.Marker({
          icon: {url: '/images/char/'+CHARACTERS[index]+'.png', scaledSize : new google.maps.Size(30, 95)}, //customized
          position: intiaillatLng,
          map : map.instance
    });
    console.log("marker initial latlng is "+intiaillatLng);

    //update all players' location realtimely
    var watchID = navigator.geolocation.watchPosition(
      function(position) {onSuccess(position, map);}, 
      onError, 
      { timeout: 30000 }
    );


        //simulating moving target
        // //create moving target
        // var lineSymbol = {
        //   path: google.maps.SymbolPath.CIRCLE,
        //   scale: 8,
        //   strokeColor: '#393'
        // };
        // // Create the polyline and add the symbol to it via the 'icons' property.
        // var line = new google.maps.Polyline({
        //   path: [{lat: 22.291, lng: 153.027}, {lat: 18.291, lng: 153.027}],
        //   icons: [{
        //     icon: lineSymbol,
        //     offset: '100%'
        //   }],
        //   map: map.instance
        // });

        // animateCircle(line);

    //});
  });
});

//update all players' location on map. onSuccess() is triggered when up-to-date geolocation data received
function onSuccess(position,map) {

    console.log("geoposition successfully updated");
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
     strokeColor: "#fff",
     fillOpacity: 0,
     strokeWeight: 1.5,
   });
    circle.bindTo('center', marker, 'position');

    //create markers for any other players in a visible range
    var markersClick=[];
    var markers=[];
    Meteor.call('players.getTargetsinView', function(error, targets){
      if(error){
        console.log(error.reason);
        return;
      }
      console.log("targets count:"+targets.length);
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
          console.log("---->selected player is not in range");
        }
        // else 
        //   console.log("---->selected player is in range");
      }
      else //to rpevent p2Id session value loss after refresh
        turnOffAttackBtn();

      //disply all visible players on map
      for(i=0;i<targets.length;i++){
              //console.log("targets returns:"+JSON.stringify(targets[i]));
              if(!markers[i]){
                markers[i] = new google.maps.Marker({
                  position: new google.maps.LatLng(targets[i].position.lat, targets[i].position.lng),
                  map: map.instance,
                  icon: {url: '/images/char/char_male.png', scaledSize : new google.maps.Size(20, 55)}, 
                  name: targets[i]._id,
                  // animation: google.maps.Animation.DROP
                });

              }else{
               markers[i].setPosition(new google.maps.LatLng(targets[i].position.lat, targets[i].position.lng));
             }
           }
           markers.forEach(function(marker){
            google.maps.event.addListener(marker,'click',function() {
              if(marker){
                    //console.log("markers name in listener: " + marker.name);
                    Session.set("p2Id", marker.name);//marker.name is _id
                    //Meteor.call("players.setSelectedPlayerSession", marker.name); //pass playerid
                    turnOnAttackBtn(marker.name); 

                    //contribute to a retired idea
                    //var selectionId = Math.random();
                    //Session.set("lastestSelectionId",selectionId); 
                    //onSelected_splayer(selectionId);
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


    Template.newmap.helpers({  
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
        //mapTypeControl: false,
        // draggable: false,
        // scaleControl: false,
        // scrollwheel: false,
        // disableDefaultUI: true,
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




