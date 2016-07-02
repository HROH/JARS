JAR.module('jar.lang.M$Cloneable').$import('.Mixin').$export(function(Mixin) {
    'use strict';

    var M$Cloneable = new Mixin('Cloneable', {
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