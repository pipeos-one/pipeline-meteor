class ContractCommunication {
    getHtml() {
        let self = this;
        let html = '';
        this.io_abi.map(function(val, i) {
            html += `<div class="row ${self.domclass}">`;
            html += `<div class="col-sm-4" align="right"><label class="abi_label">${val.name}</label></div>`
            html += `<div class="col-sm-8"><input type="text" value="" class="form-control sm" id="${self.html_id}_${i}" placeholder="${val.type}"></div>`
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
            return $(`#${self.html_id}_${i}`).val();
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
            $(`#${self.html_id}_${index}`).val(value);
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
        this.id += '_' + func_abi.name;

        this.init();
    }

    getHtml() {
        return '<div class="form-group row" id="' + this.id + '" style="margin-left: 15px;margin-right: 2px;"></div>';
    }

    getButtonHtml() {
        let type = ['view', 'pure'].indexOf(this.func_abi.stateMutability) > -1 ? "btn-call" : "btn-txn"
        return '<div class="row"><div class="col-sm-12"><button type="button" class="btn ' + type + ' btn-block" id="button_' + this.id + '">' + this.func_abi.name + '</button></div></div>';
    }

    init() {
        // console.log('functtion init ', this.func_abi)
        this.parent_elem.append(this.getHtml());
        this.elem = $('#' + this.id);
        this.showButton();
        // console.log(this.func_abi);
        if (this.func_abi.payable) {
            this.value_input = new ContractInput(this.id + '_value_input' , this.elem, [{name: 'WEI', type: '0'}]);
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
    constructor(contract_instance, domid) {
        this.contract = contract_instance
        this.abi = contract_instance.abi
        this.domid = 'abi_' + domid
        this.components = []
        // container-fluid
        $('#' + domid).append('<div class="" id="' + this.domid + '">');
        this.elem = $('#' + this.domid)

        this.init();
    }

    init() {
        for (let elem of this.abi) {
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
