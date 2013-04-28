JAR.register({
    MID: "jar.lang",
    deps: "SYSTEM",
    bundle: [
		"String", "Array",
		"Object", "Function",
		"Class.*", "Interface",
		"Comparable", "Iterable",
		"Cloneable"
	],
    domReady: true
}, function(SYSTEM) {
    var lang = SYSTEM, iframe, iframeDoc, nativeCopies = {};
    
    /**
     * Hack to steal native objects like Object, Array, String, etc. from an iframe
     * We save the native object in an iframe as a property of the document
     * and then access this property for example to extend the Object.prototype
     * The Object.prototype of the current document won't be affected by this
     * 
     * Note: the iframe has to be open all the time to make sure
     * that the current document has access to the native copies in some browsers
     * 
     * You can read more about this on http://dean.edwards.name/weblog/2006/11/hooray/
     * TODO check browser support
     */
    lang.copyNative = function(type) {
		if(!(type in nativeCopies)) {
			
			if(!iframe) {
				iframe = document.createElement("iframe");
			    iframe.style.display = "none";
				document.documentElement.appendChild(iframe);
				iframeDoc = iframe.contentWindow.document;
			}
			iframeDoc.write("<script>window.document._" + type + " = " + type + ";<\/script>");
			
			nativeCopies[type] = iframeDoc["_" + type];
		}	
		return nativeCopies[type];
    };
    
    return lang;
});