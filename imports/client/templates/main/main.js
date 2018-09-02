import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import Swiper from 'swiper';
import '/node_modules/swiper/dist/css/swiper.css';

import '../tags/viewTags.js';
import '../source/viewByTag.js';
import '../pipetree/pipetree.js';
import '../pipecanvas/pipecanvas.js';
import '../pipecodepreview/pipecodepreview.js';
import '../modal/modal.js';

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

    self.autorun(function() {
        let contract_ids = Template.instance().contracts.get();
        let contracts = Pipeline.collections.ContractSource.find({_id: {$in: contract_ids}}).fetch().map(function(contract) {
            contract.abi = JSON.parse(contract.abi);
            contract.userdoc = JSON.parse(contract.userdoc);
            contract.devdoc = JSON.parse(contract.devdoc);
            return contract;
        });
        console.log('contracts', contracts)
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

});

Template.main.helpers({
    data() {
        return {
            tag: Template.instance().tag,
            contracts: Template.instance().contracts,
            functionAbi: Template.instance().functionAbi,
            pipecode: Template.instance().pipecode,
            pipegram: Template.instance().pipegram,
            pipejscode: Template.instance().pipejscode,
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
            id: 'add_contract'
        }
    },
    treedata: function() {
        let template = Template.instance();
        let contracts = template.pipeContracts.get();
        if (!contracts) return;
        console.log('contracts', contracts)
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
    abidata: function() {
        let contract = Template.instance().pipedeployed.get();
        return {
            id: 'deployed_contract',
            contract,
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

Template.abiarray.onRendered(function() {
    console.log(this.data)
});
