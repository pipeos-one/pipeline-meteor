import './eventlog.html';


Template.eventlog.onCreated(function() {
    let self = this;
    self.contract = self.data.contractInstance;
    self.name = self.data.contractName;
    self.logs = new ReactiveVar([]);

    self.filter = self.contract.allEvents(function(error, log) {
        if (error) console.error();
        console.log('log', log);
        let logs = self.logs.get();
        logs.unshift(log);
        self.logs.set(logs);
    });
});


Template.eventlog.onDestroyed(function() {
    self.filter.stopWatching();
})

Template.eventlog.helpers({
    name: function() {
        return Template.instance().name;
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
