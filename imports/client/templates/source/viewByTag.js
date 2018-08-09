import { Template } from 'meteor/templating';
import './viewByTag.html';

// We expect a ReactiveVar to be set by the parent
// Template.instance().data.contract

Template.viewByTag.onRendered(function() {

});

Template.viewByTag.helpers({
    contracts: function() {
        let tag = Template.instance().data.tag.get();
        let result = [];
        if (tag) {
            result = Pipeline.collections.ContractSource.find({tags: {$in: [tag]}}).fetch();
        }
        return result;
    },
    devdoc: function() {
        return JSON.parse(this.devdoc);
    }
});

Template.viewByTag.events({
    'click .pipe': function(event) {
        let contracts = Template.instance().data.contracts.get();
        let index = contracts.indexOf(this._id);
        if (index > -1) {
            contracts.splice(index, 1);
        } else {
            contracts.push(this._id);
        }
        Template.instance().data.contracts.set(contracts);
    }
});
