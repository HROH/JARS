JAR.module('jar.lang.String').$import([
    {
        System: [
            '::isA',
            '::isString'
        ]
    },
    '.Array!manipulate,reduce'
]).$export(function(isA, isString, Arr) {
    'use strict';

    var lang = this,
        rCapitalLetter = /([A-Z])/g,
        Str = lang.sandboxNativeType('String');

    /**
     * Extend jar.lang.String with some useful methods
     * If a native implementation exists it will be used instead
     */
    Str.enhance({
        camelize: function() {
            var toCapitalize = this.split('-'),
                camelized = '';

            Arr.merge(toCapitalize, arguments);

            camelized = Arr.reduce(toCapitalize, buildCamelized);

            return fromString(camelized);
        },

        capitalize: function() {
            return fromString(this.charAt(0).toUpperCase() + this.substr(1));
        },

        dashify: function() {
            return fromString(this.replace(rCapitalLetter, dashifier));
        },

        startsWith: function(start) {
            var rstart = new RegExp('^' + start);
            return rstart.test(this);
        },

        endsWith: function(end) {
            var rend = new RegExp(end + '$');
            return rend.test(this);
        }
    }, {
        from: fromString,

        fromNative: fromString
    });

    // TODO
    // bug in chrome?: new StringCopy() sometimes can't access added methods
    // solved temporary by using StringCopy.fromNative() with while-loop
    // search for course/better solution
    function fromString(string) {
        string = string || '';

        if (isString(string)) {
            while (!(isA(string, Str))) {
                string = new Str(string);
            }
        }

        return string;
    }

    function buildCamelized(startString, nextString) {
        return startString + (nextString ? Str.capitalize(nextString) : '');
    }

    function dashifier(match) {
        return '-' + match.toLowerCase();
    }

    return Str;
});