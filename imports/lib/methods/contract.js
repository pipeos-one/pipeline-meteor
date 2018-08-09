import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

export const insert = new ValidatedMethod({
    name: 'contract.insert',
    validate: function() {},
    run({ name, abi, devdoc, userdoc, keccak256, path, source, tags, timestamp, eth_address, chain_id, bytecode_hash, bytecode_runtime_hash}) {

        Meteor.call('contract_source.insert', { name, abi, devdoc, userdoc, keccak256, path, source, tags, timestamp }, function(error, response) {
            console.log('contract_source.insert', error, response)
        });

        // contract_source_id

        // Meteor.call('deployed_contract.insert', { eth_address, chain_id, bytecode_hash, bytecode_runtime_hash, timestamp });
    }
});
