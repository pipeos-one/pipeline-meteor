import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

export const insert = new ValidatedMethod({
  name: 'contract_source.insert',
  validate: Pipeline.schemas.ContractSourceSchema.validator(),
  run({ name, abi, devdoc, userdoc, keccak256, path, source, tags, timestamp }) {

    try {
        JSON.parse(abi)
    }
    catch (error) {
        throw new Meteor.Error('contract_source.insert.validation',
          'abi is not a valid JSON');
    }

    try {
        JSON.parse(devdoc)
    }
    catch (error) {
        throw new Meteor.Error('contract_source.insert.validation',
          'devdoc is not a valid JSON');
    }

    try {
        JSON.parse(userdoc)
    }
    catch (error) {
        throw new Meteor.Error('contract_source.insert.validation',
          'userdoc is not a valid JSON');
    }

    return Pipeline.collections.ContractSource.insert({
      name, abi, devdoc, userdoc, keccak256, path, source, tags, timestamp
    });
  }
});
