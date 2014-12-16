JAR.register({
    MID: 'jar.lang.Date'
}, function() {
    'use strict';

    var DateCopy = this.sandboxNativeType('Date').enhance({
        toISOString: function() {
            return getISODateString(this) + 'T' + getISOTimeString(this) + 'Z';
        }
    }, {
        now: function() {
            return new DateCopy().getTime();
        }
    });

    function getISODateString(date) {
        return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate());
    }

    function getISOTimeString(date) {
		return pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes()) + ':' + pad(date.getUTCSeconds()) + '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
    }

    function pad(number) {
        if (number < 10) {
            number = '0' + number;
        }

        return number;
    }

    return DateCopy;
});