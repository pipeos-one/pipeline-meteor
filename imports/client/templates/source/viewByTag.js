import { Template } from 'meteor/templating';
import './viewByTag.html';

// We expect a ReactiveVar to be set by the parent
// Template.instance().data.contract

Template.viewByTag.onRendered(function() {

});

Template.viewByTag.helpers({
    contracts: function() {
        let tag = Template.instance().data.tag.get();
        let query = {};
        if (tag == 0) {
            query = {tags: {$exists: false}};
        }
        if (tag) {
            query = {tags: {$in: [tag]}};
        }

        return Pipeline.collections.ContractSource.find(query).fetch();
    },
    popoverContent: function() {
        devdoc = JSON.parse(this.devdoc);
        let str = '';
        if (devdoc.details) {
            str += devdoc.details + '; ';
        }
        if (devdoc.author) {
            str += devdoc.author;
        }
        return str;
    },
    modaldata: function() {
        return {
            id: 'abi_' + this._id,
            template: 'abiui',
            hiddenSave: true,
            abi: JSON.parse(this.abi),
            title: this.name
        }
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
    },
    'click label': function(event) {
        $('[data-toggle="popover"]').popover()
        $(event.currentTarget).popover('toggle');
    },
    'mouseover label': function(event) {
        $('[data-toggle="popover"]').popover()
        $(event.currentTarget).popover('show');
    },
    'mouseout label': function(event) {
        $('[data-toggle="popover"]').popover()
        $(event.currentTarget).popover('hide');
    },
    'click .abi': function(event) {
        $('#generalModal_abi_' + this._id).modal({backdrop: false});
    }
});
