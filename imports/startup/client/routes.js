
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Meteor } from 'meteor/meteor';

import '../../ui/GameLayout.js';
import '../../ui/map/map.js';

import '../../ui/Story.js';
import '../../ui/Login.js';
import '../../ui/ControlPanel.js';
import '../../ui/RoleSelection.js';
import '../../ui/Ready.js';

import '../../ui/css/layout.css';

// import {CHARACTERS} from '../../ui/commons/commons.js';
// import {SKILLS} from '../../ui/commons/commons.js';
import { Session } from 'meteor/session';

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









