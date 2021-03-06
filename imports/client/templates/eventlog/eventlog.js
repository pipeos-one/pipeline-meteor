import './eventlog.html';


Template.eventlog.onCreated(function() {
    let self = this;
    self.contract = self.data.contractInstance;
    self.logs = new ReactiveVar([]);
    self.othercontracts = new ReactiveVar([]);
    self.filters = [];
    self.filter = self.contract.allEvents(function(error, log) {
        if (error) {
            console.error();
        }
        else {
            console.log('log', log);
            let logs = self.logs.get();
            let length = logs.length;
            console.log('length', length)
            if (length > 0) console.log(logs[length - 1], log.transactionHash != logs[length - 1].transactionHash)
            if (length == 0 || log.transactionHash != logs[length - 1].transactionHash) {
                log.sourceContractName = self.data.contractName;
                logs.unshift(log);
                self.logs.set(logs);
            }
        }
    });

    self.logEvents = () => {
        self.othercontracts.get().map(contract => {
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
        if (self.filter) {
            self.filter.stopWatching();
        }
    }

    Tracker.autorun(() => {
        self.othercontracts.get();
        self.logEvents()
    });

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
    console.log('getFromNames', included_contracts, String(web3.version.network))
    Meteor.call('contracts.getFromNames', included_contracts, String(web3.version.network), function(error, result) {
        if (error) console.log(error);
        self.stopEvents();
        if (result) {
            self.othercontracts.set(result);
        }
    });
});


Template.eventlog.onDestroyed(function() {
    this.stopEvents();
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
