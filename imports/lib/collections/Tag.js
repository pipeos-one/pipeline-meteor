import SimpleSchema from 'simpl-schema';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

Pipeline.collections.Tag = new Mongo.Collection('tag');

Pipeline.schemajson.Tag = {
    name: {
        type: String
    },
    description: {
        type: String,
        optional: true
    },
    timestamp: {
        type: Date,
        optional: true,
        autoValue: function() {
            return new Date()
        }
    }
}

Pipeline.schemas.TagSchema = new SimpleSchema(Pipeline.schemajson.Tag);
Pipeline.collections.Tag.attachSchema(Pipeline.schemas.TagSchema);
