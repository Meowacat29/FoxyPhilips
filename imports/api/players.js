import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import {CHARACTERS} from '../ui/characters/characters.js';
//import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {SKILLS} from '../ui/characters/characters.js';


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
// 	selected:{
// 		type: String
// 	}
// });

Meteor.methods({

  'players.insert'(index) {
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
	//TODO change
	var profileIsExsist = Players.find({owner: Meteor.userId()});
	if(profileIsExsist)
		Players.remove({owner: Meteor.userId()});

	// if(selectedRole !== CHARACTERS[0] && selectedRole !== CHARACTERS[1] 
	// 	&& selectedRole !== CHARACTERS[2] && selectedRole !== CHARACTERS.INVISIBLEMAN[3]){
	// 	throw new Meteor.Error('this character does not exsist');
	// }

  	Players.insert({ 
  		owner: Meteor.userId(), 
  		createdAt: new Date(),
  		username: Meteor.user().username.toUpperCase(),
  		level: 0,
      goldCoin: 0,
  	  characters: [
  	   	{name: CHARACTERS[0], level: (index == 0 ? 1:-1)},
        {name: CHARACTERS[1], level: (index == 1 ? 1:-1)},
        {name: CHARACTERS[2], level: (index == 2 ? 1:-1)},
        {name: CHARACTERS[3], level: (index == 3 ? 1:-1)}
  	  ],
      skills:[
        {name: SKILLS[0]},
        {name: SKILLS[1]},
        {name: SKILLS[2]},
        {name: SKILLS[3]},
        {name: SKILLS[4]},
        {name: SKILLS[5]},
        {name: SKILLS[6]}
      ],
      cheat: {status: 0, role: -1},
      hide: 0,
  	  selected: index, //default index
  	  position: null
  	});
  },

  'players.remove'(userId) {
    Players.remove({'owner':userId});
  },

  //index: the index of character to perform level update
  //inc_value: the level to be increment/decremented on role. inc_value can be positive or negative.
  'players.updateLevel'(index, inc_value){

    if(Players.findOne({'owner':Meteor.userId()}).characters[index].level == -1){
        console.log("ERROR: you do not have this role yet");
        return;
    }

  	if(Players.findOne({'owner':Meteor.userId()}).characters[index].level >= MAX_LEVEL){
      console.log("it workds here: "+Players.findOne({}).level);
  		console.log('error: you can only have level up to',MAX_LEVEL);
  		return;
  	}

    Players.update(
      { 'owner': Meteor.userId() },
      { $inc: { ['characters.'+ index + '.level' ]: inc_value } }
    );
  },

  'players.insertRole'(index){
  	// if(Players.findOne({ 
  	// 	$and: [
  	// 		{'owner':Meteor.userId()}, 
  	// 		{"characters.name": CHARACTERS[Rindex]}
  	// 		]
  	// 	})){
  	// 	throw new Meteor.Error('error: this role already exist');
  	// }

    if(Players.findOne({'owner':Meteor.userId()}).characters[index].level !=-1){
      throw new Meteor.Error('error: this role already exist');
    }
  	//Players.update({'owner':Meteor.userId()}, { $push: { characters: {name: CHARACTERS[index], level: 1} } } );
    Players.update({'owner':Meteor.userId()}, { $set: {['characters.'+ index + '.level' ]: 1} } );

  },

  'players.switchRole'(index){
	Players.update({'owner':Meteor.userId()}, {$set:{'selected': index}});
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
  		level: 3,
      goldCoin:100,
  	  characters: [
  	 		{name: "fakeRole", level: 1}
  	   ],
      skills:[],
  	 	selected: 0, //default index
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
      return;
    }
    Players.update({'owner':Meteor.userId()}, { $push: { skills: {name: SKILLS[sindex]} } } );
  },

  'players.getp1Role'(){
    console.log("getp1role!");
    console.log("in meteor cal fn: p1role is "+Players.findOne({'owner':Meteor.userId()}).selected);
    return Players.findOne({'owner':Meteor.userId()}).selected;
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
    selectedRoleIndex = Players.findOne({'owner':Meteor.userId()}).selected;
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
    }

});













