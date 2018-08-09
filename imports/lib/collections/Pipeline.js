import SimpleSchema from 'simpl-schema';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

Pipeline.collections.Pipeline = new Mongo.Collection('pipeline');

Pipeline.schemajson.Pipeline = {
    contract_source_id: {
        type: String
    },
    deployed_contract_id: {
        type: String
    },
    diagram_source: {
        type: String
    },
    creators: {
        type: Array
    },
    'creators.$': {
        type: String
    },
    deployer: {
        type: String
    },
    timestamp: {
        type: Date,
        autoValue: function() {
            return new Date()
        }
    }
}

Pipeline.schemas.PipelineSchema = new SimpleSchema(Pipeline.schemajson.Pipeline);
Pipeline.collections.Pipeline.attachSchema(Pipeline.schemas.PipelineSchema);
