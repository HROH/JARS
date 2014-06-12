/**
 * @module "jar.lang"
 * 
 * @borrows module:"jar.lang"~getSandBoxValue as sandbox
 */
JAR.register({
    MID: 'jar.lang',
    deps: {
        System: ['.', '!']
    },
    bundle: ['Array.*', 'Date', 'Class', 'Function.*', 'I$Comparable', 'I$Iterable', 'Interface', 'M$Cloneable', 'M$Destructable', 'MixIn', 'Object.*', 'String']
}, function(System, config) {
    'use strict';

    var jar = this,
        sandboxes = {},
        container = document.documentElement,
        __SANDBOX__ = '__SANDBOX__',
        hasOwn = {}.hasOwnProperty,
        slice = [].slice,
        nativeTypes = {},
        nativeTypeSandbox, lang;

    /**
     * @alias module:"jar.lang"
     */
    lang = {
        /**
         * @access public
         * 
         * @memberof module:"jar.lang"
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
                if (hasOwn.call(prototypeMethods, methodName)) {
                    if (!hasOwn.call(typePrototype, methodName)) {
                        typePrototype[methodName] = prototypeMethods[methodName];
                    }

                    hasOwn.call(Type, methodName) || (Type[methodName] = createDelegate(Type, methodName));
                }
            }

            for (methodName in staticMethods) {
                if (hasOwn.call(staticMethods, methodName) && !hasOwn.call(Type, methodName)) {
                    Type[methodName] = staticMethods[methodName];
                }
            }

            return Type;
        },

        callNativeTypeMethod: callNativeTypeMethod,

        throwErrorIfNotSet: function(typeName, object, methodName) {
            if (!System.isSet(object)) {
                throwTypeError(typeName + '.prototype.' + methodName + ' called on null or undefined');
            }
        },

        throwErrorIfNoFunction: function(callback) {
            if (!System.isFunction(callback)) {
                throwTypeError(callback + ' is not a function');
            }
        },

        throwErrorIfNoValueSet: function(typeName, isValueSet) {
            if (!isValueSet) {
                throwTypeError('Reduce of empty ' + typeName + ' with no initial value');
            }
        },
        /**
         * @access public
         * 
         * @memberof module:"jar.lang"
         * 
         * @param {string} formatString
         * 
         * @return {string}
         */
        generateHash: function(formatString) {
            return formatString.replace(/x/g, randomHex);
        },

        /**
         * @access public
         * 
         * @memberOf module:"jar.lang"
         * 
         * @param {string} domain
         * 
         * @return {Sandbox}
         */
        sandbox: function(domain) {
            return sandboxes[domain] || (sandboxes[domain] = new Sandbox(domain));
        }
    };

    function throwTypeError(message) {
        throw TypeError(message);
    }

    function callNativeTypeMethod(Type, methodName, targetObject, args) {
        var callingObject;

        if (targetObject[methodName] === Type.prototype[methodName]) {
            callingObject = targetObject;
        }
        else {
            callingObject = Type.prototype;
        }

        return callingObject[methodName].apply(targetObject, args);
    }

    /**
     * @access private
     * 
     * @memberOf module:"jar.lang"
     * @inner
     * 
     * @param {Object} delegateType
     * @param {string} methodName
     * 
     * @return {function(*):*}
     */
    function createDelegate(delegateType, methodName) {
        /**
         *
         * @param {*} targetObject
         * 
         * @return {*}
         */
        function delegater(targetObject) {
            return callNativeTypeMethod(delegateType, methodName, targetObject, slice.call(arguments, 1));
        }

        return delegater;
    }

    /**
     * @access private
     * 
     * @memberOf module:"jar.lang"
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
     * Hack to steal native objects like Object, Array, String, etc. from an iframe
     * We save the native object in an iframe as a property of the window object
     * and then access this property for example to extend the Object.prototype
     * The Object.prototype of the current document won't be affected by this
     * 
     * Note: the iframe has to be open all the time to make sure
     * that the current document has access to the native copies in some browsers
     * 
     * You can read more about this {@link http://dean.edwards.name/weblog/2006/11/hooray/|here}
     * @todo check browser support (should work in all legacy browsers)
     * 
     * @access private
     * 
     * @class module:"jar.lang"~Sandbox
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
     * @memberof module:"jar.lang"~Sandbox#
     * 
     * @param {string} value
     * 
     * @return {*}
     */
    Sandbox.prototype.add = function(value) {
        var sandbox = this,
            sandboxVars = sandbox[__SANDBOX__],
            sandboxedVar, accessor;

        if (System.isString(value)) {
            accessor = encodeURI(value);

            if (!(accessor in sandboxVars)) {
                createSandboxScript(sandbox.doc, __SANDBOX__ + '["' + accessor + '"]=' + value);
            }

            sandboxedVar = sandboxVars[accessor];
        }

        return sandboxedVar;
    };

    Sandbox.prototype.remove = function(value) {
        var sandbox = this,
            sandboxVars = sandbox[__SANDBOX__],
            accessor;

        if (System.isString(value)) {
            accessor = encodeURI(value);

            if (accessor in sandboxVars) {
                delete sandboxVars[accessor];
            }
        }
    };

    nativeTypeSandbox = lang.sandbox('__SYSTEM__');

    function getNativeType(typeString) {
        var Type = nativeTypes[typeString] || (config('allowProtoOverride') ? window[typeString] : nativeTypeSandbox.add(typeString));

        if (!nativeTypes[typeString]) {

            makePluggable(typeString, Type);

            nativeTypes[typeString] = Type;
        }

        return Type;
    }

    function makePluggable(typeString, Type) {
        var moduleName = jar.getCurrentModuleName(),
            subModuleName = moduleName + '.' + typeString + '-';

        Type.plugIn = function(pluginRequest) {
            var extensions = pluginRequest.data.split('|'),
                extLen = extensions.length,
                idx = 0;


            if (extensions[0] === 'all') {
                extensions = [moduleName + '.*'];
            }
            else {
                while (idx < extLen && extensions[idx]) {
                    extensions[idx] = subModuleName + extensions[idx++];
                }
            }

            pluginRequest.$importAndLink(extensions, function() {
                pluginRequest.onSuccess(Type);
            }, pluginRequest.onError);
        };
    }

    /**
     * @access private
     * 
     * @memberOf module:"jar.lang"
     * @inner
     * 
     * @return {string}
     */
    function randomHex() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return lang;
});