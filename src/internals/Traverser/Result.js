JARS.internal('Traverser/Result', function() {
    'use strict';

    /**
     * @class
     *
     * @memberof JARS~internals.Traverser
     *
     * @param {*} value
     * @param {boolean} done
     */
    function Result(value, done) {
        this.value = value;
        this.done = done || false;
    }

    return Result;
});
