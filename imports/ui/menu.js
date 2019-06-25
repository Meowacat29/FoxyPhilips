import './Menu.html';

Template.GameLayout.events({
	'click .resume': () => {
		Session.set("menu_status", "hidden");
		localStorage.setItem("menu_status", "hidden");
	},
	'click .instruction': () => {
		document.getElementById("level1_menu").style.display = "none";
		document.getElementById("level2_menu_instruction").style.display = "block";
	},
	'click .quit': () => {
		//navigator.app.exitApp(); //cordova
	},
	'click #back':()=>{
		document.getElementById("level1_menu").style.display = "block";
		document.getElementById("level2_menu_instruction").style.display = "none";
	},
	'click #page_flipper1':()=>{
	  document.getElementById("part1").style.visibility = 'hidden';
	  document.getElementById("part2").style.visibility = 'visible';
	},
	'click #page_flipper2':()=>{
	  document.getElementById("part1").style.visibility = 'visible';
	  document.getElementById("part2").style.visibility = 'hidden';
	}

});