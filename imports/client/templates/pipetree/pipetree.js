import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';

import '/node_modules/bootstrap-treeview/dist/bootstrap-treeview.min.js';
import '/node_modules/bootstrap-treeview/dist/bootstrap-treeview.min.css';

import './pipetree.html';

Template.pipetree.onRendered(function() {
    let self = this
    self.functionAbi = this.data.functionAbi;
    self.contracts = this.data.contracts;

    Tracker.autorun(function() {
        let contract_ids = self.contracts.get();
        let contracts = Pipeline.collections.ContractSource.find({_id: {$in: contract_ids}}).fetch()
        //$('#pipetree').treeview('remove');
        $('#pipetree').treeview({
            data: getTree(contracts),
            //expandIcon: 'glyphicon glyphicon-chevron-rigth',
            //collapseIcon: 'glyphicon glyphicon-chevron-down',
            onNodeSelected: function(event, data) {
                let selected = $('#pipetree').treeview('getSelected')[0];
                selected = {
                    abi: selected.abi,
                    contract: selected.contract,
                }
                self.functionAbi.set(selected);
            }
        });
    });
});


function getTree(contracts) {
    return contracts.map(function(contract) {
        return {
            text: contract.name,
            nodes: getTreeLeaves(contract, JSON.parse(contract.abi))
        }
    });
}

function getTreeLeaves(contract, abi) {
    let leaves = []
    abi.forEach(function(item) {
        let leaf;
        if (item.type == 'function') {
            leaf = {text: item.name, abi: item, contract};
        } else if (item.type == 'constructor') {
            leaf = {text: 'constructor', abi: item};
        }
        if (leaf) {
            leaf.backColor = item.constant ? null : "#E9DEDE";
            // leaf.icon = item.constant ? 'glyphicon glyphicon-info-sign' : 'glyphicon glyphicon-export';
            leaves.push(leaf);
        }
    });
    return leaves;
}
