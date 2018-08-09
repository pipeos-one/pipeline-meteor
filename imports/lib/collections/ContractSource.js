import SimpleSchema from 'simpl-schema';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

SimpleSchema.extendOptions(['autoform']);

Pipeline.collections.ContractSource = new Mongo.Collection('contract_source');

Pipeline.schemajson.ContractSource = {
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
    source: {
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

Pipeline.schemas.ContractSourceSchema = new SimpleSchema(Pipeline.schemajson.ContractSource);
Pipeline.collections.ContractSource.attachSchema(Pipeline.schemas.ContractSourceSchema);

Pipeline.schemajson.AbiFunction = {
    constant: {
        type: Boolean
    },
    inputs: {
        type: Array
    },
    'inputs.$': Object,
    'inputs.$.name': String,
    'inputs.$.type': String,
    'inputs.$.indexed': {
        type: Boolean,
        optional: true,
    },
    name: {
        type: String,
    },
    outputs: {
        type: Object
    },
    'outputs.$': Object,
    'outputs.$.name': String,
    'outputs.$.type': String,
    payable: {
        type: Boolean,
        defaultValue: false,
    },
    stateMutability: {
        type: String,
        allowedValues: [
            'pure',
            'view',
            'nonpayable',
            'payable'
        ]
    },
    type: {
        type: String,
        allowedValues: [
            'function',
            'event',
            'constructor',
            'fallback',
        ]
    },
    anonymous: {
        type: Boolean,
        optional: true,
    }
}

Pipeline.schemas.AbiFunction = new SimpleSchema(Pipeline.schemajson.AbiFunction);
