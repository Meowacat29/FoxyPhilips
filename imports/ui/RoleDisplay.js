import  {Players} from '../api/players.js';
import '../api/players.js';
import './RoleDisplay.html';

Template.RoleDisplay.onCreated(function(){
 	var handle = this.subscribe('profile',Meteor.userId());
 	console.log(Meteor.userId());

});

Template.RoleDisplay.helpers({

	varplayers: ()=> {
		console.log("RoleDisplay---");
 		 Meteor.call('players.countPlayers');

		return Players.findOne({});
	}
	
});