import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import {CHARACTERS} from '../ui/commons/commons.js';
//import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {SKILLS} from '../ui/commons/commons.js';


export const Players = new Mongo.Collection('players');

var ObjectId = require('mongodb').ObjectID;
var MAX_LEVEL = CHARACTERS.length;

if (Meteor.isServer) {
  	Meteor.publish('profile', function (userId) {
		  return Players.find({owner: userId});
 	});

    Meteor.publish('selectedPlayer', function (playerId) {
      return Players.find({_id: playerId});
  });
}


if (Meteor.isClient) { //called when a page is loaded/ready. ex. when refresh a page

}

// if(Meteor.isClient){
//     profile = Meteor.subscribe('profile',Meteor.userId());

// }

// role = new SimpleSchema({
// 	name:{
// 		type: String,
// 		"default": null
// 	},
// 	level:{
// 		type: Number,
// 		"default": null
// 	},
// 	isAble:{
// 		type: Boolean,
// 		"default": false
// 	}
// });

// Players.schema = new SimpleSchema({
// 	owner: {
// 		type: String
// 	},
// 	createAt:{
// 		type: Date
// 	},
// 	username: {
// 		type: String
// 	},
// 	level:{
// 		type: Number
// 	},
// 	// characters:{
// 	// 	type: [role]
// 	// },
// 	role:{
// 		type: String
// 	}
// });

Meteor.methods({
  'players.clearData'(){
    Players.rawCollection().drop();
  },

  'players.insert'(index) {
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

	//remove if the player already exist
	var profileIsExsist = Players.find({owner: Meteor.userId()});
	if(profileIsExsist){
    console.log("duplicate plaer");
		Players.remove({owner: Meteor.userId()});
  }

	// if(selectedRole !== CHARACTERS[0] && selectedRole !== CHARACTERS[1] 
	// 	&& selectedRole !== CHARACTERS[2] && selectedRole !== CHARACTERS.INVISIBLEMAN[3]){
	// 	throw new Meteor.Error('this character does not exsist');
	// }

  	Players.insert({ 
  		owner: Meteor.userId(), 
  		createdAt: new Date(),
  		username: Meteor.user().username.toUpperCase(),
  		level: 1,
      goldCoin: 1000000,
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
        {name: SKILLS[0]},
        {name: SKILLS[1]},
        {name: SKILLS[2]},
      ],
      cheat: {status: false, role: null},
      attackMax: true,
      hide: 0,
  	  role: index, //default index in CHARACTERS
  	  position: null,
  	});
  },

  'players.remove'(userId) {
    Players.remove({'owner':userId});
  },

  //upgrade a character by 1 level; insert a new character if it doesn't exist
  'players.insertRole'(index){
    console.log("INSERTION");
    //check if the character exists
    // if(Players.findOne({'owner':Meteor.userId()}).characters[index].level == 0){
    //   //inser a new character
    //   Players.update({'owner':Meteor.userId()}, { $set: {['characters.'+ index + '.level' ]: 1} } );
    //   return true;
    // }

    //check if level is at maximum
    if(Players.findOne({'owner':Meteor.userId()}).characters[index].level == MAX_LEVEL){
      console.log('WARNING: You can only have level up to', MAX_LEVEL);
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
  },

  'players.updatePosition'(lat,lng){
    //console.log("in matero call updatepostion:"+JSON.stringify(lat));

  	Players.update(
   		{ 'owner': Meteor.userId() },
   		{ $set:{'position': {"lat":lat, "lng": lng}}}
	  );
  },

  // add a fake person surrounds the user
  'players.addFakePerson'(latlng){
    console.log("ADD a fake player");
    console.log("fake person position:"+JSON.stringify(latlng));
  	if(!latlng){
  		console.log("Error: invalid fake player position");
  		return;
  	}
  	r_earth = 6378*1000;
  	dy=0;
  	dx=300;
  	new_latitude  = latlng.lat  + (dy / r_earth) * (180 / Math.PI);
	  new_longitude = latlng.lng + (dx / r_earth) * (180 / Math.PI) / Math.cos(latlng.lat * Math.PI/180);
	 
   //fakeLatlng = new google.maps.LatLng(new_latitude, new_longitude);
  	Players.insert({ 
  		owner: "fakeUserID", 
  		createdAt: new Date(),
  		username: "fakeUsername",
  		level: 2,
      goldCoin:100000,
  	  characters: [
        {name: CHARACTERS[0], level: 0},
        {name: CHARACTERS[1], level: 2},
        {name: CHARACTERS[2], level: 0},
        {name: CHARACTERS[3], level: 0}
  	   ],
      skills:[],
  	 	role: 1, //default index in CHARACTERS
     	position: {"lat":new_latitude, "lng":new_longitude}
	  });

    console.log("Fake person is added");
  },

// get all tagets surronds the user (in a circular area with radius of 500 meter)
// returns a list of _id and position
  'players.getTargetsinView'(){
    // console.log("check")
    // Meteor.call('players.countPlayers');

  	userPos = Players.findOne({'owner': Meteor.userId()}).position;
  	//console.log("user position is "+ userPos);
    console.log("user position is"+JSON.stringify(Players.find({}).fetch()));
  	dx=500;
  	dy=500;
  	r_earth = 6378*1000;

  	latUpperBound  = userPos.lat  + ( dy / r_earth) * (180 / Math.PI);
  	latLowerBound  = userPos.lat  - ( dy / r_earth) * (180 / Math.PI);
   	lngUpperBound  = userPos.lng  + ( dx / r_earth) * (180 / Math.PI) / Math.cos(userPos.lat * Math.PI/180);
  	lngLowerBound  = userPos.lng  - ( dx / r_earth) * (180 / Math.PI) / Math.cos(userPos.lat * Math.PI/180);

  	// console.log("latUpperBound"+ latUpperBound);
  	// console.log("latLowerBound"+ latLowerBound);
  	// console.log("lngUpperBound"+ lngUpperBound);
  	// console.log("lngLowerBound"+ lngLowerBound);

  //   console.log("++++++")
  // 	console.log(JSON.stringify(
		// Players.find(
  // 			{}
  // 		).fetch()));

     // var results=Players.find(
     //    {'owner': {$ne: this.userId},'position.lat':{ $gt: latLowerBound, $lt: latUpperBound }, 'position.lng':{ $gt: lngLowerBound, $lt: lngUpperBound }},
     //    {position: 1}
     //  ).fetch();
     // for(i=0;i<results.length;i++){
     //  console.log("show getTargetsinView results: "+JSON.stringify(results[i]));
     // }

  // 	console.log("targets: "+JSON.stringify(
	 // Players.find(
  // 			{'position.lat':{ $gt: latLowerBound, $lt: latUpperBound }, 'position.lng':{ $gt: lngLowerBound, $lt: lngUpperBound }},
  // 			{position: 1}
  // 		).fetch()));
    //console.log("---find all documents in getTargetsinView: "+ Players.find({}).fetch().length);



  	return Players.find(
  		  {'owner': {$ne: Meteor.userId()},'position.lat':{ $gt: latLowerBound, $lt: latUpperBound }, 'position.lng':{ $gt: lngLowerBound, $lt: lngUpperBound }},
  		  {position: 1}
  		).fetch();
  },


  'players.countPlayers'(){

      //console.log(JSON.stringify(Players.findOne({})));

    console.log("CALL: all documents: " + Players.find({}).fetch().length);
    //console.log(Players.find({}).fetch());
    console.log(JSON.stringify(Players.find({}).fetch()));
    //if(Players.findOne({}).username){
      //Session.set("selectedPlayerName", "Players.findOne({}).username");
    //}
    //selectedPlayerLevel = Players.findOne({owner: playerId}).level;
    //Session.set("selectedPlayerUsername", );
    //Session.set("selectedPlayerLevel", selectedPlayerLevel);
  },

  //add a new skill to player's skill list
  //Sindex: index of character in CHARACTER array.
  'players.addSkill'(sindex){
    console.log("add skill!");
    var skillsSize = Players.findOne({'owner':Meteor.userId()}).skills.length;
    if(skillsSize==9){
      console.log("you can only have up to 9 skills");
      return false;
    }
    Players.update({'owner':Meteor.userId()}, { $push: { skills: {name: SKILLS[sindex]} } } );
    return true;
  },

  'players.getp1Role'(){
    console.log("getp1role!");
    console.log("in meteor cal fn: p1role is "+Players.findOne({'owner':Meteor.userId()}).role);
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

  'players.power_to_max'(){
    selectedRoleIndex = Players.findOne({'owner':Meteor.userId()}).role;
    selectedRoleLevel = Players.findOne({'owner':Meteor.userId()}).characters[selectedRoleIndex].level;

    //set ths level of current role to max_level
    Players.update(
        { 'owner': Meteor.userId() },
        { $set: { ['characters.'+ selectedRoleIndex + '.level' ]: MAX_LEVEL } }
      );
    },

    'players.power_recover'(){
      Players.update(
        { 'owner': Meteor.userId() },
        { $set: { ['characters.'+ selectedRoleIndex + '.level' ]: selectedRoleLevel } }
      );
    },

    'players.addCoins'(owner, reward){
      //todo
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
        console.log("leves are:"+Players.findOne({'owner':Meteor.userId()}).characters[i].level);
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
      if(fake_character >= (CHARACTERS.length-1)){
        fake_character -= CHARACTERS.length;
      }

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.status": true} }
      );

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.character" : fake_character} }
      );     
    },

    'players.cheat_recover'(){
      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.status" : false }}
      );

      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {"cheat.character" : null} }
      );  

    },

    'players.incLevel'(){
      Players.update(
        { 'owner': Meteor.userId() },
        { $inc: {'level': 1} }
      );   
    },

    'players.setAttackMax'(status){
      Players.update(
        { 'owner': Meteor.userId() },
        { $set: {'attackMax': status} }
      );
    },


});











