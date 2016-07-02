JAR.module('jar.async.AnimationExecutor').$import([
    'System::env',
    '.I$Executor',
    {
        'jar.lang': [
            'Array!check',
            'Class.Singleton',
            'Date',
            'String::camelize'
        ]
    }
]).$export(function(env, I$Executor, Arr, Singleton, Dat, camelize) {
    'use strict';

    // TODO move implmentationtest of requestAnimationFrame into jar.feature-module
    // make AnimationExecutor.getCurrentTime() standalone polyfill
    var global = env.global,
        lastTime = 0,
        frameRate = 1000 / 60,
        requestAnimationFrame = 'requestAnimationFrame',
        cancelAnimationFrame = 'cancelAnimationFrame',
        cancelRequestAnimationFrame = 'cancelRequestAnimationFrame',
        vendors = Arr('', 'ms', 'moz', 'webkit', 'o'),
        performance = global.performance,
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

        if (global[rAF] && (global[cAF] || global[cRAF])) {
            cAF = global[cAF] ? cAF : cRAF;

            animationExecutorProto = {
                request: function(callback) {
                    return global[rAF](callback);
                },

                cancel: function(id) {
                    global[cAF](id);
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
                    id = global.setTimeout(function() {
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