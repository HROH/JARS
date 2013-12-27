JAR.register({
    MID: 'jar.lang.M$Cloneable',
    deps: '.MixIn'
}, function(MixIn) {
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