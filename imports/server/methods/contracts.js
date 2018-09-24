import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';


export const getContractsFromNames = new ValidatedMethod({
    name: 'contracts.getFromNames',
    validate: function() {},
    run(contractNames, chain_id) {
        console.log('getFromNames', contractNames, chain_id)
        let sources = Pipeline.collections.ContractSource.find({
            name: {$in: contractNames}
        }).map(source => {
            console.log('source', source._id);
            let deployed = Pipeline.collections.DeployedContract.findOne({contract_source_id: source._id, chain_id: chain_id});

            source.eth_address = deployed.eth_address;
            return source;
        });
        return sources;
    }
});
