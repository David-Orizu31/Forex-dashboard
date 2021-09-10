function initGlobals() {
    
    window.GLOBAL = window.GLOBAL || {};
    
    if (!GLOBAL.hasOwnProperty('mainSecureProtocol')) {
        GLOBAL.mainSecureProtocol = window.location.protocol.replace(':', '');
    }
    
    var mainHost = getMainHost() || GLOBAL.mainDomain || '';
    if (!GLOBAL.hasOwnProperty('mainDomain')) {
        GLOBAL.mainDomain = mainHost;
    }
    
    if (!GLOBAL.hasOwnProperty('mainPopuperDomain')) {
        GLOBAL.mainPopuperDomain = 'popuper.' + mainHost;
    }
    
    if (!GLOBAL.hasOwnProperty('assetsPopuperDomain')) {
        GLOBAL.assetsPopuperDomain = 'assets-popuper.' + mainHost;
    }
}

function getMainHost() {
    
    var numberOfDomainParts;
    
    if (document.location.host.indexOf('.local') > 0) {
        numberOfDomainParts = 3;
    } else {
        numberOfDomainParts = 2;
    }
    
    var explodedResult = document.location.host.split('.');
    
    if (explodedResult.length > numberOfDomainParts) {
        
        explodedResult.splice(0, explodedResult.length - numberOfDomainParts);
    }
    
    return explodedResult.join('.');
}

initGlobals();

/**
 * check & load some lib if need
 */
requireLib = {
    jquery: function (callBack) {
        if (typeof jQuery  === 'undefined') {
            this.load(
                '//' + GLOBAL.assetsPopuperDomain + '/js/jquery.js'
            );
            this.load(
                '//' + GLOBAL.assetsPopuperDomain + '/js/jquery-ui.js',
                callBack
            );
            return true;
        }
        return false;
    },
    
    vue: function (callBack) {
        if (typeof Vue  === 'undefined') {
            this.load('//' + GLOBAL.assetsPopuperDomain + '/js/vue.min.js?v=2', callBack);
            return true;
        }
        return false;
    },
    
    load: function (url, callBack) {
        var script = document.createElement('script');
        script.src = url;
        script.async = false;
        
        if (callBack !== undefined) {
            script.setAttribute('onload', callBack);
        }
        
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}

/**
 * Hide element
 * @param object el - element from DOM
 */
function hide(el) {
    el.style.display = 'none';
}

/**
 * Show element
 * @param object el - element from DOM
 */
function show(el) {
    el.style.display = 'block';
}

/**
 * Get one DOM element by class
 * @param string name - class name
 */
var cacheElementsByClass = {};
function getByClass(name) {
    if (cacheElementsByClass[name] === undefined) {
        var btn = document.getElementsByClassName(name);
        cacheElementsByClass[name] = btn[0];
        return cacheElementsByClass[name];
    }
    return cacheElementsByClass[name];
}

/**
 * Add cross browser event
 * @param object elem - element from DOM
 * @param string event - event name
 * @param function fn - function handler
 */
function addEvent(elem, event, fn) {
    if (typeof elem === 'undefined') {
        return false;
    }
    function listenHandler(e) {
        var ret = fn.apply(this, arguments);
        if (ret === false) {
            e.stopPropagation();
            e.preventDefault();
        }
        return (ret);
    }
    
    function attachHandler() {
        var ret = fn.call(elem, window.event);
        if (ret === false) {
            window.event.returnValue = false;
            window.event.cancelBubble = true;
        }
        return (ret);
    }
    
    if (elem.addEventListener) {
        elem.addEventListener(event, listenHandler, false);
    }
    else {
        elem.attachEvent("on" + event, attachHandler);
    }
}

function callPopuper() {
    jQuery(function() {
        var popuperAddress = '//' + GLOBAL.mainPopuperDomain + '/popuper.js';
        
        var additionalPopuperParams = {
            'v': new Date().getTime()
        };
        
        if (GLOBAL.hasOwnProperty('pageInfo')) {
            additionalPopuperParams['page'] = GLOBAL.pageInfo;
        }
        
        if (Object.keys(additionalPopuperParams).length) {
            popuperAddress += '?' + jQuery.param(additionalPopuperParams);
        }
        
        requireLib.load(popuperAddress);
    });
}

if (!requireLib.jquery('callPopuper();')) {
    callPopuper();
}