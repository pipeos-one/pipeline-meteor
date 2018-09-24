import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as SANCT from 'sanctuary-def';
import HMD from 'hm-def';

import Swiper from 'swiper';
import '/node_modules/swiper/dist/css/swiper.css';

import '../tags/viewTags.js';
import '../source/viewByTag.js';
import '../pipetree/pipetree.js';
import '../pipecanvas/pipecanvas.js';
import '../pipecodepreview/pipecodepreview.js';
import '../modal/modal.js';
import '../debugger/debugger.js';

import './main.html';
import './main.css';


Template.main.onCreated(function helloOnCreated() {
    let self = this;
    self.tag = new ReactiveVar();
    self.contracts = new ReactiveVar([]);
    self.functionAbi = new ReactiveVar();
    self.pipecode = new ReactiveVar();
    self.pipegram = new ReactiveVar();
    self.pipejscode = new ReactiveVar();
    self.pipeContracts = new ReactiveVar();
    self.pipeinputs = new ReactiveVar();
    self.pipedeployed = new ReactiveVar();
    self.pipedebugger = new ReactiveVar();

    self.autorun(function() {
        let contract_ids = Template.instance().contracts.get();
        let contracts = Pipeline.collections.ContractSource.find({_id: {$in: contract_ids}}).fetch().map(function(contract) {
            contract.abi = JSON.parse(contract.abi);
            contract.userdoc = JSON.parse(contract.userdoc);
            contract.devdoc = JSON.parse(contract.devdoc);
            return contract;
        });
        Pipeline.collections.JavascriptSource.find({_id: {$in: contract_ids}}).map(function(pipe_function, i) {
            pipe_function.abi = [JSON.parse(pipe_function.abi)];
            pipe_function.userdoc = {
                methods: JSON.parse(pipe_function.userdoc)
            };
            pipe_function.devdoc = {
                methods: JSON.parse(pipe_function.devdoc)
            };
            let contract = Object.assign({}, pipe_function);
            contract.name = `SolJsComposite_${pipe_function.name}`;
            contract.pipefunction = pipe_function;
            contracts.push(contract);
        });

        self.pipeContracts.set(contracts);
    });

});

Template.main.onRendered(function() {
    var mySwiper = new Swiper ('.swiper-container', {
        // Optional parameters
        direction: 'horizontal',
        loop: false,
        slidesPerView: "auto",
        noSwiping: true,
        noSwipingClass: "no-swipe",

        // Navigation arrows
        navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        }
    })

    console.log(SANCT);

    //    Integer :: Type
    const Integer = SANCT.NullaryType
      ('my-package/Integer')
      ('http://example.com/my-package#Integer')
      (x => typeof x === 'number' &&
            Math.floor (x) === x &&
            x >= Number.MIN_SAFE_INTEGER &&
            x <= Number.MAX_SAFE_INTEGER);

    window.def = HMD.create({
      checkTypes: true,
      env: SANCT.env.concat([Integer]),
    });

    // const sum = def(
    //   'sum :: Integer -> Integer -> Integer -> Integer',
    //   (a, b, c) => a + b + c
    // );

    // eval("const sum = def('sum :: Integer -> Integer -> Integer -> Integer',(a, b, c) => a + b + c);")

    $("head").append("<script>window.sum = def('sum :: Integer -> Integer -> Integer -> Integer',(a, b, c) => a + b + c);</script>");

    //sum(x, y, z)
    console.log('----', sum(5)(8)(14))

});

Template.main.helpers({
    notWeb3: function() {
        return typeof(web3) == 'undefined';
    },
    data() {
        return {
            tag: Template.instance().tag,
            contracts: Template.instance().contracts,
            functionAbi: Template.instance().functionAbi,
            pipecode: Template.instance().pipecode,
            pipegram: Template.instance().pipegram,
            pipejscode: Template.instance().pipejscode,
            pipeinputs: Template.instance().pipeinputs,
            pipedeployed: Template.instance().pipedeployed,
            pipedebugger: Template.instance().pipedebugger,
        };
    },
    pipetreedata: function() {
        return {
            contracts: Template.instance().pipeContracts,
            functionAbi: Template.instance().functionAbi,
        }
    },
    modaldata: function() {
        return {
            template: 'insert',
            title: 'Add a deployed contract details and source',
            buttonHidden: true,
            saveAction: function() {
                $('#insertContractSource').submit();
            },
            id: 'add_contract',
        }
    },
    treedata: function() {
        let template = Template.instance();
        let contracts = template.pipeContracts.get();
        if (!contracts) return;

        contracts = contracts.map(function(contract) {
            return {
                abi: contract.abi,
                devdoc: contract.devdoc,
                userdoc: contract.userdoc,
                name: contract.name,
            };
        });
        return {
            template: 'abiarray',
            buttonHidden: true,
            // hiddenSave: true,
            id: 'showabis',
            data: JSON.stringify(contracts),
            saveAction: function() {
                let new_abis = $('#abiarray').val();
                // TODO: check content;
                template.pipeContracts.set(JSON.parse(new_abis));
            },
        }
    },
    contractDeployed: function() {
        return Template.instance().pipedeployed.get();
    },
    abidata: function() {
        let contract = Template.instance().pipedeployed.get();
        return {
            id: 'deployed_contract',
            contract,
        }
    },
    showdebugger: () => {
        return !Template.instance().pipedeployed.get();
    },
    pipedebuggerdata: () => {
        return {
            pipedebugger: Template.instance().pipedebugger,
            functionAbi: Template.instance().functionAbi,
        }
    }
});

Template.main.events({
    'click .addContract': function(event) {
        $('#generalModal_add_contract').modal({backdrop: false});
    },
    'click #pipetreedata': function(event) {
        $('#generalModal_showabis').modal({backdrop: false});
    }
});
