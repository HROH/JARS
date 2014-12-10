JAR.register({
    MID: 'jar.async.AnimationExecutor',
    deps: ['.I$Executor', {
        'jar.lang': ['Array!check', 'Class.Singleton', 'Date', 'String::camelize']
    }]
}, function(I$Executor, Arr, Singleton, Dat, camelize) {
    'use strict';

    // TODO move implmentationtest of requestAnimationFrame into jar.feature-module
    // make AnimationExecutor.getCurrentTime() standalone polyfill
    var lastTime = 0,
        frameRate = 1000 / 60,
        requestAnimationFrame = 'requestAnimationFrame',
        cancelAnimationFrame = 'cancelAnimationFrame',
        cancelRequestAnimationFrame = 'cancelRequestAnimationFrame',
        vendors = Arr('', 'ms', 'moz', 'webkit', 'o'),
        performance = window.performance,
        timer = performance && performance.now ? performance : Dat,
        AnimationExecutor, animationExecutorProto;

    if (!vendors.some(function(vendor) {
        var rAF = requestAnimationFrame,
            cAF = cancelAnimationFrame,
            cRAF = cancelRequestAnimationFrame;

        if (vendor) {
            rAF = camelize(vendor, rAF);
            cAF = camelize(vendor, cAF);
            cRAF = camelize(vendor, cRAF);
        }

        if (window[rAF] && (window[cAF] || window[cRAF])) {
            cAF = window[cAF] ? cAF : cRAF;

            animationExecutorProto = {
                request: function(callback) {
                    return window[rAF](callback);
                },

                cancel: function(id) {
                    window[cAF](id);
                }
            };

            return true;
        }

        return false;
    })) {
        animationExecutorProto = {
            request: function(callback) {
                var currTime = this.getCurrentTime(),
                    timeToCall = Math.max(0, frameRate - (currTime - lastTime)),
                    id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);

                lastTime = currTime + timeToCall;

                return id;
            },

            cancel: function(id) {
                clearTimeout(id);
            }
        };
    }

    animationExecutorProto.getCurrentTime = function() {
        return timer.now();
    };
    
    AnimationExecutor = Singleton('AnimationExecutor', animationExecutorProto).implementz(I$Executor);

    return AnimationExecutor;
});