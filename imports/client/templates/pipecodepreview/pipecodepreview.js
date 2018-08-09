import './pipecodepreview.html';

Template.pipecodepreview.onCreated(function() {
    this.pipecode = this.data.pipecode;
});

Template.pipecodepreview.onRendered(function() {
    let self = this;

    Tracker.autorun(function() {
        let code = self.pipecode.get();
        $('#pipecodepreview').val(code);
    });
});
