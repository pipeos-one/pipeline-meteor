import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

export const insert = new ValidatedMethod({
  name: 'deployed_contract.insert',
  validate: Pipeline.schemas.DeployedContractSchema.validator(),
  run(obj) {

    return Pipeline.collections.DeployedContract.insert(obj);
  }
});
