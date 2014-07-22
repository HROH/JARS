JAR.register({
    MID: 'jar.lang.Class.Final'
}, function() {
    'use strict';

    var ClassFactory = this,
        classesIsFinal = {};

    ClassFactory.addStatic({
        /**
         * @return {Boolean} whether this Class is a final Class
         */
        isFinal: function() {
            return classesIsFinal[this.getHash()] || false;
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
        createFinalSubClass: function(name, proto, staticProperties) {
            return Final(name, proto, staticProperties).extendz(this);
        }
    });

    /**
     * 
     * @param {Class}
     * 
     * @return {Class} a reference to this Class for chaining
     */
    function toFinal(Class) {
        classesIsFinal[Class.getHash()] = true;

        return Class;
    }

    ClassFactory.isExtendableWhen(superClassIsNotFinal, 'The given SuperClass: "${superClassHash}" is final and can\'t be extended!');

    function superClassIsNotFinal(data) {
        return !data.SuperClass.isFinal();
    }

    function Final(name, proto, staticProperties) {
        return toFinal(ClassFactory(name, proto, staticProperties));
    }

    return Final;
});