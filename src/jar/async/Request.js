JAR.register({
    MID: 'jar.async.Request',
    deps: ['.Promise', 'System', {
        '..lang': ['Object!reduce', 'Array!index']
    }]
}, function(Promise, System, Obj, Arr) {
    'use strict';

    var activeXObjects = Arr('Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP'),
        acceptedRequestMethods = Arr('GET', 'POST'),
        supportedXhrIsDefined = false,
        READYSTATE_UNSENT = 0,
        READYSTATE_OPENED = 1,
        //READYSTATE_HEADERS_RECEIVED = 2,
        //READYSTATE_LOADING = 3,
        READYSTATE_DONE = 4,
        Request, SupportedXhr, supportedActiveXObject;

    Request = Promise.createSubClass('Request', {
        $: {
            construct: function(options) {
                var request = this;

                request.$super(null, true);

                options = options || {};

                request._$createRequest(options.url, options.method);

                System.isObject(options.headers) && request.setRequestHeaders(options.headers);
            },

            setRequestHeaders: function(headers) {
                return Obj.reduce(headers, setRequestHeader, this);
            },

            send: function(data) {
                this._$req.send(data);

                return this;
            }
        },

        _$: {
            req: null,

            createRequest: function(url, method) {
                var request = this,
                    handles = request._$handles,
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
                        handles: handles,
                        onreadystatechange: readyStateChangeHandler,
                        onprogress: progressHandler
                    });

                    req.open(method, url);
                }
                else {
                    handles.reject(new Error('XMLHttpRequests are not supported by this environment'));
                }
            }
        }
    }, {
        cast: function(value) {
            return Promise.cast(value);
        },

        race: function(requests) {
            return Promise.race(requests);
        },

        all: function(requests) {
            return Promise.all(requests);
        },

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

        plugIn: function(pluginRequest) {
            var data = pluginRequest.data.split('|'),
                url = data[data.length - 1],
                method, request;

            if (data.length > 1) {
                method = data[0];
            }

            request = System.isFunction(Request[method]) ? Request[method](url) : (new Request({
                url: url,
                method: method
            })).send();

            request.then(pluginRequest.onSuccess, pluginRequest.onError);
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
    function readyStateChangeHandler() {
        /*jslint validthis: true */
        var req = this,
            readyState = req.readyState,
            handles = req.handles,
            status;

        if (readyState !== READYSTATE_OPENED) {
            status = req.status;

            if (readyState == READYSTATE_DONE) {
                if (isSuccessStatus(status)) {
                    handles.resolve(req.response || req.responseText);
                }
                else {
                    handles.reject(new Error(status + ': ' + req.statusText));
                }
            }
            else if (readyState === READYSTATE_UNSENT) {
                handles.reject(new Error('aborted request'));
            }
        }
    }

    function progressHandler(e) {
        /*jslint validthis: true */
        if (e.lengthComputable) {
            this.handles.notify((e.loaded / e.total) * 100);
        }
    }

    function isSuccessStatus(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    return Request;
});