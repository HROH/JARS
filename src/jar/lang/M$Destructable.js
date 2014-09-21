JAR.register({
    MID: 'jar.lang.M$Destructable',
    deps: '.MixIn'
}, function(MixIn) {
	'use strict';
	
    var M$Destructable = new MixIn('Destructable', {
        destruct: function() {
            this.Class.destruct(this);
        }
    });

    return M$Destructable;
});