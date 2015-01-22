JAR.module('jar.lang.Class.Abstract').$export(function() {
    'use strict';

    var ClassFactory = this,
        classesIsAbstract = {};

    ClassFactory.addStatic({
        /**
         * @return {Boolean} whether this Class is an abstract Class
         */
        isAbstract: function() {
            return classesIsAbstract[this.getHash()] || false;
        },
        /**
         * 
         * 
         * @param {String} name
         * @param {Object} proto
         * @param {Object} staticProperties
         * 
         * @return {(Class|undefined)}
         */
        createAbstractSubClass: function(name, proto, staticProperties) {
            return Abstract(name, proto, staticProperties).extendz(this);
        }
    });

    /**
     * 
     * @param {Class}
     * 
     * @return {Class} a reference to this Class for chaining
     */
    function toAbstract(Class) {
        classesIsAbstract[Class.getHash()] = true;

        return Class;
    }

    // If Class is an abstract Class return an empty Object
    // Returning undefined won't work because of the function behaviour in combination with 'new'
    ClassFactory.isInstanceableWhen(classIsNotAbstract, returnEmptyObject, 'You can\'t create a new instance of an abstract Class.');

    function classIsNotAbstract(Class) {
        return !Class.isAbstract();
    }

    function returnEmptyObject() {
        return {};
    }

    ClassFactory.isExtendableWhen(classIsNotAbstractOrSuperClassIsAbstract, 'The given SuperClass: "${superClassHash}" is not abstract and can\'t be extended by an abstract Class!');

    function classIsNotAbstractOrSuperClassIsAbstract(data) {
        return !data.Class.isAbstract() || data.SuperClass.isAbstract();
    }

    function Abstract(name, proto, staticProperties) {
        return toAbstract(ClassFactory(name, proto, staticProperties));
    }

    Abstract.abstractMethod = function(methodName) {
        return function abstractMethod() {
            this.Class.logger.error('Override ${0}()!', [methodName]);
        };
    };

    return Abstract;
});