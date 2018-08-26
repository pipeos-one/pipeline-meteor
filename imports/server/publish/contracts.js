import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';
import '/imports/lib/collections/ContractSource.js';
import '/imports/lib/collections/DeployedContract.js';
import '/imports/lib/collections/Tag.js';

Meteor.publish('all', function () {
    return [
        Pipeline.collections.ContractSource.find({}),
        Pipeline.collections.DeployedContract.find({}),
        Pipeline.collections.Tag.find({})
    ]
});
