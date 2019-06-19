import  {Players} from '../api/players.js'; 
import './ControlPanel.html';
import './GameLayout.html';
import {CHARACTERS} from './commons/commons.js';
import {SKILLS} from './commons/commons.js';

var WINNER_REWARD = 100;
var p1Role;
var p1RoleLevel;
var p2Role;
var p2RoleLevel;
var p2Id;
const MAX_ROLES = CHARACTERS.length;
const PENALTY = 10;
var MAX_LEVEL = 4;
const NUM_COINS_PER_VENTURE = 100;
const CHEAT_TIMER_COUNTDOWN_FROM = 121;
const CHEAT_TIMER = "cheat_timer";
const POWER_TIMER_COUNTDOWN_FROM = 31;
const POWER_TIMER = "power_timer";
const CONTINOUS_ATTACK_INTERVEL = 10;

//subscribe to current user player info reactivley 
Template.ControlPanel.onCreated(function(){
	var self = this;
	self.autorun(function() {
		var profile1 = self.subscribe('profile',Meteor.userId());
	    if (profile1.ready()) {
	    	p1Role = Players.findOne({owner: Meteor.userId()}).role;
	    	p1RoleLevel = Players.findOne({owner: Meteor.userId()}).characters[p1Role].level;
	    	Session.set('p1Role', p1Role);
			Session.set('p1RoleLevel', p1RoleLevel);
	    }
	});
	console.log(Meteor.userId());
});

Template.GameLayout.events({
	'click': function () {
		removeMessages();
  	}
});

//remove all messages from screen
//(for win/lose/draw message) a lock is used to prevent from removing the message when we attempt to trigger it. there are 3 status(lock, hold, free) for the lock
function removeMessages(){
	//remove note message
	document.getElementById("notePopup1").classList.remove("notePopup1");
	document.getElementById("notePopup2").classList.remove("notePopup2");

	//remove win/lose/draw message
	var status = Session.get("onMessage");
	if(status == "lock"){
		Session.set("onMessage", "hold");
	}else if(status == "hold"){
		document.getElementById("winPopup1").classList.remove("winPopup1");
	  	document.getElementById("winPopup2").classList.remove("winPopup2");
	  	document.getElementById("drawPopup").classList.remove("drawPopup");
	  	document.getElementById("losePopup").classList.remove("losePopup");
	  	Session.set("onMessage", "free");
	}
}

	//subscribe to selected Player info reactively
	Tracker.autorun(function() {
		p2Id = Session.get('p2Id');
		if(p2Id){
			var handler = Meteor.subscribe('selectedPlayer', p2Id);

			if(handler.ready()){
				var data = Players.find().fetch();//new
				p2Role = Players.findOne({_id: p2Id}).role;
				console.log("p2RoleSUBS"+p2Role);
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

Template.ControlPanel.helpers({
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
	// role: (index) =>{
	// 	return Players.findOne({owner: Meteor.userId()}).characters[index].name;
	// },
	badge: function(index){
		return (Players.findOne({owner: Meteor.userId()}).characters[index] ? "badge"+Players.findOne({owner: Meteor.userId()}).characters[index].level:"");
	},
	isable: function(index){
		if(Players.findOne({owner: Meteor.userId()}).characters[index].level != 0){
			return 'abled';
		}else return 'unabled';
	},

	// isSelected: function(index){
	// 	var isSelected;
	// 	if(Players.findOne({owner: Meteor.userId()}).characters[index] && (Players.findOne({owner: Meteor.userId()}).role == index)){
	// 		isSelected ='selected';
	// 	}
	// 	return isSelected;
	// },
	// selectedRolelevel: ()=>{
	// 	return Players.findOne({owner: Meteor.userId()}).role;
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
	skillName:()=>{
		var sIndex = Session.get("selectedSkill");
		if(!sIndex)
			return null;
		else 
			return "-"+document.getElementById(sIndex).classList[0]+"-";
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
		if(Players.findOne({owner: Meteor.userId()}).role == index){
			return "curtain_display";
		}

		return "curtain_none";
	},
	skillBtn_state:()=>{
		// note: godeye and godeye-xtra require a target selected
		sIndex = Session.get('selectedSkill');
		if(!sIndex)
			return 'skillBtn_disabled';
		console.log("sindex"+sIndex);

		var skill = document.getElementById(sIndex).classList[0];
		//hardcode skill name
		if(skill == "GODSEYE" || skill == "GODSEYE-X"){
			if(Session.get('p2Id'))
				return 'skillBtn';
			else
				return 'skillBtn_disabled';
		}else return 'skillBtn';
	},

	notes:()=>{
		return Session.get('notes');
	},
	cheat_timer:()=>{
		return Session.get(CHEAT_TIMER);
	},
	power_timer:()=>{
		return Session.get(POWER_TIMER);
	},
	cheat_timer_status:()=>{
		return Session.get(CHEAT_TIMER)== null ? "display_none":"display_inline";
	},
	power_timer_status:()=>{
		return Session.get(POWER_TIMER)== null ? "display_none":"display_inline";
	},

});



Template.ControlPanel.events({
	//switch role
	'click .abled': () => {
		var index = event.target.closest('.abled').getAttribute('name');
		Meteor.call('players.switchRole', index);
		Session.set('p1Role', index);
		var p1RoleLevel= Players.findOne({owner: Meteor.userId()}).characters[index].level;
		Session.set('p1RoleLevel',p1RoleLevel);
	},
	// 'click .upgrade':(index, value)=>{
	// 	console.log("upgrade!");  
	// 	Meteor.call('players.insertRole',index);
	// },
	// 'click .insert':(index)=>{
	// 	console.log("insert!");
	// 	Meteor.call('players.insertRole', 1);
	// },
	// 'click .insertSkill':(index)=>{
	// 	Meteor.call('players.addSkill',1);
	// },

	'click .ready':(index)=>{ //attack
		//uremove attackMax icon on the dashboard
		if(Session.get('attackMax') == true){
			document.getElementById("board_attackMax").style.display = "none";
		}
		
		document.getElementById('attack_text').classList.add('attack_text');
		Meteor.setTimeout(()=>{
			document.getElementById('attack_text').classList.remove('attack_text');
		}, 1000);


		attack();
	},
	'click .skill':()=>{
		if(event.target.classList[0]=="base") //empty spot
			Session.set('selectedSkill',null);
		else{
			var htmlsIndex = event.target.id;
			Session.set('selectedSkill',htmlsIndex);

			//TODO
			for(var i = 0; i < 9; i++){ //9 for num of skill pots
				if(htmlsIndex ==  i)
					document.getElementById(i).classList.add("select");
				else
					document.getElementById(i).classList.remove("select");
			}
		}
	},


	'click .skillBtn':()=>{
		var htmlsIndex = Session.get('selectedSkill');
		// if(!htmlsIndex)
		// 	console.log("ERRPR: no skill selected or selected skill dne");
		
			Meteor.call('players.findSkillatIndex', htmlsIndex, function(error, sName) {
			    applySkill(sName);
			});

			Session.set('selectedSkill',null);
			Meteor.call('players.removeSkill',htmlsIndex);
			
	},
	'click .venture':()=>{
		venture();
	},
	'click .menu_button':()=>{
		open_menu();
	}
});

function open_menu(){
	Session.set("menu_status", "shown");
	localStorage.setItem("menu_status", "shown");
}

turnOffAttackBtn=function(){
	//switch targetBtn to unready mode
	document.getElementsByClassName("targetBtn")[0].classList.add("unready");
	document.getElementsByClassName("targetBtn")[0].classList.remove("ready");
};

turnOnAttackBtn = function (){
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

function venture(){
	//try reducing an amount of coins
	Meteor.call('players.reduceVentureCoins', NUM_COINS_PER_VENTURE, (error, result) => {
		if(error){
  			console.log(error);
  			return;
  		}else{
  			if(!result){
  				//no enough coins TODO
  				popupNotes("you don't have enough coins");
  				return;
  			}else if(result){
  				doVenture();
  			}
  		}
	});

}

function doVenture(){
	// 1/5 - new character ; 3/5 - new skills; 1/5- nothing;
	var ran = Math.floor(Math.random() * 5); //random integer 0-4
	if(ran == 0){
		generateCharacter();
	}else if (ran == 1 || ran == 2 || ran == 3){
		generateSkill();
	}else{
		//todo
		popupNotes("nice try!");
	}
}

function generateCharacter(){

  	Meteor.call('players.allRolesAtMaximum', (error, result) => {
  		if(error){
  			console.log(error);
  			return;
  		}else{
		   	if(result == true){
		   		popupNotes("WELL DONE! your are at maximum level!");
		      	return;
		   	}else if(result == false){
		   		//ok
		   		//generate random role has level < max level
		        var ranCharacterIndex = Math.floor(Math.random() * MAX_LEVEL);
		        while(Players.findOne({'owner':Meteor.userId()}).characters[ranCharacterIndex].level == MAX_LEVEL){
		          ranCharacterIndex = Math.floor(Math.random() * MAX_LEVEL);
		        }
		   		Meteor.call('players.insertRole', ranCharacterIndex);

		   		popupNotes("Congratulations! you gained -" + CHARACTERS[ranCharacterIndex] +"-", "LEVEL UP!");
		   		Meteor.call('players.incLevel');
		   	}
	   }
  	});
}

function generateSkill(){
	var ranSkillIndex = Math.floor(Math.random() * SKILLS.length);

	Meteor.call('players.addSkill',ranSkillIndex,(error, result)=>{ // exceed max number of skills
  		if(error){
  			console.log(error);
  			return;
  		}else{
			if(result == false){
				popupNotes("Ah! no space for a new skill!");
			}else if(result == true){
				popupNotes("Congratulations! you gained -" + SKILLS[ranSkillIndex]+"-");

			}
		}
	});

}

function prune1(){
	p2role = Session.get('p2Role');
	console.log("p2role"+p2role);
   	var random = Math.floor(Math.random() * MAX_ROLES); 
   	while (random == p2role){
  		random = Math.floor(Math.random() * MAX_ROLES); 
   	}
   	console.log("clue:"+random);
   	popupNotes("NEW CLUE: your opopnent is not a " + CHARACTERS[random]);
}

function prune2(){
    p2role = Session.get('p2Role');
    var random1 = 0;
    var random2 = 0; 
    while (random1 == p2role || random2 == p2role || random1 == random2){
    	random1 = Math.floor(Math.random() * MAX_ROLES); 
    	random2 = Math.floor(Math.random() * MAX_ROLES);
    }
    popupNotes("NEW CLUE: your opopnent is not one of: " +  CHARACTERS[random1] + " " +CHARACTERS[random2]);
}

function applySkill(skill){
	console.log("apply "+skill);

	switch(skill) {

		//GODSEYE prune a incorrect role for player
	    case "GODSEYE": //target, immediate
	    	prune1();
	        break;

		//GODSEYE-X prune 2 incorrect roles for player
	    case "GODSEYE-X": 
	    	prune2();
	        break;

	    case "CHEAT": //no target, last 2 mins
	       //change selected character to another, change back when time's out
	       Meteor.call('players.cheat');
	       set_timer(CHEAT_TIMER, CHEAT_TIMER_COUNTDOWN_FROM);
		   document.getElementById("board_cheat").style.display = "block";
	       break;

	    case "AOE": //no target, attack all, immediate
	       //TODO
	  //      Meteor.call('players.getTargetsinView', function(error, targets){

			// };
	       break;

	    case "POWER-MAX": //no target, last 2 mins, when applied hang at the top of the screen //TODO: think make more sense for this to be one-time
	       Meteor.call('players.power_to_max');
	       set_timer(POWER_TIMER, POWER_TIMER_COUNTDOWN_FROM);
	       document.getElementById("board_powerMax").style.display = "block";
	       break;

	    case "ATTACK-MAX": //no target, one-time, when applied hang at the top of the screen
	       Session.set("attackMax", true);
	       Meteor.call('players.setAttackMax', true);
	       document.getElementById("board_attackMax").style.display = "block";
	       break;

	    default:
	    	console.log("ERROR: illegal skill");
	}
}

//set a timer for cheat skills
function set_timer(timer, count_down_from){
	       if(Session.get("lastest_"+timer) == null)
	       		Session.set("lastest_"+timer, 0);

	       var timer_index = Session.get("lastest_"+timer) + 1;
	       Session.set("lastest_"+timer, timer_index);
	       Session.set(timer, count_down_from);

	       for(var i = 0; i <= count_down_from; i++){
				Meteor.setTimeout(()=>{
					//store lastest timer index to prevent having multiple timers modify the time at the same time
					if(timer_index == Session.get("lastest_"+timer)){
						if(Session.get(timer) == 0){
							Session.set(timer, null);
							if(timer == "cheat_timer"){
								Meteor.call('players.cheat_recover');
	       						document.getElementById("board_cheat").style.display = "none";				
							}else if (timer == "power_timer"){
								Meteor.call('players.power_recover');
	       						document.getElementById("board_powerMax").style.display = "none";								
							}
						}else{
							Session.set(timer, Session.get(timer)-1);
						}
					}
				}, i * 1000 );
	       }
}

function attack(){

	//disable continouse attack toward the same player and recover when time passed
	var _p2Id = Session.get('p2Id');
	makePlayerTransparent(_p2Id);
	Session.set(_p2Id, 'locked');
	turnOffAttackBtn();
	Meteor.setTimeout(()=>{
		makePlayerOpaque(_p2Id);
		Session.set(_p2Id, null);
		if(_p2Id == p2Id){
			turnOnAttackBtn();
		}
	}, CONTINOUS_ATTACK_INTERVEL * 1000);

	//attackMax doubles the risk
	var ratio = 1;
	if(Session.get('attackMax') == true){
		Session.set('attackMax', false);
		ratio = 2;
	}

	console.log(CHARACTERS[p1Role]+":"+p1RoleLevel+" VS "+CHARACTERS[p2Role]+":"+p2RoleLevel); 

	//decide winner
	var result = battle(p1Role,p1RoleLevel,p2Role,p2RoleLevel);

	//calculate winner reward weight
	var reward = computeReward(result, p1RoleLevel, p2RoleLevel) * ratio;
	var penalty = PENALTY * ratio;
	reward_and_penalize(result, reward, penalty);

	console.log("result: "+result);
	console.log("reward: "+reward);
	document.getElementById("reward_text").innerHTML = reward + " COINS";

	//lock message status
	Session.set("onMessage", "lock");

	//produce message on screen
	if(result == 1){
		//win
		Meteor.setTimeout(()=>{
			document.getElementById("winPopup1").classList.add("winPopup1");
  			document.getElementById("winPopup2").classList.add("winPopup2");
		}, 1000);

	}else if(result == 2){
		//lose
		Meteor.setTimeout(()=>{
			document.getElementById("losePopup").classList.add("losePopup");
		}, 1000);

	}else{
		//draw
		Meteor.setTimeout(()=>{
			document.getElementById("drawPopup").classList.add("drawPopup");
		}, 1000);
		
	}
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
	}else{
		return 0;
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


function popupNotes(message1, message2){
	Session.set("onMessage", "lock");

	var popup = document.getElementById("notePopup1");
  	popup.classList.add("notePopup1");
	document.getElementById("note1").innerHTML = message1;

	if(message2){
	popup = document.getElementById("notePopup2");
	popup.classList.add("notePopup2");
	document.getElementById("note2").innerHTML = message2;
	}
}










