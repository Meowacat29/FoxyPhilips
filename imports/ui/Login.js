import './Login.html';
import {set_ptr_to_next_component} from './Story.js';

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
        			Session.set('errorMessage', err.message);
        		}else{
                set_ptr_to_next_component();
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
                  Session.set('errorMessage', err.message);
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



