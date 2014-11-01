JAR.register({
    MID: 'jar.lang.Class.Singleton'
}, function() {
    'use strict';

    var ClassFactory = this,
        classesSingleton = {};

    ClassFactory.addStatic({
        singleton: function() {
            return classesSingleton[this.getHash()];
        },
        /**
         * @return {boolean} whether this Class has a singleton
         */
        hasSingleton: function() {
            return !!this.singleton();
        },

        createSingletonSubClass: function(name, proto, staticProperties, args) {
            return toSingleton(ClassFactory(name, proto, staticProperties, args).extendz(this));
        }
    });

    function toSingleton(Class, args) {
        var singleton = classesSingleton[Class.getHash()] = Class.New(args);

        Class.addDestructor(function() {
            if (this === singleton) {
                classesSingleton[Class.getHash()] = null;
            }
        });

        return Class;
    }

    function Singleton(name, proto, staticProperties, args) {
        return toSingleton(ClassFactory(name, proto, staticProperties), args);
    }

    ClassFactory.isInstanceableWhen(function(Class) {
        return !Class.hasSingleton();
    }, function(Class) {
        return Class.singleton();
    }, 'You can\'t create a new instance of a Singleton.');

    return Singleton;
});