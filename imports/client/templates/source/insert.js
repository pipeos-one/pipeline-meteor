import SimpleSchema from 'simpl-schema';
import "/imports/lib/collections/ContractSource.js";
import "./insert.html";
import "./insert.css";

Template.insert.helpers({
    CustomSchema: function() {
        let schema = Object.assign(
            {},
            Pipeline.schemajson.ContractSource,
            Pipeline.schemajson.DeployedContract
        )
        schema.contract_source_id.optional = true;
        return new SimpleSchema(schema)
    },
    tagOptions: function() {
        return Pipeline.collections.Tag.find({}, {sort: {name: 1}}).map(function(tag) {
            return {value: tag._id, label: tag.name}
        });
    },
    buttonVisibility: function() {
        return Template.instance().data.buttonHidden ? 'hidden' : '';
    }
});

Template.insert.events({
    'click #insertTag': function(ev) {
        window.open('/insert/tag', 'InsertTag');
    }
})

AutoForm.hooks({
    insertContractSource: {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {
            let self = this;
            let source = {
                name: insertDoc.name,
                abi: insertDoc.abi,
                devdoc: insertDoc.devdoc,
                userdoc: insertDoc.userdoc,
                keccak256: insertDoc.keccak256,
                path: insertDoc.path,
                source: insertDoc.source,
                tags: insertDoc.tags,
                timestamp: new Date(),
            }
            let deployed = {
                eth_address: insertDoc.eth_address,
                chain_id: insertDoc.chain_id,
                bytecode_hash: insertDoc.bytecode_hash,
                bytecode_runtime_hash: insertDoc.bytecode_runtime_hash,
                timestamp: new Date(),
            }
            Meteor.call('contract_source.insert', source, function(error, id) {
                console.log('contract_source', error, id);
                deployed.contract_source_id = id;
                Meteor.call('deployed_contract.insert', deployed, function(error, result) {
                    console.log('deployed_contract', error, result);
                    self.done();
                });
            });
        },
        beginSubmit: function() {
            console.log('beginSubmit')
            this.event.preventDefault();
            return false;
        },
        endSubmit: function() {
            console.log('endSubmit')
            this.event.preventDefault();
            return false;
        },
        onSuccess: function(formType, result) {
            console.log('onSuccess', formType, result)
            this.event.preventDefault();
            return false;
        },
        onError: function(formType, error) {
            console.log('onError', formType, error)
        },
    },
});
