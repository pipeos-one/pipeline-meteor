class ContractCommunication {
    getHtml() {
        let self = this;
        let html = '';
        this.io_abi.map(function(val) {
            html += '<div class="row ' + self.domclass + '">';
            html += '<div class="col-sm-2" align="right"><label class="abi_label">' + val.name + '</label></div>'
            html += '<div class="col-sm-4"><input type="text" value="" class="form-control sm" id="i' + self.html_id + '" placeholder="' + val.type + '"></div>'

            // html += '<div class="col-sm-6"><div class="form-group">'
            // html += '<label>' + val.name + '</label><input type="text" value="" class="form-control sm" id="i' + self.html_id + '" placeholder="' + val.type + '">'
            // html += '</div></div>'

            html += '</div>';
        }).join(',');

        // html += '</div>';

        return html;
    }

    show() {
        this.parent_elem.append(this.getHtml());
        this.elem = $(this.html_id);
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

    get() {
        return this.elem.val()
    }
}

class ContractOutput extends ContractCommunication{
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

    set(value) {
        this.elem.val(value)
    }
}

class ContractFunction {
    constructor(contract, func_abi, parent_elem) {
        this.contract = contract
        this.func_abi = func_abi
        this.parent_elem = parent_elem
        this.id = contract.address.slice(-8) + '_' + func_abi.name

        this.init();
    }

    getHtml() {
        return '<div class="form-group row" id="' + this.id + '" style="margin-left: 15px;margin-right: 2px;"></div>';
    }

    getButtonHtml() {
        let type = ['view', 'pure'].indexOf(this.func_abi.stateMutability) > -1 ? "btn-call" : "btn-txn"
        return '<div class="row"><div class="col-sm-6"><button type="button" class="btn ' + type + ' btn-block" id="button_' + this.id + '">' + this.func_abi.name + '</button></div></div>';
    }

    init() {
        // console.log('functtion init ', this.func_abi)
        this.parent_elem.append(this.getHtml());
        this.elem = $('#' + this.id);
        this.showButton();

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
        self.elem.append(this.getButtonHtml());
        $('#button_' + this.id).click(function(event) {
            if (self.inputs) {
                inputs = self.inputs.get();
                // console.log('inputs', inputs);
                inputs = inputs.split(',');
            }
            // console.log('inputs', inputs);
            self.contract[self.func_abi.name](...inputs).then(function(value) {
                // console.log('value', value);
                if (self.outputs && value) {
                    self.outputs.set(value);
                }
            });
        });
    }

    show() {
        if (this.inputs)
            this.inputs.show();
        if (this.outputs)
            this.outputs.show();
    }

    clear() {

    }
}

class AbiUI {
    constructor(contract_instance, abi, domid) {
        this.contract = contract_instance
        this.abi = abi
        this.domid = 'abi_' + domid
        this.components = []

        $('#' + domid).append('<div class="container-fluid" id="' + this.domid + '">');
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
