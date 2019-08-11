import './Login.html';
import {set_ptr_to_next_component} from './Story.js';
import  {Players} from '../api/players.js';

Template.Login.onCreated(function(){
  var self = this;
  self.autorun(function() {
    var profile1 = self.subscribe('profile',Meteor.userId());
  });

});

Template.Login.events({
  "click .submit": function(event, template) {
  	event.preventDefault();
  	if(document.getElementById("signupform").style.display == "none"){
  		//at login
  		Meteor.loginWithPassword(
      		template.find("#login-username").value,
      		template.find("#login-password").value,
      		function(err) {
        		if (err) {
              if(err.message.includes("403")){
                  Session.set('errorMessage', 'This username/password does not match our record');
              }else if(err.message.includes("400")){
                  Session.set('errorMessage', 'Please enter your username');
              }else{
                  Session.set('errorMessage', 'Input Error');
              }
        		}else{
                //check if the user has intilized a player
                Meteor.call('players.checkPlayerExistence', Meteor.userId(),function(error, isExsit) {
                  if(isExsit){
                    FlowRouter.go('/main');
                  }else{
                    set_ptr_to_next_component();
                  }
                });
        		}
      		}
    	);
  	}
    else if (document.getElementById("loginform").style.display == "none"){
  		//at signup
	    if(template.find("#signup-password").value){
        Accounts.createUser({
              username: template.find("#signup-username").value,
              password: template.find("#signup-password").value,
            }, 
            function(err) {
                if (err) {
                  if(err.message.includes("403")){
                    Session.set('errorMessage', 'Username already exist');
                  }else{
                    Session.set('errorMessage', 'Input Error');
                  }
                }else{
                  set_ptr_to_next_component();
                }
          });
      }

  	}
  }
});



Template.Login.helpers({
  errorMessage: function() {
  	var msg = Session.get('errorMessage');
    return (!msg ? "" : msg);
  }
});




