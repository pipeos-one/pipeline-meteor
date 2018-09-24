import SimpleSchema from 'simpl-schema';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

SimpleSchema.extendOptions(['autoform']);

Pipeline.collections.JavascriptSource = new Mongo.Collection('javascript_source');

Pipeline.schemajson.JavascriptSourceSchema = {
    name: {
        type: String,
        optional: true,
    },
    abi: {
        type: String
    },
    devdoc: {
        type: String
    },
    userdoc: {
        type: String
    },
    keccak256: {
        type: String,
        optional: true,
    },
    path: {
        type: String,
        optional: true,
    },
    solidity_source: {
        type: String
    },
    render: {
        type: String,
        optional: true,
    },
    js_source: {
        type: String
    },
    deployed_contracts: {
        type: Array,
        optional: true,
    },
    'deployed_contracts.$': {
        type: String
    },
    tags: {
        type: Array,
        optional: true,
    },
    'tags.$': {
        type: String
    },
    timestamp: {
        type: Date,
        optional: true,
        autoValue: function() {
            return new Date()
        }
    }
}

Pipeline.schemas.JavascriptSourceSchema = new SimpleSchema(Pipeline.schemajson.JavascriptSourceSchema);
Pipeline.collections.JavascriptSource.attachSchema(Pipeline.schemas.JavascriptSourceSchema);
