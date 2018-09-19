import './pipecodepreview.html';
import './pipecodepreview.css';

Template.pipecodepreview.onCreated(function() {
    this.pipecode = this.data.pipecode;
    this.pipegram = this.data.pipegram;
    this.pipejscode = this.data.pipejscode;
    this.pipecode = this.data.pipecode;
    this.pipeinputs = this.data.pipeinputs;
    this.pipedeployed = this.data.pipedeployed;
});

Template.pipecodepreview.onRendered(function() {
    let self = this;

    Tracker.autorun(function() {
        let code = self.pipecode.get();
        $('#pipesoliditycode').val(code);
    });

    Tracker.autorun(function() {
        let code = self.pipegram.get();
        $('#pipegramcode').val(code);
    });

    Tracker.autorun(function() {
        let code = self.pipejscode.get();
        $('#pipejscode').val(code);
    });

    Tracker.autorun(function() {
        let code = self.data.pipedebugger.get();
        $('#pipedebugger').val(JSON.stringify(code));
    })

    $('#pipenav').tab();
});

Template.pipecodepreview.helpers({
    networkName: function() {
        let network = Pipeline.chains[web3.version.network];
        network = network.slice(0, 1).toUpperCase() + network.slice(1, network.length);
        return network;
    }
});

Template.pipecodepreview.events({
    'click #deploy': function() {
        let code = Template.instance().pipecode.get();
        let inputs = Template.instance().pipeinputs.get().slice(1);
        let addresses;

        inputs = inputs.map(function(input) {
            return input[1].split('_')[1];
        });
        console.log('inputs', inputs);

        addresses = inputs.map(function(name) {
            let _id = Pipeline.collections.ContractSource.findOne({name})._id;
            return Pipeline.collections.DeployedContract.findOne({contract_source_id: _id}).eth_address;
        });

        addresses.unshift(Pipeline.contracts.PipelineProxy[
            Pipeline.chains[web3.version.network]
        ]);
        console.log('addresses', addresses);

        let inst = Template.instance();
        Meteor.call('compile', code, function(err, output) {
            console.log(output);
            let compiled = output.contracts[':PipedContract'];
            let abi = JSON.parse(compiled.interface);
            let metadata = JSON.parse(compiled.metadata);
            let PipedContract = web3.eth.contract(abi);
            let sender = web3.eth.accounts[0];

            web3.eth.estimateGas({data: compiled.bytecode}, function(error, result) {
                let gasEstimate = result + 50000;

                console.log(gasEstimate, sender);
                var myContractReturned = PipedContract.new(...addresses, {
                    from: sender,
                    data: compiled.bytecode,
                    gas: gasEstimate,
                }, function(err, myContract){
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (!myContract.address) {
                        console.log(myContract.transactionHash)
                        inst.pipedeployed.set(null);
                    } else {
                        console.log('myContract', myContract)
                        inst.pipedeployed.set(myContract);

                        let source = {
                            name: 'PipedContract_' + new Date().getTime(),
                            abi: compiled.interface,
                            devdoc: JSON.stringify(metadata.output.devdoc),
                            userdoc: JSON.stringify(metadata.output.userdoc),
                            keccak256: '',
                            path: '',
                            source: code,
                            tags: [],
                            timestamp: new Date(),
                        }
                        let deployed = {
                            eth_address: myContract.address,
                            chain_id: web3.version.network,
                            bytecode_hash: compiled.bytecode,
                            bytecode_runtime_hash: compiled.runtimeBytecode,
                            timestamp: new Date(),
                        }
                        Meteor.call('contract_source.insert', source, function(error, id) {
                            console.log('contract_source', error, id);
                            if (error) return;
                            deployed.contract_source_id = id;
                            Meteor.call('deployed_contract.insert', deployed, function(error, result) {
                                console.log('deployed_contract', error, result);
                            });
                        });
                    }
                });
            });
        });
    }
});
