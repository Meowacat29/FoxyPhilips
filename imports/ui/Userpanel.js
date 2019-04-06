import  {Players} from '../api/players.js'; 
import '../api/players.js';
import './Userpanel.html';
import './GameLayout.html';

import {CHARACTERS} from './characters/characters.js';
import {SKILLS} from './characters/characters.js';

var WINNER_REWARD = 100;
var p1Role;
var p1RoleLevel;
var p2Role;
var p2RoleLevel;
var p2Id;
const MAX_ROLES = 4;
const PENALTY = 10;

//subscribe to current user player info reactivley 
Template.Userpanel.onCreated(function(){
	var self = this;
	self.autorun(function() {
		var profile1 = self.subscribe('profile',Meteor.userId());
	    if (profile1.ready()) {
	    	p1Role = Players.findOne({owner: Meteor.userId()}).selected;
	    	p1RoleLevel = Players.findOne({owner: Meteor.userId()}).characters[p1Role].level;
	    	Session.set('p1Role', p1Role);
			Session.set('p1RoleLevel', p1RoleLevel);
	    }
	});
	console.log(Meteor.userId());
});

	//subscribe to selected Player info reactively
	Tracker.autorun(function() {
		p2Id = Session.get('p2Id');
		if(p2Id){
			var handler = Meteor.subscribe('selectedPlayer', p2Id);

			if(handler.ready()){
				var data = Players.find().fetch();//new
				p2Role = Players.findOne({_id: p2Id}).selected;
				p2RoleLevel=Players.findOne({_id: p2Id}).characters[p2Role].level;

				Session.set('p2Name', Players.findOne({_id: p2Id}).username);
				Session.set('p2Level', Players.findOne({_id: p2Id}).level);
				Session.set('p2Role', p2Role);
				Session.set('p2RoleLevel',p2RoleLevel) ;
				// console.log('in userpanel p2: call count->')
				// Meteor.call('players.countPlayers');
			}	
		}
	});


Template.Userpanel.helpers({
	p2Name: function(){
		return Session.get('p2Name');
	},
	p2Level: ()=>{
		return Session.get("p2Level"); 
	},
	user: ()=>{
		 Meteor.call('players.countPlayers');
		console.log(Players.find({}).fetch().length);
		return Players.findOne({owner: Meteor.userId()});
	},
	position:()=>{
		return JSON.stringify(Players.findOne({owner: Meteor.userId()}).position);
	},
	role: (index) =>{
		return Players.findOne({owner: Meteor.userId()}).characters[index].name;
	},
	badge: function(index){
		return (Players.findOne({owner: Meteor.userId()}).characters[index] ? "badge"+Players.findOne({owner: Meteor.userId()}).characters[index].level:"");
	},
	isable: function(index){
		if(Players.findOne({owner: Meteor.userId()}).characters[index].level != -1){
			return 'abled';
		}else return 'unabled';
	},

	// isSelected: function(index){
	// 	var isSelected;
	// 	if(Players.findOne({owner: Meteor.userId()}).characters[index] && (Players.findOne({owner: Meteor.userId()}).selected == index)){
	// 		isSelected ='selected';
	// 	}
	// 	return isSelected;
	// },
	// selectedRolelevel: ()=>{
	// 	return Players.findOne({owner: Meteor.userId()}).selected;
	// },
	// roleLevel: (index)=>{
	// 	return (Players.findOne({}).characters[index] ? ("lv"+ Players.findOne({}).characters[index].level):"" );
	// },
	star:(index)=>{
		var count = (Players.findOne({owner: Meteor.userId()}).characters[index] ? Players.findOne({owner: Meteor.userId()}).characters[index].level:0);
		var eles="";
		for(i=0;i<count;i++){
			eles += "<div class=" +"'star'"+"></div>";
		}
		return new Handlebars.SafeString(eles);
	},
	skill:(index)=>{
		return (Players.findOne({owner: Meteor.userId()}).skills[index] ? Players.findOne({owner: Meteor.userId()}).skills[index].name:null);
	},
	//display the curtain when a player is selected
	curtain:(index)=>{
		// if(!Session.get("p1Role")){
		// 	if(Players.findOne({owner: Meteor.userId()}).characters[index].level != -1){
		// 		Session.set("p1Role",index);
		// 		return;
		// 	}
		// }
		// else if(Session.get("p1Role") == index)
		// 	return "curtain_display";
		// return "curtain_none";	

		//on refresh, session get lost	
		if(Players.findOne({owner: Meteor.userId()}).selected == index){
			return "curtain_display";
		}

		return "curtain_none";
	},
	skillBtn_state:()=>{
		// note: godeye and godeye-xtra require a target selected
		sIndex = Session.get('selectedSkill');
		if(!sIndex)
			return 'skillBtn_disabled';

		var skill = document.getElementById(sIndex).classList[0];
		//hardcode skill name
		if(skill == "GODSEYE" || skill == "GODSEYE-ADVANCE"){
			if(Session.get('p2Id'))
				return 'skillBtn';
			else
				return 'skillBtn_disabled';
		}else return 'skillBtn';
	}

});



Template.Userpanel.events({
	//switch role
	'click .abled': () => {
		var index = event.target.closest('.abled').getAttribute('name');
		Meteor.call('players.switchRole', index);
		Session.set('p1Role', index);
		var p1RoleLevel= Players.findOne({owner: Meteor.userId()}).characters[index].level;
		Session.set('p1RoleLevel',p1RoleLevel);
	},
	'click .upgrade':(index, value)=>{
		console.log("upgrade!");  
		Meteor.call('players.updateLevel',2,-1);
	},
	'click .insert':(index)=>{
		console.log("insert!");
		Meteor.call('players.insertRole', 1);
	},
	'click .ready':(index)=>{ //attack
		//Meteor.call('players.insertRole', 2);
		console.log("attack!");
		attack();
	},
	'click .skill':()=>{
		if(event.target.classList[0]=="base") //empty spot
			Session.set('selectedSkill',null);
		else{
			htmlsIndex = event.target.id;
			Session.set('selectedSkill',htmlsIndex);
		}
	},
	'click .insertSkill':(index)=>{
		addSkill(1);
	},
	'click .goLucySpin':()=>{
		//tonggle page view to lucky spin
		document.getElementsByClassName("display")[0].classList.add("layout_luckySpin");
		document.getElementsByClassName("display")[0].classList.remove("layout_main");
	},
	'click .skillBtn':()=>{
		htmlsIndex = Session.get('selectedSkill');
		// if(!htmlsIndex)
		// 	console.log("ERRPR: no skill selected or selected skill dne");
		
			Meteor.call('players.findSkillatIndex', htmlsIndex, function(error, sName) {
			    applySkill(sName);
			});

			Session.set('selectedSkill',null);
			Meteor.call('players.removeSkill',htmlsIndex);
			
	}

});


turnOffAttackBtn=function(){
	//switch targetBtn to unready mode
	document.getElementsByClassName("targetBtn")[0].classList.add("unready");
	document.getElementsByClassName("targetBtn")[0].classList.remove("ready");
};

turnOnAttackBtn = function (){
	//display selected Player info
	document.getElementsByClassName("selectedPlayerInfo")[0].style.display="inline";

	//switch targetBtn to ready mode
	document.getElementsByClassName("targetBtn")[0].classList.add("ready");
	document.getElementsByClassName("targetBtn")[0].classList.remove("unready");

};

//this block of code implements a retired idea of counting n seconds before targetBtn turns off
// onSelected_splayer = function (selectionId){
// 	//display selected Player info
// 	document.getElementsByClassName("selectedPlayerInfo")[0].style.display="inline";

// 	//set target to ready mode
// 	document.getElementsByClassName("targetBtn")[0].classList.add("ready");
// 	document.getElementsByClassName("targetBtn")[0].classList.remove("unready");

// 	Meteor.setTimeout(()=>{
// 		if(Session.get("lastestSelectionId") == selectionId){
// 			// selected Player info expire
// 			document.getElementsByClassName("selectedPlayerInfo")[0].style.display="none";
// 			// target ready mode expire
// 			document.getElementsByClassName("targetBtn")[0].classList.add("unready");
// 			document.getElementsByClassName("targetBtn")[0].classList.remove("ready");
// 		}
// 	}, 7000);
// };

function prune1(){
	p2role = Session.get('p2Role');
   	var random = Math.floor(Math.random() * MAX_ROLES); 
   	while (random == p2role){
  		random = Math.floor(Math.random() * MAX_ROLES); 
   	}
   	console.log("GOSEYE: your opopnent is not a "+CHARACTERS[random]);
}

function prune2(){
    p2role = Session.get('p2Role');
    //TODO: 4 is hardcoded for number of roles
    var random1 = 0;
    var random2 = 0; 
    while (random1 == p2role || random2 == p2role || random1 == random2){
    	random1 = Math.floor(Math.random() * MAX_ROLES); 
    	random2 = Math.floor(Math.random() * MAX_ROLES);
    }
    console.log("GODSEYE-ADVANCE: your opopnent is not one of: "+  CHARACTERS[random1] +" "+CHARACTERS[random2]);
}

function applySkill(skill){
	console.log("apply "+skill);

	switch(skill) {

		//GODSEYE prune a incorrect role for player
	    case "GODSEYE": //target, immediate
	    	prune1();
	        break;

		//GODSEYE-ADVANCE prune 2 incorrect roles for player
	    case "GODSEYE-ADVANCE": 
	    	prune2();
	        break;

	    case "HIDE": //no target, last 5 min
	    	//TODO: make player darker, remove player from other people's screen.
	       marker.visible = false;
	       break;

	    case "SCAN": //no target, immediate
	       
	        break;

	    case "POWER-MAX": //no target, last 30sec
	       Meteor.call('players.power_to_max');
	       Meteor.setTimeout(()=>{
	       		Meteor.call('players.power_recover');
			}, 30000);
	        break;

	    case "ATTACK-MAX": //no target, last 5 min
	       
	        break;

	    case "CHEAT": //no target, last 5 mins
	       
	        break;

	    default:
	    	console.log("ERROR: illegal skill");
	}
}

function attack(){

	console.log(CHARACTERS[p1Role]+":"+p1RoleLevel+" VS "+CHARACTERS[p2Role]+":"+p2RoleLevel); 

	//decide winner
	var result = battle(p1Role,p1RoleLevel,p2Role,p2RoleLevel);
	//TODO
	if(result == 1){
		//celebrate
	}else if(result == 2){
		//cry
	}else{
		//no emotion, draw
		return;
	}

	//calculate winner reward weight
	var reward = computeReward(result, p1RoleLevel, p2RoleLevel);
	var penalty = PENALTY;
	reward_and_penalize(result, reward, penalty);

	console.log("result: "+result);
	console.log("reward: "+reward);
}

function reward_and_penalize(result, reward, penalty){
	if(result==1){ 
		//player wins
		Meteor.call('players.addCoins', Meteor.userId(),reward);
		Meteor.call('players.reduceCoins', Players.findOne({_id: p2Id}).owner,penalty);
	}
	else if(result==2){ 
		//player loses
		Meteor.call('players.addCoins', Players.findOne({_id: p2Id}).owner,reward);
		Meteor.call('players.reduceCoins', Meteor.userId(),penalty);
	}
}


function computeReward(result, lev1, lev2){
	var ratio = 10;
	var winner_lev = 0;
	var loser_lev = 0;

	if(result==1){
		winner_lev = lev1;
		loser_lev = lev2;
	}
	else if(result==2){
		winner_lev = lev2;
		loser_lev = lev1;
	}

	var weight = 1 + (loser_lev - winner_lev)/ratio;
	var reward = WINNER_REWARD * weight;
	
	return reward;
}

// decide the winner of a battle
function battle(ind1,lev1,ind2,lev2){
	var diff = MAX_ROLES - 1;
	//apply the rule of role countering, as a result adjusting the levels of both sides.
	if(ind1 + 1 == ind2 || ind1 - diff == ind2) //the player's role beats the opponent's role
		lev1 = lev1+2;
	else if(ind2 + 1 == ind1 || ind2 - diff == ind1) //the opponent's role beats the player's role
		lev2 = lev2 + 2;

	if(lev1>lev2) //player wins
		return 1;
	else if(lev1==lev2) //draw
		return 0;
	else if (lev1<lev2) //opponent wins
		return 2;
}

//add new skill to player
function addSkill(SIndex){
	Meteor.call('players.addSkill',SIndex);
}












