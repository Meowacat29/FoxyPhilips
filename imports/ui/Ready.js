import  {Players} from '../api/players.js';
import '../api/players.js';
import './Ready.html';
import {set_ptr_to_next_component} from './Story.js';

Template.Ready.onCreated(function(){
	var self = this;
 	var handle = self.subscribe('profile',Meteor.userId());

 	Tracker.autorun(() => {
	  if(handle.ready()){
	  	var p1Role = Players.findOne({owner: Meteor.userId()}).role;
	  	console.log(p1Role);
		var p1RoleLevel = Players.findOne({owner: Meteor.userId()}).characters[p1Role].level;
		var p1RoleName = Players.findOne({owner: Meteor.userId()}).characters[p1Role].name;

		Session.set("p1RoleName", p1RoleName);
	  	Session.set("p1Level", Players.findOne({}).level);
	  	Session.set("p1Role", p1Role);
	  	Session.set("p1RoleLevel",p1RoleLevel);
	  	Session.set("coins",Players.findOne({}).goldCoin );
	  }
	 });
});

Template.Ready.helpers({
	char_ready_index:()=>{
		console.log("char_ready_" + Session.get("p1Role"));
		return "char_ready_" + Session.get("p1Role");
	},
	char_name:()=>{
		return Session.get("p1RoleName");
	},
	coins: ()=> {
		return Session.get("coins");
	},
	level: ()=> {
		return Session.get("p1Level");
	},
});

Template.Ready.events({
  "click .ready_prep":()=>{
  	set_ptr_to_next_component();
  }

});




