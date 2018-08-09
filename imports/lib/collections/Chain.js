import SimpleSchema from 'simpl-schema';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

SimpleSchema.extendOptions(['autoform']);

Pipeline.collections.Chain = new Mongo.Collection('chain');

Pipeline.schemajson.Chain = {
    chain_id: {
        type: Number
    },
    name: {
        type: String,
        optional: true
    },
    description: {
        type: String,
        optional: true
    },
}

Pipeline.schemas.ChainSchema = new SimpleSchema(Pipeline.schemajson.Chain);
Pipeline.collections.Chain.attachSchema(Pipeline.schemas.ChainSchema);
