import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Pipeline from '/imports/lib/_firstToLoad/_namespace.js';

export const jsinsert = new ValidatedMethod({
    name: 'js_source.insert',
    validate: Pipeline.schemas.JavascriptSourceSchema.validator(),
    run(doc) {

        try {
            JSON.parse(doc.abi)
        }
        catch (error) {
            throw new Meteor.Error('contract_source.insert.validation',
              'abi is not a valid JSON');
        }

        try {
            JSON.parse(doc.devdoc)
        }
        catch (error) {
            throw new Meteor.Error('contract_source.insert.validation',
              'devdoc is not a valid JSON');
        }

        try {
            JSON.parse(doc.userdoc)
        }
        catch (error) {
            throw new Meteor.Error('contract_source.insert.validation',
              'userdoc is not a valid JSON');
        }

        return Pipeline.collections.JavascriptSource.insert(doc);
    }
});

export const getJS = new ValidatedMethod({
    name: 'js_source.getJS',
    validate: () => {},
    run(_id) {
        console.log('_id', _id)
        let jsfunction = Pipeline.collections.JavascriptSource.findOne({_id});
        // jsfunction = new Function()
        //console.log('jsfunction.jssource', jsfunction.js_source);
        // let js = JSON.parse(jsfunction.js_source);
        // console.log('jsfunction.jssource', js);
        let func = eval('var add = function(x,y) {return x + y;}');
        console.log(add);
        return add
    }
});
