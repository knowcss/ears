'use strict';

/*
Ears Version 1.0.0 by Jay Doublay
https://www.jaydoublay.com/

Repo: https://github.com/knowcss/ears
*/

const startUp = new Date().getTime();

const config = {
    debugHandlers: false,
    floodTime: 150,
    floodTimeSame: 350,
    deviceType: /iPad/.test(navigator.userAgent) ? 't' : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? 'm' : 'd',
};

const deviceType = /iPad/.test(navigator.userAgent) ? 't' : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? 'm' : 'd';
const passiveHandler = (opt) => !opt.prevent;
const passiveHandlers = {
    'touchstart': passiveHandler,
    'touchmove': passiveHandler,
    'mousewheel': passiveHandler,
    'wheel': passiveHandler
};
const userGroupHandlers = {
    'user': ['blur', 'click', 'contextmenu', 'dblclick', 'focus', 'keydown', 'keypress', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'mousewheel', 'submit', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'DOMMouseScroll', 'MozMousePixelScroll'],
    'mouse': ['mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
    'wheeled': ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
    'touch': ['touchcancel', 'touchend', 'touchmove', 'touchstart'],
    'press': ['click', 'dblclick', 'touchstart'],
    'hover': ['mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'touchcancel', 'touchend', 'touchmove', 'touchstart'],
    'unpress': ['mouseup', 'touchend', 'blur', 'focusout'],
    'value': ['keydown', 'keypress', 'keyup', 'change'],
    'populated': ['keydown', 'keypress', 'keyup', 'change', 'input'],
    'caret': ['blur', 'focus', 'focusin', 'focusout'],
    'ready': ['load', 'DOMContentLoaded'],
    'swipe': ['swipeup', 'swipedown', 'swipeleft', 'swiperight'],
    'drag': ['dragup', 'dragdown', 'dragleft', 'dragright'],
    'dragdrop': ['dragover', 'drop', 'dragenter', 'dragleave', 'dragexit'],
    'scrolled': ['scrollstart', 'scrollend', 'scroll', 'wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
    'focuschange': ['mousedown', 'mouseup', 'touchstart', 'touchend'],
    'render': ['resize', 'DOMContentLoaded', 'load'],
    'enter': ['keydown', 'keypress', 'keyup'],
    'modal': ['show.bs.modal', 'shown.bs.modal', 'hide.bs.modal', 'hidden.bs.modal']

    // Experimental disabled until further video tag testing
    //'media': ['playing', 'waiting', 'seeking', 'seeked', 'ended', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'durationchange', 'timeupdate', 'play', 'pause', 'ratechange', 'volumechange', 'suspend', 'emptied', 'stalled']

    // Experimental disabled until further testing
    //'innerhtml': ['DOMSubtreeModified', 'DOMNodeInserted', 'DOMNodeRemoved']
};
const optionsDefault = {
    'parent': '',
    'priority': 0, // JAA TODO set stack priority of handler over others
    'keys': [], // List of keyCodes that may trigger this action
    'key': '', // keyCode that may trigger this action
    'fingers': 1, // how many fingers may trigger this action - JAA TODO add [min, max] range option
    'duration': 0, // JAA TODO for hold handlers, how long until event is triggered?
    'event': null, // function to trigger when handler has succeeded with passed arguments (event, handler, id, keyCode)
    'bind': false, // bind event directly to target/targets?
    'shortpause': 0, // pause handlers related to event for a short time
    'flood': false, // prevent flood of events

    'mobile': true, // run on mobile device?
    'tablet': true, // run on tablet device?
    'desktop': true, // run on desktop device?

    /*
    'ios': true, // JAA TODO run on iOS device?
    'android': true, // JAA TODO run on Android device?
    'windows': true, // JAA TODO run on Windows device?
    'mac': true, // JAA TODO run on Mac device?
    'linux': true, // JAA TODO run on Linux device?
    'chromeos': true, // JAA TODO run on ChromeOS device?
    'other': true, // JAA TODO run on other device?

    'safari': true, // JAA TODO run in safari?
    'chrome': true, // JAA TODO run in chrome?
    'firefox': true, // JAA TODO run in firefox?
    'edge': true, // JAA TODO run in edge?
    'opera': true, // JAA TODO run in opera?
    'ie': true, // JAA TODO run in ie?
    */

    'startup': false, // run once immediately on startup?
    'human': false, // run immediately on startup if human detected?
    'prevent': false, // prevent default event - enabled by default if target or targets is set, pass function name to process true/false realtime
    'execute': true, // execute event - pass function name to process true/false realtime
    'target': '', // run only if target is matching id
    'targets': [], // run only if target is matching ids
    'ready': false, // run only if document is ready
    'dom': false, // run only if interactive is ready
    'jquery': false, // jQuery required to run?
    'once': false, // run once and stop?
    'delay': 0, // prevent initial run before page load delay
    'stutter': 0, // pause before executing trigger after event
    'rate': 0, // prevent subsequent run before delay
    'min-width': 0, // device min width to run
    'max-width': 0, // device max width to run
    'max': 999999999 // max number of run times
};

//var state = {}; // JAA TODO - move below to state{}
var enabledHandlers = {};
var enabledGroupHandlers = {};
var injectHandlers = {};
var injectKeys = {};
var pausedHandlers = {};

var trackingKeys = false;
var globalFreeze = false;

var lastClick = new Date().getTime();
var lastClickID = '';
var lastTarget = null;
var lastEvent = null;

var humanScrollCheckAdded = false;
var humanUser = false;

var dragEnabled = false;
var dragCurrent = false;
var dragDuration = 0;
var dragXY = [0, 0, 0, 0, 0, null, 0];

var swipeEnabled = false;
var swipeCurrent = false;
var swipeDuration = 0;
var swipeScrolling = false;
var swipeXY = [0, 0, 0, 0, 0, null, 0, null, 0, 0];
var swipeInProgress = false;
var firstSwipe = '';
var currentSwipe = '';
var eventSwipe = null;
var preventSwipe = false;
var ignoreSwipeUpDown = false;

const listen = {
    on: function (handlerArray) {
        earsEngine.addHandlersDo(handlerArray);
    },
    off: function (handlerArray) {
        earsEngine.removeHandlersDo(handlerArray);
    },
    add: function (handlerArray) {
        earsEngine.addHandlersDo(handlerArray);
    },
    remove: function (handlerArray) {
        earsEngine.removeHandlersDo(handlerArray, id);
    },
    pause: function (handler) {
        earsEngine.pauseHandlersDo(handler);
    },
    resume: function (handler) {
        earsEngine.resumeHandlersDo(handler);
    },
    delay: function (handler, timeout) {
        earsEngine.shortPauseHandlerDo(handler, timeout);
    },
    execute: function (key, handlers, id, callback, options) {
        if (typeof handlers == 'object' && typeof handlers[0] !== 'object') { handlers = [handlers]; } // single push()
        else if (Array.isArray(handlers)) {}
        else if (id || typeof handlers === 'string') {
	    	if (id && typeof id === 'function') {
	    		options = callback;
	    		callback = id;
	    		id = null;
	    	}
	    	handlers = [[handlers, id, callback, options]];
	    }
        return key in this ? this[key](handlers) : false;
    }
}

var earsReady = false;
var earsProto = function () { };
earsProto.prototype = {
    init: () => {
        if (!earsReady) {
            earsReady = true;
            window.ears = window.ears || [];
            if (window.ears.length > 0) {
            	var value = null;
                while (window.ears.length > 0) {
                	value = window.ears.shift();
                	if (value && value.length > 0) { $ears().add(value); }
	            }
            }
            window.ears = new Proxy(window.ears, {
                set: function (target, property, value) {
                    if (typeof value === 'object' && value != null) {
                    	if (value && value.length > 0) { $ears().add(value); }
                    }
                    else { target[property] = value; }
                    return true;
                }
            });
        }
    },
    device: () => deviceType,

    human: () => humanUser,
    paused: (handler) => handler in pausedHandlers,

    on: (handlers, id, callback, options) => listen.execute('on', handlers, id, callback, options),
    off: (handlers, id, callback, options) => listen.execute('off', handlers, id, callback, options),
    add: (handlers, id, callback, options) => listen.execute('add', handlers, id, callback, options),
    remove: (handlers, id) => listen.execute('remove', handlers, id),
    pause: (handlers, id) => listen.execute('pause', handlers, id),
    resume: (handlers, id) => listen.execute('resume', handlers, id),
    delay: (handlers, id, timeout) => listen.execute('delay', handlers, id, timeout),

    execute: (handler, id, args, caller) => { return earsEngine.executeHandlerDo(handler, id, args, caller); }
};

const earsEngine = {
    pauseHandlersDo: function (handlers) {
        if (handlers.length > 0) {
            for (var i = 0; i < handlers.length; i++) { pausedHandlers[handlers[i]] = true; }
        }
    },
    pauseHandlerDo: function (handler) { pausedHandlers[handler] = true; },
    resumeHandlersDo: function (handlers) {
        if (handlers.length > 0) {
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] in pausedHandlers) { delete pausedHandlers[handlers[i]]; }
            }
        }
    },
    resumeHandlerDo: function (handler) {
        if (handler in pausedHandlers) { delete pausedHandlers[handler]; }
    },
    shortPauseHandlerDo: function (handler, timeout) {
        this.pauseHandlerDo(handler);
        setTimeout(function () { this.resumeHandlerDo(handler); }, timeout || 50);
    },
    debug: function (msg) { console.log(msg); },
    sendEvent: function (eventType, elem, duration, detail) {
        if (detail && duration) { detail.duration = duration; }
        var opt = {
            view: elem || window,
            bubbles: true,
            cancelable: true,
            duration: duration,
            detail: detail
        };
        if (elem) { elem.dispatchEvent(new CustomEvent(eventType, opt)); }
        else { window.dispatchEvent(new CustomEvent(eventType, opt)); }
    },
    dragReset: function () {
        dragXY = [0, 0, 0, 0, 0, null, 0];
    },
    stopDragHold: function (x, y) {
        if (dragCurrent) {
            if (typeof x !== 'undefined' && typeof y !== 'undefined' && x < 10 && y < 10) {
            }
            else {
                clearInterval(dragCurrent);
                dragCurrent = null;
                dragDuration = 0;
            }
        }
    },
    enableDragListener: function () {
        const ctx = this;
        dragEnabled = true;
        window.addEventListener('mousedown', function (e) {
            dragXY = [e.pageX, e.pageY, e.pageX, e.pageY, 1, e.target, new Date().getTime(), e];
            ctx.stopDragHold();
            dragCurrent = setInterval(function () {
                if (dragXY[6]) {
                    dragDuration++;
                    ctx.sendEvent('dragholding', dragXY[5], dragDuration, dragXY[7]);
                }
                else { ctx.stopDragHold(); }
            }, 250);
        });
        window.addEventListener('mousemove', function (e) {
            if (dragXY[4] == 1) {
                dragXY[2] = e.pageX;
                dragXY[3] = e.pageY;
                var xDiff = dragXY[0] - dragXY[2];
                var yDiff = dragXY[1] - dragXY[3];
                if (xDiff < 0) { xDiff = xDiff * -1; }
                if (yDiff < 0) { yDiff = yDiff * -1; }
                ctx.stopDragHold(xDiff, yDiff);
                var elem = dragXY[5];
                var tDiff = new Date().getTime() - dragXY[6];
                ctx.sendEvent('dragging', elem, tDiff, dragXY[7]);
            }
            else { ctx.dragReset(); }
        });
        window.addEventListener('mouseup', function (e) {
            ctx.stopDragHold();
            if (dragXY[0] != 0 && dragXY[1] != 0 && dragXY[2] != 0 && dragXY[3] != 0 && dragXY[4] > 0) {
                var xDiff = dragXY[0] - dragXY[2];
                var yDiff = dragXY[1] - dragXY[3];
                var elem = dragXY[5];
                var tDiff = new Date().getTime() - dragXY[6];
                if (Math.abs(xDiff) < 20 && Math.abs(yDiff) < 20) {
                    if (tDiff > 500) { ctx.sendEvent('draghold', elem, tDiff, dragXY[7]); }
                    else { ctx.sendEvent('dragtap', elem, tDiff, dragXY[7]); }
                }
                else {
                    ctx.sendEvent('drag', elem, tDiff, dragXY[7]);
                    if (Math.abs(xDiff) > Math.abs(yDiff)) {
                        if (xDiff > 0) { ctx.sendEvent('dragleft', elem, tDiff, dragXY[7]); }
                        else { ctx.sendEvent('dragright', elem, tDiff, dragXY[7]); }
                    }
                    else {
                        if (yDiff > 0) { ctx.sendEvent('dragup', elem, tDiff, dragXY[7]); }
                        else { ctx.sendEvent('dragdown', elem, tDiff, dragXY[7]); }
                    }
                }
            }
            ctx.dragReset();
        });
        window.addEventListener('mousecancel', function (e) {
            ctx.stopDragHold();
            ctx.dragReset();
        });
    },
    shouldAllowSwipe: function (e) {
        if (preventSwipe) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        else { return true; }
    },
    swipeReset: function () {
        swipeXY = [0, 0, 0, 0, 0, null, 0, null, 0, 0];
    },
    stopSwipeHold: function (x, y) {
        if (swipeCurrent) {
            if (typeof x !== 'undefined' && typeof y !== 'undefined' && x < 10 && y < 10) {
            }
            else {
                clearInterval(swipeCurrent);
                swipeCurrent = null;
                swipeDuration = 0;
            }
        }
    },
    enableSwipeListener: function () {
        const ctx = this;
        swipeEnabled = true;
        window.addEventListener('contextmenu', function (e) {
            if (swipeInProgress) { e.preventDefault(); }
        });
        window.addEventListener('touchstart', function (e) {
            if (ctx.shouldAllowSwipe(e)) {
                swipeInProgress = true;
                firstSwipe = '';
                eventSwipe = e;
                ignoreSwipeUpDown = false;
                if ('touches' in e && e.touches.length >= 1) {
                    swipeXY = [e.touches[0].clientX, e.touches[0].clientY, e.touches[0].clientX, e.touches[0].clientY, e.touches.length, e.target, new Date().getTime(), e, e.touches[0].clientX, e.touches[0].clientY];
                    ctx.sendEvent('swipingstart', swipeXY[5], 0, swipeXY[7]);
                    ctx.stopSwipeHold();
                    swipeCurrent = setInterval(function () {
                        if (swipeXY[6]) {
                            swipeDuration++;
                            ctx.sendEvent('swipeholding', swipeXY[5], swipeDuration, swipeXY[7]);
                        }
                        else { ctx.stopSwipeHold(); }
                    }, 250);
                }
            }
        });
        window.addEventListener('touchmove', function (e) {
            if (ctx.shouldAllowSwipe(e)) {
                if (ignoreSwipeUpDown) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                swipeInProgress = true;
                if ('touches' in e && e.touches.length == swipeXY[4]) {
                    swipeXY[2] = e.touches[0].clientX;
                    swipeXY[3] = e.touches[0].clientY;
                    var elem = swipeXY[5];
                    var tDiff = new Date().getTime() - swipeXY[6];
                    ctx.sendEvent('swiping', elem, tDiff, swipeXY[7]);
                    var xDiff = swipeXY[8] - swipeXY[2];
                    var yDiff = swipeXY[9] - swipeXY[3];
                    swipeXY[8] = e.touches[0].clientX;
                    swipeXY[9] = e.touches[0].clientY;
                    eventSwipe = e;
                    if (Math.abs(xDiff) > Math.abs(yDiff)) {
                        if (xDiff > 0) {
                            if (firstSwipe == '') { firstSwipe = 'left'; }
                            currentSwipe = 'left';
                            ctx.sendEvent('swipingleft', elem, tDiff, swipeXY[7]);
                        }
                        else {
                            if (firstSwipe == '') { firstSwipe = 'right'; }
                            currentSwipe = 'right';
                            ctx.sendEvent('swipingright', elem, tDiff, swipeXY[7]);
                        }
                        if (['up', 'down'].includes(firstSwipe)) {
                            ctx.sendEvent('swipingchange', elem, tDiff, swipeXY[7]);
                        }
                    }
                    else {
                        if (yDiff > 0) {
                            if (firstSwipe == '') { firstSwipe = 'up'; }
                            currentSwipe = 'up';
                            ctx.sendEvent('swipingup', elem, tDiff, swipeXY[7]);
                        }
                        else {
                            if (firstSwipe == '') { firstSwipe = 'down'; }
                            currentSwipe = 'down';
                            ctx.sendEvent('swipingdown', elem, tDiff, swipeXY[7]);
                        }
                        if (['left', 'right'].includes(firstSwipe)) {
                            ctx.sendEvent('swipingchange', elem, tDiff, swipeXY[7]);
                        }
                        ctx.sendEvent('scrollstart', elem, tDiff, swipeXY[7]);
                        swipeScrolling = true;
                    }
                    if (xDiff < 0) { xDiff = xDiff * -1; }
                    if (yDiff < 0) { yDiff = yDiff * -1; }
                    ctx.stopSwipeHold(xDiff, yDiff);
                }
                else { ctx.swipeReset(); }
            }
        }, { passive: false });
        window.addEventListener('touchend', function (e) {
            if (ctx.shouldAllowSwipe(e)) {
                ctx.stopDragHold();
                if (swipeXY[0] != 0 && swipeXY[1] != 0 && swipeXY[2] != 0 && swipeXY[3] != 0 && swipeXY[4] > 0) {
                    var xDiff = swipeXY[0] - swipeXY[2];
                    var yDiff = swipeXY[1] - swipeXY[3];
                    var elem = swipeXY[5];
                    var tDiff = new Date().getTime() - swipeXY[6];
                    if (Math.abs(xDiff) < 20 && Math.abs(yDiff) < 20) {
                        if (tDiff > 500) { ctx.sendEvent('swipehold', elem, tDiff, swipeXY[7]); }
                        else { ctx.sendEvent('swipetap', elem, tDiff, swipeXY[7]); }
                    }
                    else {
                        ctx.sendEvent('swipe', elem, tDiff, swipeXY[7]);
                        if (Math.abs(xDiff) > Math.abs(yDiff)) {
                            if (xDiff > 0) { ctx.sendEvent('swipeleft', elem, tDiff, swipeXY[7]); }
                            else { ctx.sendEvent('swiperight', elem, tDiff, swipeXY[7]); }
                        }
                        else {
                            if (yDiff > 0) { ctx.sendEvent('swipeup', elem, tDiff, swipeXY[7]); }
                            else { ctx.sendEvent('swipedown', elem, tDiff, swipeXY[7]); }
                        }
                    }
                    ctx.sendEvent('swipingend', elem, tDiff, swipeXY[7]);
                }
                ctx.swipeEnded();
            }
        }, { passive: false });
        window.addEventListener('touchcancel', function (e) {
            if (ctx.shouldAllowSwipe(e)) {
                ctx.stopDragHold();
                ctx.swipeEnded();
            }
        }, { passive: false });
    },
    swipeEnded: function () {
        if (swipeScrolling) { this.sendEvent('scrollend', swipeXY[5], 0, swipeXY[7]); }
        swipeScrolling = false;
        this.swipeReset();
        swipeInProgress = false;
        firstSwipe = '';
        eventSwipe = null;
        ignoreSwipeUpDown = false;
    },
    log: function (msg, force) {
        if (config.debugHandlers || force) { this.debug(msg); }
    },
    allowRepeat: function (nowTime, lastTime, handler) {
        var oneEvent = handler != 'click' && this.handlerOneEvent(handler);
        var diff = nowTime - lastTime;
        var ret = true;
        if (oneEvent) {
            var globalDiff = nowTime - lastClick;
            ret = diff > config.floodTimeSame && globalDiff > config.floodTime;
        }
        else { ret = diff > config.floodTimeSame; }
        return ret;
    },
    executeHandlerDo: function (handler, id, args, caller) {
        var ret = false;
        if (handler in injectHandlers && id in injectHandlers[handler]) {
            if (injectHandlers[handler][id].length > 3) {
                var oneEvent = this.handlerOneEvent(handler);
                var targetedTime = new Date().getTime();
                if (!oneEvent || this.allowRepeat(targetedTime, injectHandlers[handler][id][3], handler)) {
                    var func = injectHandlers[handler][id][0];
                    var opt = id in injectHandlers[handler] ? injectHandlers[handler][id][1] : {};
                    var arg = args || [];
                    this.log('handle handler -> ' + handler + '[' + id + '] = ' + arg.length);

                    injectHandlers[handler][id][2]++;
                    if (oneEvent) {
                        lastClick = targetedTime;
                        lastClickID = handler + '__' + id;
                    }
                    var stutter = ('stutter' in opt && parseInt(opt.stutter) > 0) ? opt.stutter : 0;
                    var parentId = ('parent' in opt && opt.parent.length > 0) ? opt.parent : '';
                    if ('max' in opt && parseInt(opt.max) <= 0) { this.removeHandlerDo(handler, id); }
                    else if (stutter > 0) { setTimeout(function () { this.dispatchHandler(func, arg, handler, id, parentId, caller); }, stutter); }
                    else { this.dispatchHandler(func, arg, handler, id, parentId, caller); }
                    if (handler in injectHandlers && id in injectHandlers[handler]) {
                        if (injectHandlers[handler][id].length > 3) {
                            if ('once' in opt && opt.once) { this.removeHandlerDo(handler, id); }
                            else if ('max' in opt && parseInt(opt.max) <= injectHandlers[handler][id][2]) { this.removeHandlerDo(handler, id); }
                        }
                    }
                    ret = true;
                    if (handler in injectHandlers && id in injectHandlers[handler]) {
                        if (injectHandlers[handler][id].length > 3) { injectHandlers[handler][id][3] = targetedTime; }
                    }
                }
                else { this.log('skip execute handler -> ' + handler + '[' + id + ']'); }
            }
            else { this.log('bad handler -> ' + handler + '[' + id + ']'); }
        }
        return ret;
    },
    addHandlersDo: function (handlers) {
        if (typeof handlers !== 'undefined') {
            this.log('add multi handlers -> ' + handlers.length);
            var args = [];
            for (var i = 0; i < handlers.length; i++) {
                if (handlers.length > i) {
                    args = [null, null, null, null];
                    for (var j = 0; j < handlers[i].length; j++) {
                        args[j] = (handlers[i].length >= j && handlers[i][j]) ? handlers[i][j] : null;
                    }
                    this.addHandlerDo(args[0], args[1], args[2], args[3]);
                }
            }
            this.log('added multi handlers -> ' + handlers.length);
        }
    },
    handleKeyPress: function (e) {
        var keyCode = e.keyCode ? e.keyCode : e.key;
        if (keyCode in injectKeys) {
            for (var handler in injectKeys[keyCode]) {
                for (var id in injectKeys[keyCode][handler]) {
                    var opt = id in injectHandlers[handler] ? injectHandlers[handler][id][1] : {};
                    this.log('executeKey - ' + keyCode + ' - ' + handler + ' - ' + id);
                    var shouldPrevent = false;
                    if (typeof opt.prevent === 'function') { shouldPrevent = opt.prevent.apply(this, [], null, null); }
                    else { shouldPrevent = opt.prevent; }
                    if (shouldPrevent) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    var didExecute = this.executeHandlerDo(handler, id, null, null);
                    if (didExecute && 'event' in opt) {
                        if (typeof opt.event !== 'undefined' && typeof opt.event === 'function') {
                            var parentId = ('parent' in opt && opt.parent.length > 0) ? opt.parent : '';
                            opt.event.apply(this, [e, handler, id, keyCode, parentId], null, null);
                        }
                    }
                }
            }
        }
    },
    injectKey: function (handler, id, key) {
        if (!trackingKeys) {
            window.addEventListener('keydown', handleKeyPress);
            trackingKeys = true;
        }
        if (key in injectKeys === false) { injectKeys[key] = {}; }
        if (handler in injectKeys[key] === false) { injectKeys[key][handler] = {}; }
        injectKeys[key][handler][id] = true;
        this.log('injectKey - ' + key + ' - ' + handler + ' - ' + id);
    },
    addHandlerKeyDo: function (handler, id) {
        var usedKeys = [];
        var opt = id in injectHandlers[handler] ? injectHandlers[handler][id][1] : {};
        if ('key' in opt && opt.key && parseInt(opt.key) > 0) { usedKeys = [opt.key]; }
        else if ('keys' in opt && opt.keys && opt.keys.length > 0) { usedKeys = opt.keys; }
        if (usedKeys.length > 0) {
            for (var j = 0; j < usedKeys.length; j++) { this.injectKey(handler, id, usedKeys[j]); }
        }
    },
    removeKey: function (handler, id, key) {
        if (key in injectKeys && handler in injectKeys[key] && id in injectKeys[key][handler]) {
            delete injectKeys[key][handler][id];
            if (Object.keys(injectKeys[key][handler]).length == 0) { delete injectKeys[key][handler]; }
            if (Object.keys(injectKeys[key]).length == 0) { delete injectKeys[key]; }
            if (Object.keys(injectKeys).length == 0) {
                injectKeys = {};
                if (trackingKeys) {
                    window.removeEventListener('keydown', handleKeyPress);
                    trackingKeys = false;
                }
            }
        }
        this.log('removeKey - ' + key + ' - ' + handler + ' - ' + id);
    },
    removeHandlerKeyDo: function (handler, id) {
        var usedKeys = [];
        var opt = id in injectHandlers[handler] ? injectHandlers[handler][id][1] : {};
        if ('key' in opt && opt.key && parseInt(opt.key) > 0) { usedKeys = [opt.key]; }
        else if ('keys' in opt && opt.keys && opt.keys.length > 0) { usedKeys = opt.keys; }
        if (usedKeys.length > 0) {
            for (var j = 0; j < usedKeys.length; j++) { this.removeKey(handler, id, usedKeys[j]); }
        }
    },
    keyBoardHandlers: function () { return ['value', 'caret', 'keydown', 'keypress', 'keyup', 'change', 'blur', 'focus', 'focusin', 'focusout']; },
    pressHandlers: function () { return ['press', 'click', 'dblclick']; },
    handlerTriggered: function (handler) {
        var ret = false;
        if (typeof window.triggered !== 'undefined') {
            if (handler in window.triggered) {
                ret = true;
                delete window.triggered[handler];
            }
        }
        return ret;
    },
    multiEventString: (str) => {
    	if (typeof str === 'string') {
    		if (str.indexOf(',') > -1) { str = str.split(','); }
    		else if (str.indexOf(' ') > -1) { str = str.split(' '); }
    		else { str = [str]; }
    	}
    	return str || [];
    },
    addHandlerDo: function (handlerArray, id, callback, options) {
    	handlerArray = this.multiEventString(handlerArray);
        var usedOptions = JSON.parse(JSON.stringify(optionsDefault));
        if (typeof options !== 'undefined' && options != null) {
            if (('target' in options && options.target != null && options.target.length > 0) || ('targets' in options && options.targets != null && options.targets.length > 0)) {
                if ('prevent' in options === false) {
                    var defaultPrevent = false;
                    var pressHandlerTypes = this.pressHandlers();
                    for (var i = 0; i < handlerArray.length; i++) {
                        if (pressHandlerTypes.includes(handlerArray[i])) {
                            defaultPrevent = true;
                            break;
                        }
                    }
                    options.prevent = defaultPrevent;
                }
            }
            if ('once' in options && options.once) { options.max = 1; }
            for (var option in options) { usedOptions[option] = options[option]; }
        }
        var skipGlobalHandler = false;
        if (handlerArray.includes('ready') || handlerArray.includes('load') || handlerArray.includes('DOMContentLoaded')) {
            var fireEventNow = false;
            if ((handlerArray.includes('ready') || handlerArray.includes('DOMContentLoaded')) && ['interactive', 'complete'].includes(document.readyState)) { fireEventNow = true; }
            else if (['complete'].includes(document.readyState)) { fireEventNow = true; }
            if (fireEventNow) {
                for (var i = 0; i < handlerArray.length; i++) {
                    var handler = handlerArray[i];
                    usedOptions.startup = false;
                    usedOptions.max = 0;
                    usedOptions.once = true;
                    var parentId = ('parent' in usedOptions && usedOptions.parent.length > 0) ? usedOptions.parent : '';
                    var args = [null, handler, id, '', parentId];
                    this.dispatchHandler(callback, args, handler, id, parentId, null);
                    this.log('interactive handler -> ' + handler + '[' + id + '] = ' + args.length + ' - ' + arguments.length);
                    skipGlobalHandler = true;
                    break;
                }
            }
        }
        if (!skipGlobalHandler) {
            var handler = '';
            var handlerStartup = true;
            if ('rate' in usedOptions === false || usedOptions.rate == 0) {
                if (handlerArray.includes('input') || handlerArray.includes('value') || handlerArray.includes('populated')) { usedOptions.rate = 10; }
                else if (handlerArray.includes('focusin') || handlerArray.includes('focusout') || handlerArray.includes('focus') || handlerArray.includes('blur') || handlerArray.includes('caret')) { usedOptions.rate = 10; }
                else if (handlerArray.includes('drop') || handlerArray.includes('dragover')) { usedOptions.rate = 50; }
                else if (handlerArray.includes('click')) { usedOptions.rate = 50; }
                else if (handlerArray.includes('keydown') || handlerArray.includes('keyup') || handlerArray.includes('keypress')) { usedOptions.rate = 10; }
            }
            for (var i = 0; i < handlerArray.length; i++) {
                handler = handlerArray[i];
                if (handler in injectHandlers === false) { injectHandlers[handler] = {}; }
                injectHandlers[handler][id] = [callback, usedOptions, 0, 0];
                this.addHandlerKeyDo(handler, id);
                if (this.handlerTriggered(handler) || (handlerStartup && 'startup' in usedOptions && usedOptions.startup)) {
                    handlerStartup = false;
                    var func = injectHandlers[handler][id][0];
                    var parentId = ('parent' in usedOptions && usedOptions.parent.length > 0) ? usedOptions.parent : '';
                    var args = [null, handler, id, '', parentId];
                    this.dispatchHandler(func, args, handler, id, parentId, document);
                    this.log('startup handler -> ' + handler + '[' + id + '] = ' + args.length + ' - ' + arguments.length);
                }
                this.globalHandlers(handler, id, usedOptions.bind, usedOptions.target, usedOptions.targets, usedOptions.human);
                this.log('added handler -> ' + handler + '[' + id + '] = ' + (options && 'once' in options));
            }
        }
    },
    removeHandlerDo: function (handlerArray, id) {
	    handlerArray = this.multiEventString(handlerArray);
        var handler = '';
        for (var i = 0; i < handlerArray.length; i++) {
            handler = handlerArray[i];
            this.log('remove handler -> ' + handler + '[' + id + ']');
            if (handler in injectHandlers && id in injectHandlers[handler]) {
                this.removeHandlerKeyDo(handler, id);
                delete injectHandlers[handler][id];
                this.log('removed handler -> ' + handler + '[' + id + ']');
            }
        }
    },
    removeHandlersDo: function (handlers) {
        this.log('remove multi handlers -> ' + handlers.length);
        var args = [];
        for (var i = 0; i < handlers.length; i++) {
            if (handlers.length > i) {
                args = [null, null];
                for (var j = 0; j < handlers[i].length; j++) {
                    args[j] = (handlers[i].length >= j && handlers[i][j]) ? handlers[i][j] : null;
                }
                this.removeHandlerDo(args[0], args[1]);
            }
        }
        this.log('removed multi handlers -> ' + handlers.length);
    },
    checkPassiveHandler: function (handler) {
        var ret = false;
        if (handler in passiveHandlers) {
            ret = { 'passive': passiveHandlers[handler].apply(this, [{ 'prevent': false }], null, null) };
        }
        return ret;
    },
    getScrollOffset: function () {
        var supportPageOffset = window.pageXOffset !== undefined;
        var isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');
        var currentScroll = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
        if (currentScroll < 0) { currentScroll = 0; }
        return currentScroll;
    },
    humanScrollCheck: function (e) {
        if (this.getScrollOffset() > 4) {
            this.log('executed user scroll handler');
            this.removeHumanScrollCheck();
            this.handleHandler(e, 'user');
        }
    },
    addHumanScrollCheck: function () {
        if (!humanScrollCheckAdded) {
            const ctx = this;
            this.log('added user scroll handler');
            humanScrollCheckAdded = true;
            window.addEventListener('scroll', (e) => { ctx.humanScrollCheck(e); });
        }
    },
    removeHumanScrollCheck: function () {
        if (humanScrollCheckAdded) {
            const ctx = this;
            this.signifyHumanDetection('user');
            this.log('removed user scroll handler');
            window.removeEventListener('scroll', (e) => { ctx.humanScrollCheck(e); });
        }
    },
    globalHandlers: function (handler, id, bindEnable, bindTarget, bindTargets, humanCheck) {
        const ctx = this;
        for (var injectHandler in injectHandlers) {
            if (injectHandler in enabledHandlers === false) {
                if (handler in userGroupHandlers) {
                    var groupHandler = '';
                    if (handler == 'user') { this.addHumanScrollCheck(); }
                    for (var i = 0; i < userGroupHandlers[handler].length; i++) {
                        groupHandler = userGroupHandlers[handler][i];
                        if (handler + '__' + groupHandler in enabledGroupHandlers === false) {
                            if (groupHandler.indexOf('mouse') > -1 && deviceType == 'm') { this.log('skip global mouse group handler -> ' + handler); }
                            else if (groupHandler.indexOf('touch') > -1 && deviceType == 'd') { this.log('skip global touch group handler -> ' + handler); }
                            else {
                                enabledGroupHandlers[handler + '__' + groupHandler] = true;
                                this.log('added global group handler -> ' + handler + ' - ' + groupHandler);
                                if (['drop'].includes(groupHandler)) { document.addEventListener(groupHandler, function (e) { ctx.handleHandler(e, handler); }, false); }
                                else if (['load', 'DOMContentLoad', 'ready'].includes(groupHandler)) {
                                    document.addEventListener(groupHandler, function (e) { ctx.handleHandler(e, handler); });
                                    window.addEventListener(groupHandler, function (e) { ctx.handleHandler(e, handler); });
                                }
                                else if (handler == 'enter') {
                                    window.addEventListener(groupHandler, function (e) {
                                        var keyCode = e.keyCode ? e.keyCode : e.key;
                                        if (keyCode == 13) { ctx.handleHandler(e, handler); }
                                    }, false);
                                }
                                else {
                                    window.addEventListener(groupHandler, function (e) { ctx.handleHandler(e, handler); }, ctx.checkPassiveHandler(groupHandler));
                                }
                            }
                        }
                    }
                    if (handler == 'user' && humanCheck && this.getScrollOffset() > 4) { this.handleHandler(null, handler); }
                }
                else {
                    if (handler.indexOf('mouse') > -1 && deviceType == 'm') { this.log('skip global mouse handler -> ' + handler); }
                    else if (handler.indexOf('touch') > -1 && deviceType == 'd') { this.log('skip global touch handler -> ' + handler); }
                    else {
                        var didBind = false;
                        this.log('added global handler -> ' + handler);
                        if (handler == 'drop') { document.addEventListener(handler, function (e) { ctx.handleHandler(e, handler); }, false); }
                        else if (['load', 'DOMContentLoad', 'ready'].includes(handler)) {
                            document.addEventListener(handler, function (e) { ctx.handleHandler(e, handler); });
                            window.addEventListener(handler, function (e) { ctx.handleHandler(e, handler); });
                        }
                        else if (handler == 'escape') {
                            document.addEventListener('keydown', function (e) {
                                if (('key' in e && e.key === 'Escape') ||
                                    ('which' in e && e.which === 27) ||
                                    ('keyCode' in e && e.keyCode === 27)
                                ) { ctx.handleHandler(e, handler); }
                            }, false);
                        }
                        else {
                            if (bindEnable) {
                                if (handler + '__' + id in enabledHandlers) { didBind = true; }
                                else {
                                    var getBinds = null;
                                    if (!didBind && bindTarget.length > 0) {
                                        getBinds = typeof bindTarget === 'string' ? document.querySelectorAll(bindTarget) : bindTarget;
                                        if (getBinds != null && getBinds.length > 0) {
                                            for (var i = 0; i < getBinds.length; i++) {
                                                getBinds[i].addEventListener(handler, function (e) { ctx.handleHandler(e, handler, id); }, false);
                                                didBind = true;
                                            }
                                        }
                                    }
                                    if (!didBind && bindTargets.length > 0) {
                                        for (var j = 0; j < bindTargets.length; j++) {
                                            getBinds = typeof bindTargets[j] === 'string' ? document.querySelectorAll(bindTargets[j]) : bindTargets[j];
                                            if (getBinds != null && getBinds.length > 0) {
                                                for (var i = 0; i < getBinds.length; i++) {
                                                    getBinds[i].addEventListener(handler, function (e) { ctx.handleHandler(e, handler, id); }, false);
                                                    didBind = true;
                                                }
                                            }
                                        }
                                    }
                                    if (didBind) { enabledHandlers[handler + '__' + id] = true; }
                                }
                            }
                            if (!didBind && handler in enabledHandlers == false) { window.addEventListener(handler, function (e) { ctx.handleHandler(e, handler); }, ctx.checkPassiveHandler(handler)); }
                        }
                        if (!didBind) { enabledHandlers[handler] = true; }
                    }
                }
            }
        }
        if (handler.indexOf('swipe') > -1) {
            if (!swipeEnabled) { this.enableSwipeListener(); }
        }
        else if (handler.indexOf('drag') > -1) {
            if (!dragEnabled) { this.enableDragListener(); }
        }
    },
    dispatchHandler: function (func, args, handler, id, parentId, caller) {
        if (args.length > 2) {
            var args = [].slice.call(args);
            args.pop();
        }
        if (typeof args === 'object') {
            try {
                if (args.length > 0 && typeof args[0] !== 'undefined' && 'target' in args[0]) { args[0].originalTarget = caller; }
            }
            catch (e) { }
        }

        try { [].push.call(args, parentId, caller, id); } catch (e) { }
        this.log('dispatch handler -> ' + handler + '[' + id + '] = ' + args.length);
        this.log([func, args]);
        if (func && typeof func === 'function') { return func.apply(this, args || []); }
        else { return false; }
    },
    handleTarget: function (e, id) {
        var ret = false;
        var caller = null;
        if ('target' in e && e.target) {
            var element = [];
            try { element = document.querySelectorAll(id); }
            catch (err) { element = []; }
            if (element.length == 0 && typeof id === 'object') { element = id; }
            this.log('handle target -> ' + id + ' = ' + element.length);
            if (element && element.length > 0) {
                for (var i = 0; i < element.length; i++) {
                    try {
                        if (e.target == element[i] || element[i].contains(e.target)) {
                            ret = true;
                            caller = element[i];
                            break;
                        }
                    }
                    catch (err) { }
                }
            }
        }
        return [ret, caller];
    },
    handleTargets: function (e, ids) {
        var ret = false;
        var caller = null;
        if ('target' in e && e.target) {
            if (ids && ids.length > 0) {
                var element = null;
                for (var i = 0; i < ids.length; i++) {
                    element = document.querySelectorAll(ids[i]);
                    if (element && element.length > 0) {
                        for (var j = 0; j < element.length; j++) {
                            try {
                                if (e.target == element[j] || element[j].contains(e.target)) {
                                    ret = true;
                                    caller = element[j];
                                    break;
                                }
                            }
                            catch (err) { }
                        }
                        if (ret) { break; }
                    }
                }
            }
        }
        return [ret, caller];
    },
    handlerOneEvent: function (handler) { return (handler == 'click' || handler.indexOf('drag') > -1 || handler.indexOf('swipe') > -1 || handler.indexOf('focusin') > -1); },
    signifyHumanDetection: function (handler) {
        if (handler == 'user' && !humanUser) {
            this.sendEvent('human:detected', document.body);
            humanUser = true;
        }
    },
    handleHandler: function (e, handler, oneID) {
        var skipHandler = globalFreeze || handler in pausedHandlers;
        if (!skipHandler && handler in injectHandlers) {
            this.log('handle global handlers -> ' + handler);

            var checkOneEvent = false;
            var stopPropagation = false;
            var targetedTime = new Date().getTime();
            var opt = null;
            var matchTarget = true;
            var shouldExecute = false;
            var triggerEvent = false;
            var targetCaller = null;

            this.signifyHumanDetection(handler);

            if (handler == 'drop') {
                e.preventDefault();
                e.stopPropagation();
            }
            var oneEvent = this.handlerOneEvent(handler);
            var scanHandlers = oneID ? [oneID] : Object.keys(injectHandlers[handler]);
            for (var n = 0; n < scanHandlers.length; n++) {
                var id = scanHandlers[n];
                oneEvent = (id !== 'master') && (handler == 'click' || handler.indexOf('drag') > -1 || handler.indexOf('swipe') > -1)
                opt = id in injectHandlers[handler] ? injectHandlers[handler][id][1] : {};
                matchTarget = true;
                triggerEvent = false;
                checkOneEvent = true;
                if (handler !== 'load' && handler !== 'ready') {
                    shouldExecute = true;
                    if ('execute' in opt) {
                        if (typeof opt.execute === 'function') { shouldExecute = opt.execute.apply(this, [], null, null); }
                        else { shouldExecute = opt.execute; }
                    }
                    if (shouldExecute) {
                        if (e && 'target' in e) { lastTarget = e.target; }
                        if (e) { lastEvent = e; }
                        if (!stopPropagation && matchTarget && 'target' in opt && typeof opt.target !== 'undefined' && opt.target.length > 0) {
                            [matchTarget, targetCaller] = this.handleTarget(e, opt.target);
                            this.log('handle target -> ' + opt.target + ' = ' + matchTarget);
                            if (matchTarget && 'prevent' in opt) {
                                var shouldPrevent = false;
                                if (typeof opt.prevent === 'function') { shouldPrevent = opt.prevent.apply(this, [], null, null); }
                                else { shouldPrevent = opt.prevent; }
                                if (shouldPrevent) {
                                    if (handler !== 'touchstart') { e.preventDefault(); }
                                    e.stopPropagation();
                                    stopPropagation = true;
                                }
                                else { checkOneEvent = false; }
                            }
                            if (matchTarget) { triggerEvent = true; }
                        }
                        if (!stopPropagation && matchTarget && 'targets' in opt && typeof opt.targets !== 'undefined' && opt.targets.length > 0) {
                            [matchTarget, targetCaller] = this.handleTargets(e, opt.targets);
                            if (matchTarget && 'prevent' in opt) {
                                var shouldPrevent = false;
                                if (typeof opt.prevent === 'function') { shouldPrevent = opt.prevent.apply(this, [], null, null); }
                                else { shouldPrevent = opt.prevent; }
                                if (shouldPrevent) {
                                    if (handler !== 'touchstart') { e.preventDefault(); }
                                    e.stopPropagation();
                                    stopPropagation = true;
                                }
                                else { checkOneEvent = false; }
                            }
                            if (matchTarget) { triggerEvent = true; }
                        }
                    }
                    else { matchTarget = false; }
                }
                else { triggerEvent = true; }

                if (!matchTarget) { }
                else if (checkOneEvent && oneEvent && !this.allowRepeat(targetedTime, injectHandlers[handler][id][3], handler)) {
                    this.log('skip paused handler direct -> ' + handler + '[' + id + ']');
                    if ('flood' in opt && opt.flood) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    }
                }
                else if ('delay' in opt && parseInt(opt.delay) > (targetedTime - startUp)) { }
                else if ('rate' in opt && parseInt(opt.rate) > (targetedTime - injectHandlers[handler][id][3])) { }
                else if ('mobile' in opt && !opt.mobile && deviceType == 'm') { }
                else if ('tablet' in opt && !opt.tablet && deviceType == 't') { }
                else if ('desktop' in opt && !opt.desktop && deviceType == 'd') { }

                /*
                else if ('ios' in opt && !opt.ios && deviceOS == 'i') { }
                else if ('android' in opt && !opt.android && deviceOS == 'a') { }
                else if ('windows' in opt && !opt.windows && deviceOS == 'w') { }
                else if ('mac' in opt && !opt.mac && deviceOS == 'm') { }
                else if ('linux' in opt && !opt.linux && deviceOS == 'l') { }
                else if ('chromeos' in opt && !opt.chromeos && deviceOS == 'c') { }
                else if ('otheros' in opt && !opt.otheros && deviceOS == 'o') { }

                else if ('safari' in opt && !opt.safari && browserType == 's') { }
                else if ('chrome' in opt && !opt.chrome && browserType == 'c') { }
                else if ('firefox' in opt && !opt.firefox && browserType == 'f') { }
                else if ('edge' in opt && !opt.edge && browserType == 'e') { }
                else if ('opera' in opt && !opt.opera && browserType == 'o') { }
                else if ('ie' in opt && !opt.ie && browserType == 'i') { }
                */

                else if ('ready' in opt && opt.ready && document.readyState !== 'complete') { }
                else if ('dom' in opt && opt.ready && document.readyState !== 'interactive') { }
                else if ('jquery' in opt && opt.jquery && typeof $ === 'undefined') { }
                else if ('max-width' in opt && parseInt(opt['max-width']) > 0 && parseInt(opt['max-width']) < window.innerWidth) { }
                else if ('min-width' in opt && parseInt(opt['min-width']) > 0 && parseInt(opt['min-width']) > window.innerWidth) { }
                else if (handler.indexOf('swipe') > -1 && 'detail' in e && e.detail && 'fingers' in opt && opt.fingers > 0 && parseInt(opt.fingers) != e.detail.touches.length) { }
                else if (id in injectHandlers[handler]) {
                    var didExecute = this.executeHandlerDo(handler, id, arguments, targetCaller);
                    if (didExecute && triggerEvent && 'event' in opt) {
                        if (typeof opt.event !== 'undefined' && typeof opt.event === 'function') {
                            var parentId = ('parent' in opt && opt.parent.length > 0) ? opt.parent : '';
                            opt.event.apply(this, [e, handler, id, '', parentId], null, null);
                        }
                    }
                    if (didExecute && 'shortpause' in opt && opt.shortpause > 0) {
                        this.shortPauseHandlerDo(handler, opt.shortpause);
                        if (handler.indexOf('focusin') > -1) {
                            e.stopImmediatePropagation();
                            this.shortPauseHandlerDo('click', opt.shortpause);
                        }
                    }
                    if (didExecute && handler.indexOf('focusout') > -1) {
                        if (document.activeElement == document.body) {
                            e.stopImmediatePropagation();
                            this.shortPauseHandlerDo('click', 50);
                        }
                    }
                    if (oneEvent && didExecute) {
                        if (handler.indexOf('focusin') > -1) {
                            e.stopImmediatePropagation();
                            this.shortPauseHandlerDo(handler, 50);
                        }
                    }
                }
                if (stopPropagation) { break; }
            }
        }
    }
};

if (typeof window !== 'undefined') {
    window.$ears = function () { return new earsProto(); };
    if (['interactive', 'complete'].includes(document.readyState)) { $ears().init(); }
    else { document.addEventListener('DOMContentLoaded', function () { $ears().init(); }); }
}
else if (typeof module !== 'undefined') { module.exports = earsProto; }
