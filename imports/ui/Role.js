import './Role.html';
import  {Players} from '../api/players.js';
import '../api/players.js';
import {CHARACTERS} from './characters/characters.js';

Template.Role.onCreated(function(){
  Meteor.call('players.remove',Meteor.userId());
  console.log("remove any other players with this userId");
  console.log("Role---");
  Meteor.call('players.countPlayers');

  // var handle = this.subscribe('profile',Meteor.userId());

});

Template.Role.events({
	'click .submit': () => {
		var index = getRadioVal();
		if(!index)
			alert("please select a role");
		else{
			Meteor.call('players.insert', index);
      console.log("Role/when submit---");
      Meteor.call('players.countPlayers');
		}
	}
});

Template.Role.helpers({

  role: (index)=> {
    return CHARACTERS[index];
  }
  
});

function getRadioVal() {
    var val;
    var radios = document.getElementsByName('option');
    
    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { 
            val = radios[i].value; 
            break; 
        }
    }
    return val; 
}
