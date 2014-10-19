JAR.register({
    MID: 'jar.lang.Constant',
    deps: {
        '.Function': ['::identity', '!modargs']
    }
}, function(identity, Fn) {
    'use strict';

    var partial = Fn.partial,
        Constant;

    Constant = partial(partial, identity);
    
    Constant.TRUE = Constant(true);
    Constant.FALSE = Constant(false);

    return Constant;
});