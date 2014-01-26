JAR.register({
    MID: 'jar.lang.String',
    deps: ['System', '.Array']
}, function(System, Arr) {
    'use strict';

    var lang = this,
        rCapitalLetter = /([A-Z])/g,
        StringCopy;

    /**
     * Extend jar.lang.String with some useful methods
     * If a native implementation exists it will be used instead
     */
    StringCopy = lang.extendNativeType('String', {
        camelize: function() {
            var toCapitalize = this.split('-'),
                camelized = '';

            Arr.merge(toCapitalize, arguments);

            camelized = Arr.reduce(toCapitalize, function(startString, nextString) {
                return startString + (nextString ? StringCopy.capitalize(nextString) : '');
            });

            return StringCopy.from(camelized);
        },

        capitalize: function() {
            return StringCopy.from(this.charAt(0).toUpperCase() + this.substr(1));
        },

        dashify: function() {
            return StringCopy.from(this.replace(rCapitalLetter, dashifier));
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

        if (System.isString(string)) {
            while (!(System.isA(string, StringCopy))) {
                string = new StringCopy(string);
            }
        }

        return string;
    };

    function dashifier(match) {
        return '-' + match.toLowerCase();
    }

    return StringCopy;
});