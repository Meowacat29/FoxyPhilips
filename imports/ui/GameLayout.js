import './GameLayout.html';

Template.GameLayout.onCreated(function(){
	Session.set("map_status", "hidden");
	Session.set("loading_status", "shown");
	Session.set("menu_status", "hidden");
});

Template.GameLayout.helpers({
	menu_status:()=>{
		return Session.get("menu_status");
	},

	map_status:function(){
		return Session.get("map_status");
	},

	loading_status:()=>{
		return Session.get("loading_status");		
	},
});









