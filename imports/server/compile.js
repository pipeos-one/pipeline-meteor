import solc from 'solc';


Meteor.methods({
    'compile'(source) {
        return solc.compile(source, 0)
    }
});
