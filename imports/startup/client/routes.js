
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import '../../ui/GameLayout.js';
import '../../ui/map/map.js';
import '../../ui/Story.js';
import '../../ui/Login.js';
import '../../ui/ControlPanel.js';
import '../../ui/RoleSelection.js';
import '../../ui/Ready.js';
import '../../ui/Menu.js';
import '../../ui/css/layout.css';

FlowRouter.route('/', {
	name: "story",
	action(){
		BlazeLayout.render('Story');
	}
});


FlowRouter.route('/main', {
	name: "main",
	action(){
		BlazeLayout.render('GameLayout');
	}
});









