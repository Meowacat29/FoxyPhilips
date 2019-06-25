import  {Players} from '../api/players.js'; 
import './ControlPanel.html';
import './GameLayout.html';
import {CHARACTERS} from './commons/commons.js';
import {SKILLS} from './commons/commons.js';

var p1Role;
var p1RoleLevel;
var p2Role;
var p2RoleLevel;
var p2Id;

const MAX_ROLES = CHARACTERS.length;
const ATTACKMAX_RATIO = 2;
const ROLELEVEL_DIFF_RATE = 0.2;		//the rate weighted the impact of role difference on battale result

const REWARD = 100;
const PENALTY = 20;
const PASSIVE_BATTLE_RATIO = 0.2; 		//the ratio applied to reward/penalty when a battle is not started by the player

const MAX_LEVEL = 4;
const NUM_COINS_PER_VENTURE = 100;
const CHEAT_TIMER_COUNTDOWN_FROM = 121;
const CHEAT_TIMER = "cheat_timer";
const POWER_TIMER_COUNTDOWN_FROM = 31;
const POWER_TIMER = "power_timer";
const CONTINOUS_ATTACK_INTERVEL = 60;

//subscribe to current user player info reactivley 
Template.ControlPanel.onCreated(function(){
	var self = this;
	self.autorun(function() {
		var profile1 = self.subscribe('profile',Meteor.userId());
	    if (profile1.ready()) { //ready() is called when data is changed in mongodb in which case we want the minimongo to query again.
	    	p1Role = Players.findOne({owner: Meteor.userId()}).role;
	    	p1RoleLevel = Players.findOne({owner: Meteor.userId()}).characters[p1Role].level;
	    	Session.set('p1Role', p1Role);
			Session.set('p1RoleLevel', p1RoleLevel);

			watch_battle_event();

			watch_switch_event();
	    }
	});
});

function watch_battle_event(){
			Session.set('battle_notification', Players.findOne({owner: Meteor.userId()}).battle_notification);
			Session.watch('battle_notification', function(resultValue) {
        		if(resultValue != null){
        			Meteor.call('players.received_a_battle');
        			Session.set('battle_notification', null);

        			flash_blacknWhite(document.getElementById('battle_warning'), 2);
        			show_battle_result(resultValue);
        		}
        	 });
}

function watch_switch_event(){
			Session.set('switch_notification', Players.findOne({owner: Meteor.userId()}).switch_notification);
			Session.watch('switch_notification', function(role_and_level) {
        		if(role_and_level != null){
        			Meteor.call('players.received_a_switch');
        			Session.set('switch_notification', null);

        			var roleIndex = role_and_level.charAt(0);
					var roleNewLevel = role_and_level.charAt(1);
					flash_blacknWhite(document.getElementById('switch_warning'), 2);
        			show_passive_switch_result(roleIndex, roleNewLevel);
        			flash(document.getElementById('starContainer'+roleIndex), 6, 2000);
        		}
        	 });
}

//make an html consistently tonggled between visible and invisible status.
//time: (flash_count * 2) * interval
function flash(f,flash_count,startFrom){
	var interval = 300;
	var count = flash_count * 2 + 1;

	for(var i = 0; i < count; i++){
	 	Meteor.setTimeout(()=>{
			f.style.visibility = (f.style.visibility == 'visible' ? 'hidden':'visible');
		}, i * interval + startFrom);	
	}
}

//make an html element consistently tonggled between black and white status. note: this function only applied to originally invisible element
//time: (flash_count * 2) * interval
function flash_blacknWhite(f, flash_count){
	f.style.display = 'block';
	var interval = 500;
	var count = flash_count * 2;

	f.style.display = 'block';
	for(var i = 0; i < count; i++){
	 	Meteor.setTimeout(()=>{
			f.style.color = (f.style.color == 'white' ? 'black':'white');
		}, i * interval );
	}

	Meteor.setTimeout(()=>{
		f.style.display = 'none';
	}, count * interval);
}

function show_battle_result(resultValue){
    setTimeout(()=>{
	    if(resultValue == 0){
	        text = 'DRAW!';
	    }else if(resultValue > 0){
	        text = 'YOU WON '+resultValue + ' COINS!';
	    }else if(resultValue < 0){
	        text = 'YOU LOST ' +(-1 *resultValue + ' COINS!');
	    }
	    document.getElementById('battle_result').innerHTML = text;
		document.getElementById('battle_result').style.display = 'block';
    }, 2500);

    setTimeout(()=>{
	    document.getElementById('battle_result').style.display = 'none';
    }, 4500);
}

//display resulted roleLevel from a switch event by showing text on screen
function show_passive_switch_result(roleIndex, roleNewLevel){
    setTimeout(()=>{
	    document.getElementById('switch_result_passive').innerHTML = CHARACTERS[roleIndex] + " is now " + roleNewLevel + " stars";
		document.getElementById('switch_result_passive').style.display = 'block';
    }, 2500);

    setTimeout(()=>{
	    document.getElementById('switch_result_passive').style.display = 'none';
    }, 4500);
}

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
	}else if(status == "hold" || status == "free"){ //should not include 'free', but hardcoded to solve a bug(rare though). look forward a better solution.
		document.getElementById("winPopup1").classList.remove("winPopup1");
	  	document.getElementById("winPopup2").classList.remove("winPopup2");
	  	document.getElementById("drawPopup").classList.remove("drawPopup");
	  	document.getElementById("losePopup1").classList.remove("losePopup1");
	  	document.getElementById("losePopup2").classList.remove("losePopup2");

	  	Session.set("onMessage", "free");
	}
}

	//subscribe to selected Player info reactively
	Tracker.autorun(function() {
		p2Id = Session.get('p2Id');
		if(p2Id){
			var handler = Meteor.subscribe('selectedPlayer', p2Id);

			if(handler.ready()){
				var data = Players.find().fetch();
				p2Role = Players.findOne({_id: p2Id}).role;
				p2RoleLevel=Players.findOne({_id: p2Id}).characters[p2Role].level;

				Session.set('p2Name', Players.findOne({_id: p2Id}).username);
				Session.set('p2Level', Players.findOne({_id: p2Id}).level);
				Session.set('p2Role', p2Role);
				Session.set('p2RoleLevel',p2RoleLevel) ;
			}	
		}
	});

Template.ControlPanel.helpers({
	// p2Name: function(){
	// 	return Session.get('p2Name');
	// },
	p2Level: ()=>{
		return Session.get("p2Level"); 
	},
	user: ()=>{
		return Players.findOne({owner: Meteor.userId()});
	},
	badge: function(index){
		return (Players.findOne({owner: Meteor.userId()}).characters[index] ? "badge"+Players.findOne({owner: Meteor.userId()}).characters[index].level:"");
	},
	isable: function(index){
		if(Players.findOne({owner: Meteor.userId()}).characters[index].level != 0){
			return 'abled';
		}else return 'unabled';
	},
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

		var skill = document.getElementById(sIndex).classList[0];
		//hardcode skill name
		if(skill == "GODSEYE" || skill == "GODSEYE-X" || skill == "SUPER-SWITCH"){
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
		return Session.get(POWER_TIMER + Session.get("p1Role"));
	},
	power_status:()=>{
		return Session.get(POWER_TIMER + Session.get("p1Role")) == null ? "":"shown";
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
	'click .ready':(index)=>{ //attack
		//remove attackMax icon on the dashboard
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

			for(var i = 0; i < 9; i++){ //9 for num of skill pots, hardcoded
				if(htmlsIndex ==  i)
					document.getElementById(i).classList.add("select");
				else
					document.getElementById(i).classList.remove("select");
			}
		}
	},


	'click .skillBtn':()=>{
		var htmlsIndex = Session.get('selectedSkill');
		
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

function venture(){
	//try reducing an amount of coins
	Meteor.call('players.reduceVentureCoins', NUM_COINS_PER_VENTURE, (error, result) => {
		if(error){
  			console.log(error);
  			return;
  		}else{
  			if(!result){
  				popupNotes("you don't have enough coins");
  				return;
  			}else if(result){
  				doVenture();
  			}
  		}
	});

}

function doVenture(){
	//use different rate for different level

	if(Players.findOne({'owner':Meteor.userId()}).level <= 3){
		// 2/10 - new character ; 7/10 - new skills; 1/10- nothing;
		var ran = Math.floor(Math.random() * 10); //random integer 0-9
		if(0 <= ran && ran <= 1){
			generateCharacter();
		}else if (2 <= ran && ran <= 8){
			generateSkill();
		}else{
			popupNotes("nice try!");
		}
	}else{
		// 1/10 - new character ; 8/10 - new skills; 1/10- nothing;
		var ran = Math.floor(Math.random() * 10); //random integer 0-9
		if(0 == ran){
			var status = generateCharacter();
			if(status == false){
				popupNotes("nice try!");
			}
		}else if (1 <= ran && ran <= 8){
			generateSkill();
		}else{
			popupNotes("nice try!");
		}	
	}



}

function generateCharacter(){

  	Meteor.call('players.allRolesAtMaximum', (error, result) => {
  		if(error){
  			console.log(error);
  			return;
  		}else{
		   	if(result == true){
		   		return false;
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
	var ran = Math.floor(Math.random() * 19); //0-18
	//hardcoded to match skills and index
	if(0 <= ran && ran <= 3){
		//godseye 4/19
		ranSkillIndex = 0;
	}else if (4 <= ran && ran <= 5){
		//godseye-X 2/19
		ranSkillIndex = 1;
	}else if (6 <= ran && ran <= 9){
		//cheat 4/19
		ranSkillIndex = 2;
	}else if (10 <= ran && ran <= 13){
		//powerMax 4/19
		ranSkillIndex = 3;
	}else if (14 <= ran && ran <= 17){
		//attackMax 4/19
		ranSkillIndex = 4;
	}else{
		//super-switch 1/19
		ranSkillIndex = 5;
	}

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
	var detector = Session.get('p2Role');
	//if 'cheat' skill is applied by the opponent
	if (Players.findOne({_id: p2Id}).cheat.status == true){
		detector = Players.findOne({_id: p2Id}).cheat.role;
	}
   	var random = Math.floor(Math.random() * MAX_ROLES); 
   	while (random == detector){
  		random = Math.floor(Math.random() * MAX_ROLES); 
   	}
   	popupNotes("NEW CLUE: your opopnent is not a " + CHARACTERS[random]);
}

function prune2(){
    var detector = Session.get('p2Role');
	//if 'cheat' skill is applied by the opponent
	if (Players.findOne({_id: p2Id}).cheat.status == true){
		detector = Players.findOne({_id: p2Id}).cheat.role;
	}
    var random1 = 0;
    var random2 = 0; 
    while (random1 == detector || random2 == detector || random1 == random2){
    	random1 = Math.floor(Math.random() * MAX_ROLES); 
    	random2 = Math.floor(Math.random() * MAX_ROLES);
    }
    popupNotes("NEW CLUE: your opopnent is not one of: " +  CHARACTERS[random1] + " " +CHARACTERS[random2]);
}

function applySkill(skill){

	switch(skill) {
		//GODSEYE prune a incorrect role for player
	    case "GODSEYE": //need target, immediate
	    	prune1();
	        break;

		//GODSEYE-X prune 2 incorrect roles for player
	    case "GODSEYE-X": 
	    	prune2();
	        break;

	    case "CHEAT": //no target, last 2 mins
	       //change selected character to another, change back when time's out
	       Meteor.call('players.cheat');
	       set_cheat_timer();
		   document.getElementById("board_cheat").classList.add("shown");
	       break;

	    case "SUPER-SWITCH": //need target, attack all, immediate
	       Meteor.call('players.superSwitch', Meteor.userId(), p2Id, ()=>{
	       		display_superSwitch();
	       });	
	       break;

	    case "POWER-MAX": //no target, last 2 mins, when applied hang at the top of the screen
	       Meteor.call('players.power_to_max', p1Role);
	       set_power_timer(p1Role);
	       document.getElementById("board_powerMax").classList.add("shown");
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

function display_superSwitch(){
	       		var _p1Role = Session.get('p1Role');
	       		var _p1RoleLevel = Session.get('p1RoleLevel');
	       		flash_blacknWhite(document.getElementById('switch_confirmation'), 2);
	       		show_active_switch_result(_p1Role, _p1RoleLevel);
	       		flash(document.getElementById('starContainer'+_p1Role), 6, 2000);
}

function show_active_switch_result(roleIndex, roleNewLevel){
    setTimeout(()=>{
	    document.getElementById('switch_result_active').innerHTML = CHARACTERS[roleIndex] + " is now " + roleNewLevel + " stars";
		document.getElementById('switch_result_active').style.display = 'block';
    }, 2000);

    setTimeout(()=>{
	    document.getElementById('switch_result_active').style.display = 'none';
    }, 4000);
}

//set a timer for cheat skills
function set_cheat_timer(){ 
	       if(Session.get("lastest_cheat_timer") == null)
	       		Session.set("lastest_cheat_timer", 0);

	       var timer_index = Session.get("lastest_cheat_timer") + 1;
	       Session.set("lastest_cheat_timer", timer_index);
	       Session.set("cheat_timer", CHEAT_TIMER_COUNTDOWN_FROM);

	       for(var i = 0; i <= CHEAT_TIMER_COUNTDOWN_FROM; i++){
				Meteor.setTimeout(()=>{
					//store lastest timer index to prevent having multiple timers modify the time at the same time
					if(timer_index == Session.get("lastest_cheat_timer")){
						if(Session.get("cheat_timer") == 0){
							Session.set("cheat_timer", null);
							Meteor.call('players.cheat_recover');
	       					document.getElementById("board_cheat").classList.remove("shown");				
						}else{
							Session.set("cheat_timer", Session.get("cheat_timer")-1);
						}
					}
				}, i * 1000 );
	       }
}

//set a timer for cheat skills
function set_power_timer(_p1Role){ //_p1Role field is optional
	       if(Session.get('lastest_power_timer_'+_p1Role) == null)
	       		Session.set('lastest_power_timer'+_p1Role, 0);

	       var timer_index = Session.get('lastest_power_timer'+_p1Role) + 1;
	       Session.set('lastest_power_timer'+_p1Role, timer_index);
	       Session.set('power_timer'+_p1Role, POWER_TIMER_COUNTDOWN_FROM);

	       for(var i = 0; i <= POWER_TIMER_COUNTDOWN_FROM; i++){
				Meteor.setTimeout(()=>{
					//store lastest timer index to prevent having multiple timers modify the time at the same time
					if(timer_index == Session.get('lastest_power_timer'+_p1Role)){
						if(Session.get('power_timer'+_p1Role) == 0){
							Session.set('power_timer'+_p1Role, null);
							Meteor.call('players.power_recover', _p1Role);
							if(Session.get('p1Role') == _p1Role){
								document.getElementById("board_powerMax").classList.remove("shown");
							}
						}else{
							Session.set('power_timer'+_p1Role, Session.get('power_timer'+_p1Role)-1);
						}
					}
				}, i * 1000 );
	       }
}


function attack(){
	//console.log(CHARACTERS[p1Role]+":"+p1RoleLevel+" VS "+CHARACTERS[p2Role]+":"+p2RoleLevel); 
	set_timer_for_continuse_attack();

	//decide winner
	var result = battle(p1Role,p1RoleLevel,p2Role,p2RoleLevel);

	//calculate reward and penalty
	var reward = computeReward(result, p1RoleLevel, p2RoleLevel);
	var penalty = PENALTY;
	if(Session.get('attackMax') == true){
		Session.set('attackMax', false);
		reward *= ATTACKMAX_RATIO;
		penalty *= ATTACKMAX_RATIO;
	}
	var passive_reward = reward * PASSIVE_BATTLE_RATIO;
	var passive_penalty = penalty * PASSIVE_BATTLE_RATIO;

	reward = Math.round(reward);
	penalty = Math.round(penalty);
	passive_reward = Math.round(passive_reward);
	passive_penalty = Math.round(passive_penalty);

	reward_and_penalize_player(result, reward, penalty);
	reward_and_penalize_opponent(result, passive_reward, passive_penalty);

	show_result(result, reward, penalty);

	notify_battle_to_opponent(result, passive_reward, passive_penalty);
}

//disable continouse attack toward the same player and recover when time passed
function set_timer_for_continuse_attack(){
	var _p2Id = Session.get('p2Id');
	Session.set(_p2Id, 'locked');

	makePlayerTransparent(_p2Id);
	turnOffAttackBtn();
	Meteor.setTimeout(()=>{
		makePlayerOpaque(_p2Id);
		Session.set(_p2Id, null);
		if(_p2Id == p2Id){
			turnOnAttackBtn();
		}
	}, CONTINOUS_ATTACK_INTERVEL * 1000);
}

function notify_battle_to_opponent(result, passive_reward, passive_penalty){
	//prepare reward and penalty for opponent, note that its the inverse of our result aobve.
	var resultValue = 0;
	if(result == 1)
		resultValue = -1 * passive_penalty;
	else if(result == 2)
		resultValue = passive_reward;

	Meteor.call('players.notify_a_battle',p2Id, resultValue);
}

function show_result(result, reward, penalty){
	//lock message status
	Session.set("onMessage", "lock");

	//produce message on screen
	if(result == 1){
		//win
		Meteor.setTimeout(()=>{
			document.getElementById("winPopup1").classList.add("winPopup1");
			document.getElementById("reward_text").innerHTML = reward + " COINS";
  			document.getElementById("winPopup2").classList.add("winPopup2");
		}, 1000);

	}else if(result == 2){
		//lose
		Meteor.setTimeout(()=>{
			document.getElementById("penalty_text").innerHTML = "- "+ penalty + " COINS";
			document.getElementById("losePopup1").classList.add("losePopup1");
  			document.getElementById("losePopup2").classList.add("losePopup2");
		}, 1000);

	}else if(result == 0){
		//draw
		Meteor.setTimeout(()=>{
			document.getElementById("drawPopup").classList.add("drawPopup");
		}, 1000);
	}
}

function reward_and_penalize_player(result, reward, penalty){
	if(result==1)
		Meteor.call('players.addCoins', Meteor.userId(),reward);
	else if(result==2)
		Meteor.call('players.reduceCoins', Meteor.userId(),penalty);
}

function reward_and_penalize_opponent(result, passive_reward, passive_penalty){
	if(result==1)
		Meteor.call('players.reduceCoins', Players.findOne({_id: p2Id}).owner,passive_penalty);
	else if(result==2)
		Meteor.call('players.addCoins', Players.findOne({_id: p2Id}).owner,passive_reward);
}


function computeReward(result, lev1, lev2){
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

	var weight = 1 + (loser_lev - winner_lev) * ROLELEVEL_DIFF_RATE;
	var reward = REWARD * weight;
	
	return reward;
}

// decide the winner of a battle
function battle(ind1,lev1,ind2,lev2){
	var diff = MAX_ROLES - 1;

	//apply the rule of role counter, as a result adjusting the levels of both sides.
	ind1 = parseInt(ind1);
	ind2 = parseInt(ind2);
	if(ind1 + 1 == ind2 || ind1 - diff == ind2) //the player's role counters the opponent's
		lev1 = lev1+2;
	else if(ind2 + 1 == ind1 || ind2 - diff == ind1) //the opponent's role counters the player's
		lev2 = lev2 + 2;

	if(lev1>lev2) //player wins
		return 1;
	else if(lev1==lev2) //draw
		return 0;
	else if (lev1<lev2) //player loses
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










