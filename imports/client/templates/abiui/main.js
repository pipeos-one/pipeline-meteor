import { Tracker } from 'meteor/tracker';
import AbiUI from './abiui.js';
import './main.html';
import './main.css';


Template.abiuiWrap.onCreated(function() {
    let self = this;
    self.abi = new ReactiveVar();

    Tracker.autorun(function() {
        id = FlowRouter.getParam('_id');
        contract = Pipeline.collections.ContractSource.findOne({_id: id});
        if (contract) {
            self.abi.set(JSON.parse(contract.abi));
        }
    });
});

Template.abiuiWrap.helpers({
    abi: function() {
        return Template.instance().abi.get()
    },
    data: function() {
        let abi = Template.instance().abi.get()
        return {
            id: FlowRouter.getParam('_id'),
            abi: abi
        }
    }
})

Template.abiui.onRendered(function() {
    let domid = 'abiui_' + Template.instance().data.id
    let contract_abi = Template.instance().data.abi
    if (contract_abi) {
        this.abiui = new AbiUI({address: '0xfsdfsd'}, contract_abi, domid);
        this.abiui.show();
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
