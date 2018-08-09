import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './viewTags.html';

Template.viewTags.onCreated(function() {
    // We expect a ReactiveVar to be set by the parent
    // Template.instance().data.tag
});

Template.viewTags.helpers({
    tags: function() {
        return Pipeline.collections.Tag.find({}).fetch();
    }
});

Template.viewTags.events({
    'click .showContracts': function(event) {
        let id = $(event.target).data('id')
        Template.instance().data.tag.set(id)
    }
})
