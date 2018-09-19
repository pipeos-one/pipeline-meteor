import { Template } from 'meteor/templating';
import './debugger.html';


Template.pipedebugger.onCreated(function() {
    let self = this;
    self.showdebugger = new ReactiveVar();
    self.functions = new ReactiveVar([]);

    self.autorun(function() {
        self.data.pipedebugger.get();
        self.showdebugger.set(false);
        setTimeout(function() {
            self.showdebugger.set(true);
        }, 100);
    })

    self.autorun(function() {
        let functionAbi = self.data.functionAbi.get();
        if (!functionAbi) return;
        Tracker.nonreactive(function() {
            let functions = self.functions.get();
            functions.push(functionAbi);
            self.functions.set(functions);
        });
    });
});

Template.pipedebugger.onRendered(function() {
    let self = this;
    self.autorun(function() {
        let pipedebugger = Template.instance().data.pipedebugger.get();
        if (!pipedebugger) return;

        setTimeout(function() {
            pipedebugger.map((debug, index) => {
                let main_function_name = `PipedFunction${index + 1}`;
                debug.io[main_function_name].map(output => {
                    Object.keys(output).map(output_name => {
                        $(`input[id*="${main_function_name}_input_${output_name}"]`).change(event => {
                            let value = $(event.currentTarget).val();
                            output[output_name].map(linked_functions => {
                                $(`input[id*="${linked_functions.function}_input_${linked_functions.argument}"]`).val(value);
                            });
                        });
                    });
                });

                for (function_name in debug.io) {
                    if (function_name == main_function_name) continue;
                    debug.io[function_name].map(output => {
                        Object.keys(output).map(output_name => {
                            $(`input[id*="${function_name}_output_${output_name}"]`).change(event => {
                                let value = $(event.currentTarget).val();
                                output[output_name].map(linked_functions => {
                                    $(`input[id*="${linked_functions.function}_input_${linked_functions.argument}"]`).val(value);
                                });
                            });
                        });
                    });
                }
            });
        }, 500);
    });
});

Template.pipedebugger.helpers({
    log: function(val) {
        console.log('log', val);
    },
    data: function() {
        let pipedebugger = Template.instance().data.pipedebugger.get();
        if (!pipedebugger) return [];

        let functionAbis = Template.instance().functions.get();

        return pipedebugger.map(function(pipefunction, index1) {
            let functions = [];

            functions.push({
                id: `pipedebugger_${index1}`,
                contract: {
                    abi: [pipefunction.abi[0]] || []
                }
            });
            pipefunction.abi.slice(1).forEach(function(data, index2) {
                let func = functionAbis.filter(func => func.abi.name == data.name)[0];
                let deployed_address = Pipeline.collections.DeployedContract.findOne({contract_source_id: func.contract._id}).eth_address;
                let contract = web3.eth.contract(func.contract.abi).at(deployed_address);

                functions.push({
                    id: `pipedebugger_${index1}_${index2}`,
                    contract,
                    shown_functions: [data.name],
                })
            });
            return functions;
        });
    },
    showdebugger: function() {
        return Template.instance().showdebugger.get();
    }
});
