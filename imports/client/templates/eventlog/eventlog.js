import './eventlog.html';


Template.eventlog.onCreated(function() {
    let self = this;
    self.contract = self.data.contractInstance;
    self.logs = new ReactiveVar([]);
    self.othercontracts = new ReactiveVar([]);
    self.filters = [];

    self.filter = self.contract.allEvents(function(error, log) {
        if (error) console.error();
        console.log('log', log);
        let logs = self.logs.get();
        log.sourceContractName = self.data.contractName;
        logs.unshift(log);
        self.logs.set(logs);
    });

    self.logEvents = () => {
        self.othercontracts.get().map(contract => {
            console.log('contract', contract)
            let instance = web3.eth.contract(JSON.parse(contract.abi)).at(contract.eth_address);

            self.filters.push(
                instance.allEvents(function(error, log) {
                    if (error) console.error();
                    console.log('log', log);
                    let logs = self.logs.get();
                    log.sourceContractName = contract.name;
                    logs.unshift(log);
                    self.logs.set(logs);
                })
            )
        })
    }
    self.stopEvents = () => {
        self.filters.map(filter => filter.stopWatching());
    }

    Tracker.autorun(() => {
        self.othercontracts.get();
        self.logEvents()
    });

    console.log(self.contract)
    let included_contracts = [];
    self.contract.abi.forEach((item) => {
        if (
            item.constant == true &&
            item.stateMutability == 'view' &&
            item.name.includes('_address')
        ) {
            included_contracts.push(item.name.substring(0, item.name.indexOf('_address')));
        }
    });

    console.log(included_contracts);
    Meteor.call('contracts.getFromNames', included_contracts, function(error, result) {
        if (error) console.log(error);
        self.stopEvents();
        self.othercontracts.set(result);
    });
});


Template.eventlog.onDestroyed(function() {
    self.filter.stopWatching();
})

Template.eventlog.helpers({
    name: function() {
        return Template.instance().data.contractName;
    },
    argsarray: function(args) {
        return Array.from(Object.keys(args), x => [x, args[x]]);
    },
    showargs: function(args) {
        return `${args[0]}: ${args[1]}`;
    },
    events: function() {
        return Template.instance().logs.get();
    }
});
