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
                        $(`input[id$="${main_function_name}_input_${output_name}"]`).change(event => {
                            let value = $(event.currentTarget).val();
                            output[output_name].map(linked_functions => {
                                $(`input[id$="${linked_functions.function}_input_${linked_functions.argument}"]`).val(value);
                            });
                        });
                    });
                });

                for (function_name in debug.io) {
                    if (function_name == main_function_name) continue;
                    debug.io[function_name].map(output => {
                        Object.keys(output).map(output_name => {
                            $(`input[id$="${function_name}_output_${output_name}"]`).change(event => {
                                let value = $(event.currentTarget).val();
                                output[output_name].map(linked_functions => {
                                    $(`input[id$="${linked_functions.function}_input_${linked_functions.argument}"]`).val(value);
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
                let contract_function;
                let func = JSON.parse(JSON.stringify(functionAbis.filter(func => func.abi.name == data.name)[0]));

                let deployed = Pipeline.collections.DeployedContract.findOne({contract_source_id: func.contract._id, chain_id: String(web3.version.network)});
                if (deployed) {
                    let contract = web3.eth.contract(func.contract.abi).at(deployed.eth_address);

                    contract_function = {
                        id: `pipedebugger_${index1}_${index2}`,
                        contract,
                        shown_functions: [data.name],
                    }
                }
                let source = Pipeline.collections.JavascriptSource.findOne({_id: func.contract._id});
                if (source) {
                    let abi = JSON.parse(source.abi);
                    abi.render = source.render;
                    abi.run = source.js_source;
                    abi = [abi];
                    contract_function = {
                        id: `pipedebugger_${index1}_${index2}`,
                        contract: { abi },
                        shown_functions: [data.name],

                    }
                }

                let indx = contract_function.contract.abi.findIndex(func => func.name == data.name);
                if (data.newName) {
                    contract_function.contract.abi[indx].newName = data.newName;
                }

                let inputs = contract_function.contract.abi[indx].inputs.map((input, index) => {
                    let newInputName = data.args_map.ins[`${input.type}: ${input.name}`];
                    if (newInputName) {
                        input.newName = newInputName.split(': ')[1];
                    }
                    return input;
                });
                contract_function.contract.abi[indx].inputs = inputs;
                let outputs = contract_function.contract.abi[indx].outputs.map((output, index) => {
                    let newOutputName = data.args_map.outs[`${output.type}: ${output.name}`];
                    if (newOutputName) {
                        output.newName = newOutputName.split(': ')[1];
                    }
                    return output;
                });
                contract_function.contract.abi[indx].outputs = outputs;
                functions.push(contract_function);
            });
            return functions;
        });
    },
    showdebugger: function() {
        return Template.instance().showdebugger.get();
    }
});
