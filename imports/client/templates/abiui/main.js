import { Tracker } from 'meteor/tracker';
import AbiUI from './abiui.js';
import './main.html';
import './main.css';
import '../eventlog/eventlog.js';


Template.abiuiWrap.helpers({
    abi: function() {
        return Pipeline.collections.ContractSource.findOne({_id: FlowRouter.getParam('_id')});
    },
    data: function() {
        let id, contract, contract_source, contract_deployed;

        id = FlowRouter.getParam('_id');
        contract_source = Pipeline.collections.ContractSource.findOne({_id: id});
        contract_deployed = Pipeline.collections.DeployedContract.findOne({contract_source_id: id});
        
        if (web3.isConnected()) {
            contract = web3.eth.contract(
                JSON.parse(contract_source.abi)
            ).at(contract_deployed.eth_address);
        }
        else {
            contract = {
                abi: JSON.parse(contract_source.abi)
            }
        }
        contract.name = contract_source.name;
        return {id, contract}
    }
})

Template.abiui.onRendered(function() {
    let domid = 'abiui_' + Template.instance().data.id
    let contract_instance = Template.instance().data.contract
    if (contract_instance) {
        this.abiui = new AbiUI(contract_instance, domid);
        this.abiui.show();
    }
});

Template.abiui.helpers({
    data: function() {
        return {
            contractInstance: Template.instance().data.contract,
            contractName: Template.instance().data.contract.name,
        }
    }
});

AutoForm.hooks({
  abiForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        console.log(insertDoc, updateDoc, currentDoc);
      if (customHandler(insertDoc)) {
        this.done();
      } else {
        this.done(new Error("Submission failed"));
      }
      return false;
    }
  }
});
