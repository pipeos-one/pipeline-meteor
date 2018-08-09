// import '/imports/client/lib/external/backbone.js';
// import '/imports/client/lib/external/joint.js';
import '/imports/client/lib/external/jstree.min.js';

import './pipetree.js';

import './pipe.html';
// import './pipe.css';
//
// import '/client/lib/external/joint.css';
// import 'bs-select/bootstrap-select.css';
// import 'style.min.css';
// import 'style.css';

Template.pipe.helpers({
    contract_id: function() {
        contracts = Template.instance().data.contracts.get();
        contracts_path = FlowRouter.getParam('contracts').split(',');

        contracts = contracts.concat(contracts_path);

        return contracts;
    }
})
