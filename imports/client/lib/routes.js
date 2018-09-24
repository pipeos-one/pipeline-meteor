import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../templates/applicationLayout.html';
import '../templates/main/main.js';

import '../templates/source/insert.js';
import '../templates/source/insertJS.js';
import '../templates/source/view.js';
import '../templates/source/viewByTag.js';

import '../templates/tags/insert.js';
import '../templates/tags/viewTags.js';

import '../templates/abiui/main.js';

FlowRouter.route('/', {
  name: 'home',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'main'});
  }
});

FlowRouter.route('/view/tags', {
  name: 'viewTags',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'viewTags'});
  }
});

FlowRouter.route('/view/sources', {
  name: 'viewSources',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'viewSources'});
  }
});

FlowRouter.route('/view/contracts', {
  name: 'viewContracts',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'viewContracts'});
  }
});

FlowRouter.route('/pipe/:contracts', {
  name: 'pipe',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'pipe'});
  }
});

FlowRouter.route('/abi/:_id', {
  name: 'abiui',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'abiuiWrap'});
  }
});

FlowRouter.route('/insert/source', {
  name: 'insert',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'insert'});
  }
});

FlowRouter.route('/insert/javascript', {
  name: 'insertJS',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'insertJS'});
  }
});

FlowRouter.route('/insert/tag', {
  name: 'insertTag',
  action: function() {
    BlazeLayout.render('ApplicationLayout', {main: 'insertTag'});
  }
});
