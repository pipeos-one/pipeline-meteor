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
  this.tag = new ReactiveVar();
  this.contracts = new ReactiveVar([]);
  this.functionAbi = new ReactiveVar();
  this.pipecode = new ReactiveVar();
  this.pipegram = new ReactiveVar();
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
        };
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
    }
});

Template.main.events({
    'click .addContract': function(event) {
        $('#generalModal_add_contract').modal({backdrop: false});
    }
})
