import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';


export const getContractsFromNames = new ValidatedMethod({
    name: 'contracts.getFromNames',
    validate: function() {},
    run(contractNames) {
        let sources = Pipeline.collections.ContractSource.find({
            name: {$in: contractNames}
        }).map((source) => {
            let deployed = Pipeline.collections.DeployedContract.findOne({contract_source_id: source._id});

            source.eth_address = deployed.eth_address;
            return source;
        });
        return sources;
    }
});
