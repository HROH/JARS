JAR.register({
    MID: 'jar.lang',
    deps: 'System',
    bundle: ['Array', 'Class', 'Function', 'I$Comparable', 'I$Iterable', 'Interface', 'M$Cloneable', 'MixIn', 'Object', 'String']
}, function(System) {
    var sandboxes = {},
        container = document.documentElement,
        __SANDBOX__ = '__SANDBOX__',
        lang;

    lang = {
        /**
         * Hack to steal native objects like Object, Array, String, etc. from an iframe
         * We save the native object in an iframe as a property of the window object
         * and then access this property for example to extend the Object.prototype
         * The Object.prototype of the current document won't be affected by this
         * 
         * Note: the iframe has to be open all the time to make sure
         * that the current document has access to the native copies in some browsers
         * 
         * You can read more about this on http://dean.edwards.name/weblog/2006/11/hooray/
         * TODO check browser support (should work in all legacy browsers)
         * 
         * @param {string} value
         * @param {string} domain
         *
         * @return {*}
         */
        sandbox: function(value, domain) {
            return getSandbox(domain).get(value);
        },

        delegate: function(from, to, methodName, checkFn) {
            if (System.isFunction(from[methodName])) {
                to[methodName] = function callOn(scope) {
                    var args = Array.apply(Array, arguments).slice(1),
                        scopeAccepted = scope && !System.isFunction(checkFn) || checkFn(scope);

                    return scopeAccepted ? from[methodName].apply(scope, args) : undefined;
                };
            }
        },

        generateHash: generateHash
    };

    function createSandboxScript(sandboxDoc, scriptText) {
        var sandboxScript = sandboxDoc.createElement('script');

        sandboxScript.type = 'text/javascript';
        sandboxScript.text = scriptText;

        sandboxDoc.body.appendChild(sandboxScript);
    }

    function getSandbox(domain) {
        return sandboxes[domain] || (sandboxes[domain] = new Sandbox(domain));
    }

    function Sandbox(domain) {
        var sandbox = this,
            iframe, sandboxWindow, sandboxDoc;

        iframe = document.createElement('iframe');
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

    Sandbox.prototype.get = function sandboxGetter(value) {
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

    /***Start Hash-generation***/
    /**
     *  @return {string}
     */
    function randomHex() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    /**
     *  @return {string}
     */
    function generateHash(formatString) {
        return formatString.replace(/x/g, randomHex);
    }
    /***End Hash-generation***/

    return lang;
});