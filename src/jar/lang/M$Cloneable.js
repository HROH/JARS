JAR.module('jar.lang.M$Cloneable').$import('.MixIn').$export(function(MixIn) {
    'use strict';

    var M$Cloneable = new MixIn('Cloneable', {
        clone: function() {
            var clone = new this.Class();

            if (clone === this) {
                clone = undefined;
            }

            return clone;
        }
    });

    return M$Cloneable;
});