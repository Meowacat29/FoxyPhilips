import './Login.html';
import {set_ptr_to_next_component} from './Story.js';

Template.Login.events({
  "click .submit": function(event, template) {
    console.log("at: 1");
  	event.preventDefault();
    console.log("at: 2");
  	if(document.getElementById("signupform").style.display == "none"){
  		//in login
      console.log("at: 3");
      console.log("at: 33");
  		Meteor.loginWithPassword(
      		template.find("#login-username").value,
      		template.find("#login-password").value,
      		function(err) {
            console.log("whta happend");
        		if (err) {
        			// alert("login error");
              console.log("at: 4");
        			Session.set('errorMessage', err.message);
        		}else{
                console.log("at: 5");
                set_ptr_to_next_component();
        		}
      		}
    	);
  	}
    else if (document.getElementById("loginform").style.display == "none"){
  		//in signup form
	    if(template.find("#signup-password").value){
        Accounts.createUser({
              username: template.find("#signup-username").value,
              password: template.find("#signup-password").value,
            }, 
            function(err) {
                if (err) {
                  // alert("signup error");
                  Session.set('errorMessage', err.message);
                  console.log("in else -err");
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



