import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

export const insert = new ValidatedMethod({
  name: 'tag.insert',
  validate: Pipeline.schemas.TagSchema.validator(),
  run({ name, description, timestamp }) {

    Pipeline.collections.Tag.insert({
        name, description, timestamp
    });
  }
});
