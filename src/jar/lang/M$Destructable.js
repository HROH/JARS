JAR.module('jar.lang.M$Destructable').$import('.MixIn').$export(function(MixIn) {
    'use strict';

    var M$Destructable = new MixIn('Destructable', {
        destruct: function() {
            this.Class.destruct(this);
        }
    });

    return M$Destructable;
});