class ContractCommunication {
    getHtml() {
        let self = this;
        let html = '';
        this.io_abi.map(function(val, i) {
            html += `<div class="row ${self.domclass}">`;
            html += `<div class="col-sm-4" align="right"><label class="abi_label">${val.newName || val.name}</label></div>`
            html += `<div class="col-sm-8"><input type="text" value="" class="form-control sm" id="${self.html_id}_${val.newName || val.name}" placeholder="${val.type}"></div>`
            html += '</div>';
        }).join(',');

        return html;
    }

    show() {
        this.parent_elem.append(this.getHtml());
        this.elem = $('#' + this.html_id);
    }

    get() {
        let self = this;
        return this.io_abi.map(function(val, i) {
            return $(`#${self.html_id}_${val.newName || val.name}`).val();
        });
    }

    set(value, index=0) {
        let self = this;
        if (value instanceof Array) {
            value.forEach(function(val, i) {
                self.set(val, i);
            });
        }
        else {
            let name = this.io_abi[index].newName || this.io_abi[index].name;
            $(`#${self.html_id}_${name}`).val(value).change();
        }
    }

    clear() {

    }
}

class ContractInput extends ContractCommunication {
    constructor(id, parent_elem, inputs_abi) {
        super()
        this.id = id
        this.parent_elem = parent_elem
        this.io_abi = inputs_abi
        this.html_id = 'in_' + this.id
        this.domclass = 'inputs'
    }
}

class ContractOutput extends ContractCommunication {
    constructor(id, parent_elem, outputs_abi) {
        super()
        this.id = id
        this.parent_elem = parent_elem
        this.io_abi = outputs_abi
        this.html_id = 'out_' + this.id
        this.domclass = 'outputs'
    }

    getHtml() {
        return '<hr width="49%" class="abi">' + super.getHtml();
    }
}

class ContractFunction {
    constructor(contract, func_abi, parent_elem) {
        this.contract = contract
        this.func_abi = func_abi
        this.parent_elem = parent_elem
        this.id = contract.address ? contract.address.slice(-8) : new Date().getTime();
        this.id += '_' + (func_abi.newName || func_abi.name);
        this.init();
    }

    getHtml() {
        return '<div class="form-group row" id="' + this.id + '" style="margin-left: 15px;margin-right: 2px;"></div>';
    }

    getButtonHtml() {
        let type = ['view', 'pure'].indexOf(this.func_abi.stateMutability) > -1 ? "btn-call" : "btn-txn"
        return '<div class="row"><div class="col-sm-12"><button type="button" class="btn ' + type + ' btn-block" id="button_' + this.id + '">' + this.func_abi.name + '</button></div></div>';
    }

    render() {
        let self = this;
        let element = self.func_abi.render;
        if (element) {
            let js_source = self.func_abi.run;
            self.elem.append(element);
            self.elem.children().last().click(event => {
                let func_name = 'Pipeline_temp_' + String(new Date().getTime());
                eval('window.' + func_name + ' =' + js_source);

                if (self.inputs) {
                    let inputs = self.inputs.get();
                    self.outputs.set(window[func_name](...inputs));
                }
                else {
                    self.outputs.set(window[func_name]());
                }
                alert('The result was computed using the corresponding JavaScript component: \n' + js_source);
            });
        }
    }

    init() {
        this.parent_elem.append(this.getHtml());
        this.elem = $('#' + this.id);
        this.showButton();
        this.render();

        if (this.func_abi.payable) {
            this.value_input = new ContractInput(this.id + '_input' , this.elem, [{name: 'WEI', type: '0'}]);
        }

        if (this.func_abi.inputs.length > 0) {
            this.inputs = new ContractInput(this.id + '_input' , this.elem, this.func_abi.inputs);
        }
        if (this.func_abi.outputs.length > 0) {
            this.outputs = new ContractOutput(this.id + '_output' , this.elem, this.func_abi.outputs);
        }
    }

    showButton() {
        let self = this;
        let inputs = [];
        let eth_value = 0;

        self.elem.append(this.getButtonHtml());
        $('#button_' + this.id).click(function(event) {
            if (self.inputs) {
                inputs = self.inputs.get();
            }
            if (self.value_input) {
                eth_value = parseInt(self.value_input.get()[0] || 0);
            }
            self.contract[self.func_abi.name](
                ...inputs,
                {value: eth_value},
                function(error, txn_hash) {
                    console.log('value', txn_hash);
                    if (self.outputs && txn_hash) {
                        self.outputs.set(txn_hash);
                    }
                    if (!self.func_abi.constant) {
                        let network = Pipeline.chains[web3.version.network];
                        network = network.slice(0, 1).toUpperCase() + network.slice(1, network.length);
                        let link_etherscan = `https://${network}.etherscan.io/tx/${txn_hash}`;
                        let id = `txhash_${this.html_id}`;
                        $(`#${id}`).remove();
                        self.elem.append(`<a id="${id}" href="${link_etherscan}" target="_blank">${link_etherscan}</a>`);
                    }
                }
            );
        });
    }

    show() {
        if (this.value_input)
            this.value_input.show();
        if (this.inputs)
            this.inputs.show();
        if (this.outputs)
            this.outputs.show();
    }

    clear() {

    }
}

class AbiUI {
    constructor(contract_instance, domid, shown_functions=null) {
        this.contract = contract_instance
        this.abi = contract_instance.abi
        this.domid = 'abi_' + domid
        this.components = []
        this.shown_functions = shown_functions
        // container-fluid
        $('#' + domid).append('<div class="" id="' + this.domid + '">');
        this.elem = $('#' + this.domid)

        this.init();
    }

    init() {
        let shown_abis = this.shown_functions ? this.abi.filter(abi => this.shown_functions.find(name => name == abi.name)) : this.abi;

        for (let elem of shown_abis) {
            if (elem.type == 'function') {
                this.components.push(new ContractFunction(this.contract, elem, this.elem));
            }
        }
    }

    show() {
        for (let component of this.components) {
            component.show()
        }
    }

    clear() {
        for (let component of this.components) {
            component.clear()
        }
    }
}

export default AbiUI;
