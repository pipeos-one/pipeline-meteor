import SimpleSchema from 'simpl-schema';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

Pipeline.collections.DeployedContract = new Mongo.Collection('deployed_contract');

Pipeline.schemajson.DeployedContract = {
    contract_source_id: {
        type: String
    },
    eth_address: {
        type: String
    },
    chain_id: {
        type: String
    },
    bytecode_hash: {
        type: String
    },
    bytecode_runtime_hash: {
        type: String
    },
    auditors: {
        type: Array,
        optional: true,
    },
    'auditors.$': {
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

Pipeline.schemas.DeployedContractSchema = new SimpleSchema(Pipeline.schemajson.DeployedContract);

Pipeline.collections.DeployedContract.attachSchema(Pipeline.schemas.DeployedContractSchema);
