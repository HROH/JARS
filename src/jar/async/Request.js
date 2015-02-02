JAR.module('jar.async.Request').$import([
    '.Deferred',
    'System',
    {
        '..lang': [
            'Class',
            'Object!reduce',
            'Array!index',
            'Enum',
            'Function!modargs'
        ]
    }
]).$export(function(Deferred, System, Class, Obj, Arr, Enum, Fn) {
    'use strict';

    var activeXObjects = Arr('Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP'),
        acceptedRequestMethods = Arr('GET', 'PUT', 'POST', 'DELETE'),
        supportedXhrIsDefined = false,
        requestState = new Enum(['UNSENT', 'OPENED', 'HEADERS_RECEIVED', 'LOADING', 'DONE']),
        Request, SupportedXhr, supportedActiveXObject;

    Request = Class('Request', {
        $: {
            construct: function(options) {
                var request = this;

                request._$deferred = new Deferred();

                options = options || {};

                request._$createRequest(options.url, options.method);

                System.isObject(options.headers) && request.setRequestHeaders(options.headers);
            },

            setRequestHeaders: function(headers) {
                return Obj.reduce(headers, setRequestHeader, this);
            },

            send: function(data) {
                this._$req.send(data);

                return this.getResponsePromise();
            },

            abort: function() {
                this._$req.abort();
            },

            getResponsePromise: function() {
                return this._$deferrred.getPromise();
            }
        },

        _$: {
            req: null,

            createRequest: function(url, method) {
                var request = this,
                    deferred = request._$deferred,
                    req;

                if (!(method && acceptedRequestMethods.contains(method = method.toUpperCase()))) {
                    method = 'GET';
                }

                if (!supportedXhrIsDefined) {
                    defineXmlHttpRequest();
                }

                if (SupportedXhr) {
                    req = request._$req = new SupportedXhr(supportedActiveXObject);

                    Obj.merge(req, {
                        onreadystatechange: Fn.partial(readyStateChangeHandler, deferred),

                        onprogress: Fn.partial(progressHandler, deferred)
                    });

                    req.open(method, url);
                }
                else {
                    deferred.reject(new Error('XMLHttpRequests are not supported by this environment'));
                }
            }
        }
    }, {
        get: function(url) {
            return new Request({
                url: url
            }).send();
        },

        post: function(url, data) {
            return new Request({
                url: url,

                method: 'POST'
            }).send(data);
        },
        // TODO implement cross-browser solution
        json: function(url) {
            return Request.get(url).then(JSON.parse);
        },

        $plugIn: function(pluginRequest) {
            var data = pluginRequest.data.split('|'),
                url = data[data.length - 1],
                method;

            if (data.length > 1) {
                method = data[0];
            }

            System.isFunction(Request[method]) ? Request[method](url) : (new Request({
                url: url,
                method: method
            })).send().then(pluginRequest.onSuccess, pluginRequest.onError);
        }
    });

    function defineXmlHttpRequest() {
        if (window.XMLHttpRequest) {
            SupportedXhr = window.XMLHttpRequest;
        }
        else if (activeXObjects.some(supportsActiveXObject)) {
            SupportedXhr = window.ActiveXObject;
        }

        supportedXhrIsDefined = true;

        return SupportedXhr;
    }

    function supportsActiveXObject(activeXObject) {
        var activeXObjectIsSupported = false,
            xhr;

        try {
            xhr = new window.ActiveXObject(activeXObject);
            supportedActiveXObject = activeXObject;
            activeXObjectIsSupported = true;
            xhr = null;
        }
        catch (e) {}

        return activeXObjectIsSupported;
    }

    function setRequestHeader(request, value, header) {
        request._$req.setRequestHeader(header, value);

        return request;
    }

    // TODO
    function readyStateChangeHandler(deferred) {
        /*jslint validthis: true */
        var req = this,
            readyState = req.readyState,
            status;

        if (readyState !== requestState.OPENED) {
            status = req.status;

            if (readyState == requestState.DONE) {
                if (isSuccessStatus(status)) {
                    deferred.resolve(req.response || req.responseText);
                }
                else {
                    deferred.reject(new Error(status + ': ' + req.statusText));
                }
            }
            else if (readyState === requestState.UNSENT) {
                deferred.reject(new Error('aborted request'));
            }
        }
    }

    function progressHandler(deferred, e) {
        /*jslint validthis: true */
        if (e.lengthComputable) {
            deferred.notify((e.loaded / e.total) * 100);
        }
    }

    function isSuccessStatus(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    return Request;
});