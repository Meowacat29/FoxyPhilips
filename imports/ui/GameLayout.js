import './GameLayout.html';

Template.GameLayout.onCreated(function(){
	Session.set("map_status", "hidden");
	Session.set("loading_status", "shown");
	Session.set("menu_status", "hidden");
});

Template.GameLayout.helpers({
	menu_status:()=>{
		// if(Session.get("menu_status") == null){
		// 	if(localStorage.getItem('menu_status')){
		// 		Session.set("menu_status", localStorage.getItem('menu_status'));
		// 	}else{
		// 		localStorage.setItem('menu_status', "hidden");
		// 		Session.set("menu_status", "hidden");
		// 	}
		// }
		//console.log("menu_status"+Session.get("menu_status"));

		return Session.get("menu_status");
	},

	map_status:function(){
		// if(Session.get("map_status") == null){
		// 	if(localStorage.getItem('map_status')){
		// 		Session.set("map_status", localStorage.getItem('map_status'));
		// 	}else{
		// 		localStorage.setItem('map_status', "hidden");
		// 		Session.set("map_status", "hidden");
		// 	}
		// }
		//console.log("map_status"+Session.get("map_status"));

		return Session.get("map_status");
	},

	loading_status:()=>{
		// if(Session.get("loading_status") == null){
		// 	if(localStorage.getItem('loading_status')){
		// 		Session.set("loading_status", localStorage.getItem('loading_status'));
		// 	}else{
		// 		localStorage.setItem('loading_status', "shown");
		// 		Session.set("loading_status", "shown");
		// 	}
		// }
		//console.log("loading_status"+Session.get("loading_status"));
		return Session.get("loading_status");		
	},
});









