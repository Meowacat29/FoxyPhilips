import './UserLogin.html';

Template.UserLogin.events({
  "click .submit": function(event, template) {
  	event.preventDefault();
  	if(document.getElementById("signupform").style.display == "none"){
  		//in login
  		Meteor.loginWithPassword(
      		template.find("#login-username").value,
      		template.find("#login-password").value,
      		function(err) {
        		if (err) {
        			// alert("login error");
        			Session.set('errorMessage', err.message);
        		}else{
        			FlowRouter.go('role');
        		}
      		}
    	);
  	}else if (document.getElementById("loginform").style.display == "none"){
  		//in signup form
	    if(template.find("#signup-password").value !== template.find("#signup-repassword").value)
	      	Session.set('errorMessage', "The passwords do not match.");
	    else
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
	        			FlowRouter.go('role');
	        		}
	   	 	});
  	}
  }
});


Template.UserLogin.helpers({
  errorMessage: function() {
  	var msg = Session.get('errorMessage');
    return (!msg ? "" : msg);
  }
});



