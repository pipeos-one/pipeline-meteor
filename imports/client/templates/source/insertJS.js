import SimpleSchema from 'simpl-schema';
import "/imports/lib/collections/JavascriptSource.js";
import "./insertJS.html";

Template.insertJS.helpers({
    JavascriptSourceSchema: function() {
        return Pipeline.schemas.JavascriptSourceSchema;
    },
    tagOptions: function() {
        return Pipeline.collections.Tag.find({}, {sort: {name: 1}}).map(function(tag) {
            return {value: tag._id, label: tag.name}
        });
    },
    buttonVisibility: function() {
        return Template.instance().data.buttonHidden ? 'hidden' : '';
    }
});

Template.insertJS.events({
    'click #insertTag': function(ev) {
        window.open('/insert/tag', 'InsertTag');
    }
})

AutoForm.hooks({
    insertJavascriptSource: {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {
            Meteor.call('js_source.insert', insertDoc, function(error, id) {
                console.log('js_source', error, id);
            });
        },
    },
});
