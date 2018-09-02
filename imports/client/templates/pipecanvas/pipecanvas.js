import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import joint from '/imports/client/lib/external/joint.js';
import '/imports/client/lib/external/joint.css';

import './pipecanvas.html';
import './pipecanvas.css';
import toJavascript from './toJs.js';
import GraphsToSolidity from './toSolidity.js';

Template.pipecanvas.onCreated(function() {
    let self = this;
    self.functionAbi = self.data.functionAbi;
    self.pipecode = self.data.pipecode;
    self.pipegram = self.data.pipegram;
    self.pipejscode = self.data.pipejscode;
    self.pipeinputs = self.data.pipeinputs;
    self.graph_index = new ReactiveVar(0);
    self.max_graph_index = new ReactiveVar(0);
});

Template.pipecanvas.events({
    'click #pipecopy': function() {
        $('.tab-pane.active textarea')[0].select();
        document.execCommand("copy");
    },
    'click #addGraph': function() {
        let max_graph_index = Template.instance().max_graph_index.get();
        Template.instance().max_graph_index.set(++max_graph_index);
        Template.instance().graph_index.set(max_graph_index);
        let inst = Template.instance();
        setTimeout(function() {
            addGraph(inst);
        }, 500);
    },
    'click #pipecanvasnav li': function(event) {
        let index = parseInt(this.name.slice(8)) - 1;
        Template.instance().graph_index.set(index);
    }
});

Template.pipecanvas.helpers({
    tab: function() {
        let max_graph_index = Template.instance().max_graph_index.get();
        return [...Array(max_graph_index + 1).keys()].map(function(index) {
            return {name: `function${index + 1}`};
        });
    }
});

Template.pipecanvas.onRendered(function() {
    let self = this
    self.papers = []
    self.graphs = []
    self.nodes = []

    self.update = function() {
        let pipegram = JSON.stringify(
            self.graphs.map(function(graph) {
                return graph.toJSON();
            })
        );
        let graphs_to_sol = new GraphsToSolidity(self.graphs);
        let pipecode = graphs_to_sol.toSolidity();
        let pipejscode = '';
        let input_args = ['address _seth_proxy'].concat(graphs_to_sol.ffunc).map(function(arg) {
            return arg.split(' ');
        });
        graphs_to_sol.graphs.map(function(graph, index) {
            pipejscode += toJavascript(graph.graph, graph.inputs, index + 1) + '\n';
        });
        self.pipegram.set(pipegram);
        self.pipecode.set(pipecode);
        self.pipejscode.set(pipejscode);
        self.pipeinputs.set(input_args);
    }

    joint.dia.ElementView.prototype.pointerdown = function(evt, x, y) {
       var data = this.eventData(evt);
        if (data.stopPropagation) return;
        joint.dia.CellView.prototype.pointerdown.apply(this, arguments);
        this.notify('element:pointerdown', evt, x, y);
        this.dragStart(evt, x, y);
    };

    addGraph(self);

    Tracker.autorun(function() {
        let contract_function = self.functionAbi.get();
        Tracker.nonreactive(function() {
            let graph_index = self.graph_index.get();
            console.log('add node graph_index', graph_index);
            if (contract_function) {
                if (!self.nodes[graph_index]) {
                    self.nodes[graph_index] = [];
                }
                self.nodes[graph_index] = addNode(self.graphs[graph_index], self.nodes[graph_index], contract_function)
            }
        });
    });

    $($('#pipecanvasnav li')[0]).addClass('active');
    $('#function1').addClass('active');

});

function addGraph(self) {
    let index = self.papers.length;
    console.log('addGraph', index);
    self.graphs.push(new joint.dia.Graph);
    paper = new joint.dia.Paper({
        el: document.getElementById(`paper_function${index + 1}`),
        width: "100%",
        height: "100%",
        gridSize: 2,
        model: self.graphs[index],
        snapLinks: true,
        defaultLink: new joint.dia.Link({
            router: { name: 'manhattan', args: { startDirections: ['left','right'],endDirections: ['left','right'] } },
            attrs: {
                '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z', fill: '#fff', stroke: '#000' },
                '.link-tools .tool-remove circle, .marker-vertex': { r: 8 },
                '.connection': {
                    stroke: '#000', 'stroke-width': 2
                }
            }
        }),
        highlighting: {
            'default': {
                name: 'stroke',
                options: {
                    padding: 6
                }
            },
            'embedding': {
                name: 'addClass',
                options: {
                    className: 'highlighted-parent'
                }
            }
        },

        validateEmbedding: function(childView, parentView) {

            return parentView.model instanceof joint.shapes.devs.Coupled;
        },

        validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet, e) {
            // console.log(sourceView,sourceMagnet.getAttribute("port"),targetMagnet)
            let src = sourceMagnet.getAttribute("port").split(": ");
            let trg = targetMagnet.getAttribute("port").split(": ");
            let sio = sourceMagnet.getAttribute("port-group");
            let tio = targetMagnet.getAttribute("port-group");

            return src[0] == trg[0] && sourceMagnet != targetMagnet && sio != tio;
        },
        markAvailable: true
    });
    self.papers.push(paper);

    self.papers[index].options.defaultConnector = {
        name: 'rounded',
        args: {
            radius: 10
        }
    }

    self.papers[index].on('cell:pointerdblclick',
        function(cellView, evt, x, y) {
            cellView.model.remove();
            self.update();
        }
    );

    self.graphs[index].on('change', function() {
        self.update();
    });
    console.log(self);
}

function addNode(graph, nodes, contract_function) {
    // console.log('addNode', contract_function)
    abi = contract_function.abi
    pname = contract_function.contract.name
    nodetext = abi.name
    let color = "#ddd", ins = [], outs = [];
    if (abi.type == 'event') {
        outs = abi.inputs.map(function(input) {
            return `${input.type}: ${input.name}`
        })
        color = '#C9DEBB';
    }
    else {
        ins = abi.inputs.map(function(input) {
            return `${input.type}: ${input.name}`
        })
        outs = abi.outputs.map(function(output) {
            return `${output.type}: ${output.name}`
        })
        if (!abi.constant) {
            color = "#edd";
        }
    }

    nodes.push(
            new joint.shapes.devs.Atomic({
            position: {
                x: 200,
                y: 100
            },
            size: {
                width: Math.max(pname.length +nodetext.length)*8+20,
                height: Math.max(ins.length,outs.length)*22+20
            },
            inPorts: ins,
            outPorts: outs,
            attrs: {
                '.label': { text: pname+".\n"+nodetext, 'ref-x': .5, 'ref-y': 0.1 },
                rect: { rx:10, ry:10,
                    fill: color,
                    stroke: '#222',
                    'stroke-width': 2
                },
                pipeline: {
                    contract: {
                        address: contract_function.contract.address,
                        name: contract_function.contract.name,
                    },
                    abi: contract_function.abi,
                }

            }
        }).addTo(graph)
    )
    return nodes
}
