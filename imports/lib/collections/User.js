import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

Pipeline.collections.User = Meteor.users;

Pipeline.schemas.UserSchema = new SimpleSchema({
    eth_address: {
        type: String
    },
    chain_id: {
        type: String,
        optional: true
    },
    webProvider: {
        type: String,  // protocol + ip + port
        optional: true
    },
    timestamp: {
        type: Date,
        autoValue: function() {
            return new Date()
        }
    }
});

Pipeline.collections.User.attachSchema(Pipeline.schemas.UserSchema);
