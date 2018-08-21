import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';

import '/node_modules/bootstrap-treeview/dist/bootstrap-treeview.min.js';
import '/node_modules/bootstrap-treeview/dist/bootstrap-treeview.min.css';

import './pipetree.html';

Template.pipetree.onRendered(function() {
    let self = this
    self.functionAbi = this.data.functionAbi;
    self.contracts = this.data.contracts;

    self.autorun(function() {
        let contracts = self.contracts.get();

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

                // Reenable popovers
                window.setTimeout(function() {
                    $('.popover').remove();
                    addPopovers();
                }, 600);
            },
            onNodeExpanded: function(event, data) {
                // Reenable popovers
                window.setTimeout(function() {
                    $('.popover').remove();
                    addPopovers();
                }, 600);
            },
            onNodeCollapsed: function(event, data) {
                // Reenable popovers
                window.setTimeout(function() {
                    $('.popover').remove();
                    addPopovers();
                }, 600);
            }
        });

        addPopovers();
    });
});

Template.pipetree.events({
    'mouseover .node-pipetree': function(event) {
        $(event.currentTarget).popover('toggle');
    },
    'mouseout .node-pipetree': function(event) {
        $(event.currentTarget).popover('toggle');
    }
})

function addPopovers() {
    $('.node-pipetree').attr('data-container', 'body');
    $('.node-pipetree').attr('data-placement', 'right');
    $('.node-pipetree').attr('data-toggle', 'popover');
    $('.node-pipetree').attr('data-html', "true");
    $('.node-pipetree').map(function(id, elem) {addPopover(elem)});
    $('.node-pipetree').popover();
}

function addPopover(elem) {
    let nodeid = $(elem).data('nodeid');
    let node = $('#pipetree').treeview('getNode', nodeid);
    $(elem).attr('title', node.text);
    let content = ''
    if (node.userdoc && node.userdoc.notice) {
        content =  node.userdoc.notice;
        content = addPopoverParams(content, node.userdoc);
    }
    if (node.devdoc) {
        if(node.userdoc && node.userdoc.notice && node.devdoc.details) {
            content += '</br></br>';
        }
        if (node.devdoc.details) {
            content += node.devdoc.details;
        }
        content = addPopoverParams(content, node.devdoc);
    }
    $(elem).attr('data-content', content);
}

function addPopoverParams(content, doc) {
    if (doc.params) {
        let names = Object.keys(doc.params);
        if (names.length) {
            content += '</br></br>';
        }
        names.forEach(function(name) {
            let info = doc.params[name];
            content += `<label>${name}: </label>`
            content += ` ${info} </br>`
        });
    }
    if (doc.return) {
        content += `<label>return: </label> ` + doc.return
    }
    return content;
}


function getTree(contracts) {
    return contracts.map(function(contract) {
        return {
            text: contract.name,
            nodes: getTreeLeaves(contract, contract.abi)
        }
    });
}

function getTreeLeaves(contract, abi) {
    let leaves = []
    abi.forEach(function(item) {
        let funcIdentifier = getAbiIdentifier(item);
        let leaf;
        if (item.type == 'function') {
            leaf = {
                text: item.name,
                contract: contract
            }
        } else if (item.type == 'constructor') {
            leaf = {text: 'constructor'};
        }
        if (leaf) {
            leaf.abi = item;
            if (contract.devdoc.methods) {
                leaf.devdoc = contract.devdoc.methods[funcIdentifier]
            }
            if (contract.userdoc.methods) {
                leaf.userdoc = contract.userdoc.methods[funcIdentifier]
            }
            leaf.backColor = item.constant ? null : "#E9DEDE";
            // leaf.icon = item.constant ? 'glyphicon glyphicon-info-sign' : 'glyphicon glyphicon-export';
            leaves.push(leaf);
        }
    });
    return leaves;
}
//acceptFulfillment(uint256,uint256)
function getAbiIdentifier(abi) {
    if (!abi.name) return;

    let inputTypes = [];
    if (abi.inputs) {
        inputTypes = abi.inputs.map(function(input) {
            return input.type;
        }).join(',');
    }
    return `${abi.name}(${inputTypes})`;
}
