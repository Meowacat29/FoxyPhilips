import './Story.html';
export const COMPONENTS = ["Welcome", "Story_p1", "Story_p2", "Story_p3", "Story_p4", "Login", "RoleSelection", "Ready"];
export const RANDOM_CLICK_PAGES_START = 1;
export const RANDOM_CLICK_PAGES_END = 4;

// set ptr to next component, store in localstorage and session.
export function set_ptr_to_next_component(next_index){
      var curr = localStorage.getItem('index'); //note: localStorage only storage string

      if(!next_index)
      	curr++;
      else
      	curr = next_index;

      localStorage.setItem('index', parseInt(curr));
      Session.set('index', parseInt(curr));

      if(curr == COMPONENTS.length){
      	FlowRouter.go('/main');
      }
      //console.log("current page index:"+localStorage.getItem('index'));
}

Template.Story.onCreated(function(){
	localStorage.clear(); //remove 
	var curr = localStorage.getItem('index');
	if(!curr)
		localStorage.setItem('index', '0');
});

Template.Story_p1.events({
  'click': function () {
    set_ptr_to_next_component();
  }
});

Template.Story_p2.events({
  'click': function () {
    set_ptr_to_next_component();
  }
});

Template.Story_p3.events({
  'click': function () {
    set_ptr_to_next_component();
  }
});

Template.Story_p4.events({
  'click': function () {
    set_ptr_to_next_component();
  }
});

Template.Story.helpers({
  component: function () {
  	if(!Session.get('index')){	
  		Session.set('index', localStorage.getItem('index'));
  	}
   	return COMPONENTS[Session.get('index')];
  }
});


Template.Welcome.events({
  "click .story_skip": function() {
  		set_ptr_to_next_component(5); //skip to login page
	},
  "click .story_start": function() {
  		set_ptr_to_next_component(); //go to story
	}
});





