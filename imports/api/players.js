import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import {CHARACTERS} from '../ui/commons/commons.js';
//import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {SKILLS} from '../ui/commons/commons.js';
import * as constants from '../ui/commons/commons.js';

export const Players = new Mongo.Collection('players');

var ObjectId = require('mongodb').ObjectID;
var MAX_LEVEL = 4;

if (Meteor.isServer) {
  	Meteor.publish('profile', function (userId) {
		  return Players.find({owner: userId});
 	});

    Meteor.publish('selectedPlayer', function (playerId) {
      return Players.find({_id: playerId});
  });

  //set user status to offline when user leaves (close app from code or exit externally)
  Meteor.users.find({ "status.online": true }).observe({
    // added: function(id) {
    // },

    removed: function(id) {
      Meteor.call('players.switchStatusOff', (id._id));
    }
  });
}


if (Meteor.isClient) {

}


Meteor.methods({
  'players.notify_a_battle': function(userId, resultValue) {
      Players.update(
        { '_id': userId },
        { $set: {'battle_notification': resultValue} }
      ); 
  },

  'players.received_a_battle': function() {
      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {'battle_notification': null} }
      ); 
  },

  'players.notify_a_switch': function(userId, role, newLevel) {
      Players.update(
        { '_id': userId },
        { $set: {'switch_notification': role + newLevel} }
      ); 
  },

  'players.received_a_switch': function() {
      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {'switch_notification': null} }
      ); 
  },

  'players.clearData'(){
    Players.rawCollection().drop();
  },

  'players.switchStatusOff'(userId){
      Players.update(
        { 'owner': userId},
        { $set: {"status" : "off"} }
      ); 
  },

  'players.switchStatusOn'(userId){
      Players.update(
        { 'owner': userId},
        { $set: {"status" : "on"} }
      ); 
  },

//always update if a player already exists
  'players.insert'(index) {
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

	//remove if the player already exist
	var profileIsExsist = Players.find({owner: Meteor.userId()});
	if(profileIsExsist){
		Players.remove({owner: Meteor.userId()});
  }

  	Players.insert({ 
  		owner: Meteor.userId(), 
  		createdAt: new Date(),
  		username: Meteor.user().username.toUpperCase(),
      status: "off",
  		level: 1,
      goldCoin: 1000,
  	  characters: [
        {name: CHARACTERS[0], level: (index == 0 ? 1:0)},
        {name: CHARACTERS[1], level: (index == 1 ? 1:0)},
        {name: CHARACTERS[2], level: (index == 2 ? 1:0)},
        {name: CHARACTERS[3], level: (index == 3 ? 1:0)}
  	  ],
      skills:[
        {name: SKILLS[0]},
        {name: SKILLS[1]},
        {name: SKILLS[2]},
        {name: SKILLS[3]},
        {name: SKILLS[4]},
        {name: SKILLS[5]},
      ],
      cheat: {status: false, role: null},
      //attackMax: true,
  	  role: index, //default index in CHARACTERS
  	  position: null,
      battle_notification: null,
      switch_notification: null,
      tutorial_complete: false,
  	});
  },

  'players.remove'(userId) {
    Players.remove({'owner':userId});
  },

  //upgrade a character by 1 level; 
  'players.insertRole'(index){
    //check if level is at maximum
    if(Players.findOne({'owner':Meteor.userId()}).characters[index].level == MAX_LEVEL){
      console.log('WARNING: failed to upgrade character due to level limit', MAX_LEVEL);
      return false;
    }

    //upgrade character
    Players.update(
      { 'owner': Meteor.userId() },
      { $inc: { ['characters.'+ index + '.level' ]: 1 } }
    );
    return true;
  },

  'players.switchRole'(index){
	 Players.update({'owner':Meteor.userId()}, {$set:{'role': index}});

   //if cheat is applied, adjust cheat role as well
    if (Players.findOne({'owner':Meteor.userId()}).cheat.status == true){
      var fake_character = parseInt(index) + 2;
      if(fake_character > (CHARACTERS.length-1))
        fake_character -= CHARACTERS.length;

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.role" : fake_character} }
      ); 
    }
  },

  'players.updatePosition'(lat,lng){
  	Players.update(
   		{ 'owner': Meteor.userId() },
   		{ $set:{'position': {"lat":lat, "lng": lng}}}
	  );
  },

  // add a fake player
  'players.addFakePerson'(latlng){
  	if(!latlng){
  		console.log("warning: invalid fake player position");
  		return;
  	}
  	r_earth = 6378*1000;
  	dy=0;
  	dx=300;
  	new_latitude  = latlng.lat  + (dy / r_earth) * (180 / Math.PI);
	  new_longitude = latlng.lng + (dx / r_earth) * (180 / Math.PI) / Math.cos(latlng.lat * Math.PI/180);
	 
  	Players.insert({ 
  		owner: "fakeUserID", 
  		createdAt: new Date(),
  		username: "fakeUsername",
      status: "on",
  		level: 5,
      goldCoin:1000,
  	  characters: [
        {name: CHARACTERS[0], level: 2},
        {name: CHARACTERS[1], level: 0},
        {name: CHARACTERS[2], level: 0},
        {name: CHARACTERS[3], level: 3}
  	   ],
      skills:[],
      cheat: {status: false, role: null},
      attackMax: true,
      hide: 0,
      role: 3, //default index in CHARACTERS
      position: {"lat":new_latitude, "lng":new_longitude},
      battle_notification: null,
	  });
  },

// get all tagets surronds the user (in a circular area with radius of 500 meter)
// returns a list of _id and position
  'players.getTargetsinView'(){
  	userPos = Players.findOne({'owner': Meteor.userId()}).position;
    //console.log("player position is"+JSON.stringify(Players.find({}).fetch()));
  	dx=constants.FIRE_RANGE;
  	dy=constants.FIRE_RANGE;
  	r_earth = 6378*1000;

  	latUpperBound  = userPos.lat  + ( dy / r_earth) * (180 / Math.PI);
  	latLowerBound  = userPos.lat  - ( dy / r_earth) * (180 / Math.PI);
   	lngUpperBound  = userPos.lng  + ( dx / r_earth) * (180 / Math.PI) / Math.cos(userPos.lat * Math.PI/180);
  	lngLowerBound  = userPos.lng  - ( dx / r_earth) * (180 / Math.PI) / Math.cos(userPos.lat * Math.PI/180);

  	// console.log("latUpperBound"+ latUpperBound);
  	// console.log("latLowerBound"+ latLowerBound);
  	// console.log("lngUpperBound"+ lngUpperBound);
  	// console.log("lngLowerBound"+ lngLowerBound);

  	return Players.find(
  		  {'owner': {$ne: Meteor.userId()},
        'status': "on",
        'position.lat':{ $gt: latLowerBound, $lt: latUpperBound },
        'position.lng':{ $gt: lngLowerBound, $lt: lngUpperBound }},
  		  {position: 1}
  		).fetch();
  },


  'players.countPlayers'(){
    //console.log("Count all documents: " + Players.find({}).fetch().length);
    //console.log(JSON.stringify(Players.find({}).fetch()));
  },

  //add a new skill to player's skill list
  //Sindex: index of skill in SKILL array.
  'players.addSkill'(sindex){
    var skillsSize = Players.findOne({'owner':Meteor.userId()}).skills.length;
    if(skillsSize==9){
      console.log("Warning: failed to add skill due to limit");
      return false;
    }
    Players.update({'owner':Meteor.userId()}, { $push: { skills: {name: SKILLS[sindex]} } } );
    return true;
  },

  'players.getp1Role'(){
    return Players.findOne({'owner':Meteor.userId()}).role;
  },

  'players.findSkillatIndex'(htmlsIndex){
    if(!Players.findOne({'owner':Meteor.userId()}).skills[htmlsIndex])
      return null;
    return Players.findOne({'owner':Meteor.userId()}).skills[htmlsIndex].name;
  },

  'players.removeSkill'(htmlsIndex){
    Players.update(
      { 'owner': Meteor.userId() },
      { $unset: {['skills.'+htmlsIndex] : 1} }
    );
    Players.update(
      { 'owner': Meteor.userId() }, 
      { $pull : {"skills" : null }});
  },

  'players.power_to_max'(rIndex){
    var selectedRoleLevel = Players.findOne({'owner':Meteor.userId()}).characters[rIndex].level;

    //set ths level of current role to max_level
    Players.update(
        { 'owner': Meteor.userId() },
        { $set: { ['characters.'+ rIndex + '.level' ]: MAX_LEVEL } }
      );

    //set the real level
    Players.update(
        { 'owner': Meteor.userId() },
        { $set: { ['characters.'+ rIndex + '.real_level' ]: selectedRoleLevel } }
      );
    },

    'players.power_recover'(rIndex){
      var real_level = Players.findOne({'owner':Meteor.userId()}).characters[rIndex].real_level;

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: { ['characters.'+ rIndex + '.level' ]: real_level } }
      );

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: { ['characters.'+ rIndex + '.real_level' ]: null } }
      );
    },

    'players.addCoins'(owner, reward){
      Players.update(
        { 'owner': owner },
        { $inc:{'goldCoin': reward}}
      );
    },

    'players.reduceCoins'(owner, penalty){
      var current_coins = Players.findOne({'owner': owner}).goldCoin;
      if(current_coins < penalty){
        penalty = current_coins;
      }
      
      Players.update(
        { 'owner': owner},
        { $inc:{'goldCoin': -1 * penalty}}
      );
    },

    //check if all roles are at maximum level
    'players.allRolesAtMaximum'(){
      for(i = 0; i<CHARACTERS.length;i++){
        if(Players.findOne({'owner':Meteor.userId()}).characters[i].level < MAX_LEVEL)
          return false;
      }
      return true;
    },

    //reduce coins needed for a venture
    //return false if no enough coins are available
    'players.reduceVentureCoins'(num_coins){
      var current_coins = Players.findOne({'owner': Meteor.userId()}).goldCoin;
      if(current_coins < num_coins){
        return false;
      }
      
      Players.update(
        { 'owner': Meteor.userId()},
        { $inc:{'goldCoin': -1 * num_coins}}
      );
      return true;
    },

    'players.cheat'(){
      var character = Players.findOne({'owner': Meteor.userId()}).role;
      var fake_character = parseInt(character) + 2;
      if(fake_character > (CHARACTERS.length-1)){
        fake_character -= CHARACTERS.length;
      }

      Players.update(
        { 'owner': Meteor.userId()},
        { $set: {"cheat.status": true} }
      );

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.role" : fake_character} }
      );     
    },

    'players.cheat_recover'(){
      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.status" : false }}
      );

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.role" : null} }
      );  

    },

    'players.incLevel'(){
      Players.update(
        { 'owner': Meteor.userId() },
        { $inc: {'level': 1} }
      );   
    },

    // 'players.setAttackMax'(status){
    //   Players.update(
    //     { 'owner': Meteor.userId() },
    //     { $set: {'attackMax': status} }
    //   );
    // },

    'players.superSwitch'(p1owner, p2Id){
      var p1roleIndex = Players.findOne({'owner': p1owner}).role;
      var p1roleLevel =  Players.findOne({'owner': p1owner}).characters[p1roleIndex].level;

      var p2roleIndex = Players.findOne({'_id': p2Id}).role;
      var p2roleLevel =  Players.findOne({'_id': p2Id}).characters[p2roleIndex].level;

      //swap the levels of the current role of each other
      Players.update(
        { 'owner': p1owner },
        { $set: { ['characters.'+ p1roleIndex + '.level' ]: p2roleLevel } }
      );

      Players.update(
        { '_id': p2Id },
        { $set: { ['characters.'+ p2roleIndex + '.level' ]: p1roleLevel } }
      );

      //update level for the player
      Meteor.call('players.updateLevel_owner', p1owner);

      //update level for opponent
      Meteor.call('players.updateLevel_id', p2Id);

      //notify the victim
      Meteor.call('players.notify_a_switch', p2Id, p2roleIndex, p1roleLevel);

    },

    'players.updateLevel_id'(userId){
      var newLevel = 0;
      for(var i = 0; i<CHARACTERS.length;i++){
        newLevel += Players.findOne({'_id': userId}).characters[i].level;
      }
      Players.update(
        { '_id': userId},
        { $set: {'level': newLevel} }
      );  
    },

    'players.updateLevel_owner'(owner){
      var newLevel = 0;
      for(var i = 0; i<CHARACTERS.length;i++){
        newLevel += Players.findOne({'owner': owner}).characters[i].level;
      }
      Players.update(
        { 'owner': owner},
        { $set: {'level': newLevel} }
      );  
    },

    'players.checkPlayerExistence'(owner){
      if(Players.find({owner: owner}) != null)
        return true;
      return false;
    }

});











