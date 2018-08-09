import "/imports/lib/collections/Tag.js";
import "./insert.html";


Template.insertTag.helpers({
    Tag: function() {
        return Pipeline.collections.Tag
    }
});
