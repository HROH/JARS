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
            root = subject;
        },
        /**
         * @param {JARS~internals.Subjects.Subject} [subject]
         */
        setCurrent: function(subject) {
            current = subject || root;
        },
        /**
         * @return {JARS~internals.Subjects.Subject}
         */
        getCurrent: function() {
            return current;
        }
    };

    return Tracker;
});
