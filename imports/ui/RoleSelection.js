import './RoleSelection.html';
import  {Players} from '../api/players.js';
import '../api/players.js';
import {CHARACTERS} from './commons/commons.js';
import {set_ptr_to_next_component} from './Story.js';

Template.RoleSelection.onCreated(function(){
  //Meteor.call('players.remove',Meteor.userId());
  // console.log("remove any other players with this userId");
  //console.log("before insert");
  //Meteor.call('players.countPlayers');691.8688354492188 478.4449045835063
  Meteor.call('players.clearData'); //clear all player records

  Meteor.call('players.addFakePerson', {'lat': 49.2118,'lng':  -123.1158});
  Meteor.call('players.addFakePerson', {'lat': 49.211,'lng':  -123.115}); 
  Meteor.call('players.addFakePerson', {'lat': 49.2676,'lng':  -123.2529}); 
  Meteor.call('players.addFakePerson', {'lat': 49.2670,'lng':  -123.252});
  //var handle = this.subscribe('profile',Meteor.userId());

});

Template.RoleSelection.events({
  "click .role_prep":()=>{
    var id = event.target.closest('.role_prep').getAttribute('id');
    id = id + "_box";
    //display select box for currently selected character, undisplay select box for the rest
    if(document.getElementsByClassName("selected_box")[0]){
      document.getElementsByClassName("selected_box")[0].classList.remove("selected_box");
    }
    document.getElementById(id).classList.add("selected_box");

    //
    var name = document.getElementsByClassName("selected_box")[0].getAttribute('name');
    Session.set("selected_role_prep", name);

  },

  'click .ok_role_prep':()=>{
    if(Session.get('selected_role_prep')){
      var name = Session.get("selected_role_prep");
      if(!name) return;
      //create a new player record with a selected role
      Meteor.call('players.insert', name);

      set_ptr_to_next_component();
    }
    //console.log("after insert player")
    //Meteor.call('players.countPlayers');

  },

})

