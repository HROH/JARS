JAR.register({
    MID: 'jar.lang',
    deps: {
        System: ['::isSet', '::isFunction', '::isString', '!']
    },
    bundle: ['Array.*', 'assert', 'Date', 'Class.*', 'Function.*', 'I$Comparable', 'I$Iterable', 'Interface', 'M$Cloneable', 'M$Destructable', 'MixIn', 'Object.*', 'operations.*', 'String']
}, function(isSet, isFunction, isString, config) {
    'use strict';

    var jar = this,
        sandboxes = {},
        container = document.documentElement,
        __SANDBOX__ = '__SANDBOX__',
        hasOwn = {}.hasOwnProperty,
        nativeTypes = {},
        nativeTypeSandbox, lang;

    function hasOwnProp(object, property) {
        return hasOwn.call(object, property);
    }

    /**
     * @namespace jar.lang
     */
    lang = {
        /**
         * @access public
         * 
         * @memberof jar.lang
         * 
         * @param {string} typeString
         * @param {Object} prototypeMethods
         * @param {Object} staticMethods
         *
         * @return {Object}
         */
        extendNativeType: function(typeString, prototypeMethods, staticMethods) {
            var Type = getNativeType(typeString),
                typePrototype = Type.prototype,
                methodName;

            for (methodName in prototypeMethods) {
                if (hasOwnProp(prototypeMethods, methodName)) {
                    if (!hasOwnProp(typePrototype, methodName)) {
                        typePrototype[methodName] = prototypeMethods[methodName];
                    }

                    hasOwnProp(Type, methodName) || (Type[methodName] = createDelegate(typePrototype[methodName]));
                }
            }

            for (methodName in staticMethods) {
                if (hasOwnProp(staticMethods, methodName) && !hasOwnProp(Type, methodName)) {
                    Type[methodName] = staticMethods[methodName];
                }
            }

            return Type;
        },
        /**
         * @access public
         * 
         * @memberof jar.lang
         * 
         * @param {String} formatString
         * 
         * @return {String}
         */
        generateHash: function(formatString) {
            return formatString.replace(/x/g, randomHex);
        },

        /**
         * @access public
         * 
         * @memberOf jar.lang
         * 
         * @param {String} domain
         * 
         * @return {jar.lang~Sandbox}
         */
        sandbox: function(domain) {
            return sandboxes[domain] || (sandboxes[domain] = new Sandbox(domain));
        }
    };

    /**
     * @access private
     * 
     * @memberOf jar.lang
     * @inner
     * 
     * @param {Function} methodName
     * 
     * @return {function(*):*}
     */
    function createDelegate(method) {
        /**
         *
         * @param {*} targetObject
         * 
         * @return {*}
         */
        function delegater(targetObject) {
            var slicedArgs = [],
                argLen = arguments.length;

            while (--argLen) {
                slicedArgs[argLen - 1] = arguments[argLen];
            }

            return method.apply(targetObject, slicedArgs);
        }

        return delegater;
    }

    /**
     * @access private
     * 
     * @memberOf jar.lang
     * @inner
     * 
     * @param {HTMLDocument} sandboxDoc
     * @param {string} scriptText
     */
    function createSandboxScript(sandboxDoc, scriptText) {
        var sandboxScript = sandboxDoc.createElement('script');

        sandboxScript.type = 'text/javascript';
        sandboxScript.text = scriptText;

        sandboxDoc.body.appendChild(sandboxScript);
    }

    /**
     * <p>Hack to steal native objects like Object, Array, String, etc. from an iframe
     * We save the native object in an iframe as a property of the window object
     * and then access this property for example to extend the <code>Object.prototype</code>
     * The <code>Object.prototype</code> of the current document won't be affected by this.</p>
     * 
     * <p>Note: the iframe has to be open all the time to make sure
     * that the current document has access to the native copies in some browsers.</p>
     * 
     * <p>You can read more about this {@link http://dean.edwards.name/weblog/2006/11/hooray/|here}</p>
     * 
     * @todo check browser support (should work in all legacy browsers)
     * 
     * @access private
     * 
     * @memberof jar.lang
     * @inner
     * 
     * @class Sandbox
     * 
     * @param {string} domain
     */
    function Sandbox(domain) {
        var sandbox = this,
            iframe = document.createElement('iframe'),
            sandboxWindow, sandboxDoc;

        iframe.style.display = 'none';
        iframe.id = domain;
        container.appendChild(iframe);
        sandboxWindow = iframe.contentWindow;
        sandboxDoc = sandboxWindow.document;
        //fire the onload event of the iframe
        //this is necessary so that the iframe doesn't block window.onload of the main page
        //found on http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
        sandboxDoc.open();
        //iframe onload happens after document.close()
        sandboxDoc.close();

        createSandboxScript(sandboxDoc, 'window.' + __SANDBOX__ + '={}');

        sandbox[__SANDBOX__] = sandboxWindow[__SANDBOX__];
        sandbox.doc = sandboxDoc;
    }

    /**
     * @access public
     * 
     * @method add
     * @memberof jar.lang~Sandbox#
     * 
     * @param {string} value
     * 
     * @return {*}
     */
    Sandbox.prototype.add = function(value) {
        var sandbox = this,
            sandboxVars = sandbox[__SANDBOX__],
            sandboxedVar, accessor;

        if (isString(value)) {
            accessor = encodeURI(value);

            if (!hasOwnProp(sandboxVars, accessor)) {
                createSandboxScript(sandbox.doc, __SANDBOX__ + '["' + accessor + '"]=' + value);
            }

            sandboxedVar = sandboxVars[accessor];
        }

        return sandboxedVar;
    };

    /**
     * @access public
     * 
     * @method remove
     * @memberof jar.lang~Sandbox#
     * 
     * @param {string} value
     */
    Sandbox.prototype.remove = function(value) {
        var sandbox = this,
            sandboxVars = sandbox[__SANDBOX__],
            accessor;

        if (isString(value)) {
            accessor = encodeURI(value);

            if (hasOwnProp(sandboxVars, accessor)) {
                delete sandboxVars[accessor];
            }
        }
    };

    nativeTypeSandbox = lang.sandbox('__SYSTEM__');

    /**
     * @access private
     * 
     * @memberof jar.lang
     * @inner
     * 
     * @param {String} typeString
     * 
     * @return {Object}
     */
    function getNativeType(typeString) {
        var Type = nativeTypes[typeString] || (config('allowProtoOverride') ? window[typeString] : nativeTypeSandbox.add(typeString));

        if (!nativeTypes[typeString]) {

            makePluggable(typeString, Type);

            nativeTypes[typeString] = Type;
        }

        return Type;
    }

    /**
     * @access private
     * 
     * @memberof jar.lang
     * @inner
     * 
     * @param {String} typeString
     * @param {Object} Type
     */
    function makePluggable(typeString, Type) {
        var moduleName = jar.getCurrentModuleName(),
            subModuleName = moduleName + '.' + typeString + '-';

        Type.$plugIn = function(pluginRequest) {
            var extensions = pluginRequest.data.split(','),
                extLen = extensions.length,
                idx = 0;


            if (extensions[0] === 'all') {
                extensions = [moduleName + '.*'];
            }
            else {
                while (idx < extLen) {
                    extensions[idx] = subModuleName + extensions[idx++];
                }
            }

            pluginRequest.$importAndLink(extensions, function extensionsLoaded() {
                pluginRequest.success(Type);
            }, function extensionsAborted(extensionName) {
                pluginRequest.fail('Could not import the extension "' + extensionName + '" requested by "' + pluginRequest.listener + '"');
            });
        };
    }

    /**
     * @access private
     * 
     * @memberOf jar.lang
     * @inner
     * 
     * @return {String}
     */
    function randomHex() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return lang;
});