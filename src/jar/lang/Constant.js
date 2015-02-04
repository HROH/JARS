JAR.module('jar.lang.Constant').$import({
    '.Function': [
        '::identity',
        '!modargs'
    ]
}).$export(function(identity, Fn) {
    'use strict';

    var partial = Fn.partial,
        Constant;

    Constant = partial(partial, identity);

    Constant.TRUE = Constant(true);
    Constant.FALSE = Constant(false);

    return Constant;
});