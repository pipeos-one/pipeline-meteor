import './pipecodepreview.html';
import './pipecodepreview.css';

Template.pipecodepreview.onCreated(function() {
    this.pipecode = this.data.pipecode;
    this.pipegram = this.data.pipegram;
    this.pipejscode = this.data.pipejscode;
});

Template.pipecodepreview.onRendered(function() {
    let self = this;

    Tracker.autorun(function() {
        let code = self.pipecode.get();
        $('#pipesoliditycode').val(code);
    });

    Tracker.autorun(function() {
        let code = self.pipegram.get();
        $('#pipegramcode').val(code);
    });

    Tracker.autorun(function() {
        let code = self.pipejscode.get();
        $('#pipejscode').val(code);
    });

    $('#pipenav').tab();
});
