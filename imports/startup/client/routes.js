
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Meteor } from 'meteor/meteor';

import '../../ui/GameLayout.html';

import '../../ui/map/newmap.js';

import '../../ui/UserLogin.js';
import '../../ui/Userpanel.js';

import '../../ui/Role.js';
import '../../ui/RoleDisplay.js';
import '../../ui/LuckySpin.html';

import '../../ui/css/style.css';
import '../../ui/css/layout.css';

import {CHARACTERS} from '../../ui/characters/characters.js';
import {SKILLS} from '../../ui/characters/characters.js';
import { Session } from 'meteor/session';


// if(Meteor.isClient){
// 	Accounts.onLogin(function(){
// 		FlowRouter.go('role');
// 	});

// 	Accounts.onLogout(function(){
// 		FlowRouter.go('userlogin');
// 	});
// }

FlowRouter.route('/', {
	name: "userlogin",
	action(){
		BlazeLayout.render('UserLogin');
	}
});


FlowRouter.route('/main', {
	name: "main",
	action(){
		BlazeLayout.render('GameLayout');
	}
});

FlowRouter.route('/role', {
	name: "role",
	action(){
		BlazeLayout.render('Role');
	}
});

FlowRouter.route('/role/roleDisplay', {
	name: "roleDisplay",
	action(){
		BlazeLayout.render('RoleDisplay');
	}
});

// FlowRouter.route('/newmap', {
// 	name: "newmap",
// 	action(){
// 		BlazeLayout.render('newmap');
// 	}
// });







