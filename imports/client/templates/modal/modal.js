import './modal.html';
import './modal.css';


Template.generalModal.helpers({
    template: function() {
        return Template.instance().data.template
    },
    data: function() {
        return Template.instance().data
    }
})

Template.generalModal.events({
    'click .save': function() {
        Template.instance().data.saveAction();
    }
})
