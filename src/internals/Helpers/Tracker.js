JARS.internal('Helpers/Tracker', function() {
    'use strict';

    var current, root, Tracker;
    
    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    Tracker = {
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         */
        setRoot: function(subject) {
            root = subject.name;
        },
        /**
         * @param {string} [subject]
         */
        setCurrent: function(subjectName) {
            current = subjectName || root;
        },
        /**
         * @return {string}
         */
        getCurrent: function() {
            return current;
        }
    };

    return Tracker;
});
