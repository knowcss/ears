# ears
The Super-Charged Event Listener.

ears.js adds many features not natively available in addEventListener/removeEventListener: platform/environment/device/screensize targeting, grouped events, rate limiting, flood management, delayed triggers, easy keyboard binding, swipe/drag/hold detection, user vs bot detection, easy on/off management, lazy-load events, double event firing protection, automatic addition/removal of events for elements that appear and vanish in DOM.

```
// use window.ears.push() at any time, $ears() only when DOM is ready
window.ears = window.ears || [];

const opt = { rate: 250, flood: true };
const domReady = (e) => {
    console.log('$ears is listening..');

    // enable a multi-event listener, disable on first call
    $ears().on('scroll,click,user', 'multi', (e) => {
        $ears().off('scroll,click,user', 'multi');
    });
};
const callBack = (e) => { console.log(e); };

// push 1 listener, execute on $ears startup, only run once
window.ears.push(['load', 'id', callBack, { "startup": true, "once": true }]);

// create many listeners with varying options and targets (body is default target)
window.ears.push([
    ['scroll', 'id', callBack, { rate: 100 }],
    ['click', 'id', callBack, { target: '.row' } ],
    ['keydown', 'id', callBack, { targets: ['.select', '.textarea', '.input'] } ],
    ['DOMContentLoaded', 'id', callBack, { once: true, event: domReady }],
    ['user', 'id', (e) => { console.log('user detected'); }, { once: true }],
    ['swipe', 'id', callBack, { desktop: false }],
    ['drag', 'id', callBack, { mobile: false }],
    ['render', 'id', callBack, opt],
    ['hover', 'id', callBack, opt],
    ['mouse', 'id', callBack, opt],
    ['press', 'id', callBack, opt],
    ['unpress', 'id', callBack, opt],
    ['resize', 'id', callBack, { rate: 250 }],
    ['click', 'id', (e) => { console.log('next slide'); }, { target: '.next', key: 39 }],
    ['click', 'id', (e) => { console.log('previous slide'); }, { target: '.prev', key: 37 }],
    ['dragholding', 'id', callBack, { mobile: false }],
    ['swipeholding', 'id', callBack, { desktop: false }]
]);

// custom events may be created that group many events into a single eventlistener. $ears has a default starter set in userGroupHandlers - add your own!
const userGroupHandlers = {
    'user': ['blur', 'click', 'contextmenu', 'dblclick', 'focus', 'keydown', 'keypress', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'mousewheel', 'submit', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'DOMMouseScroll', 'MozMousePixelScroll'],
    'touch': ['touchcancel', 'touchend', 'touchmove', 'touchstart'],
    'press': ['click', 'dblclick', 'touchstart']
    ...etc
};
```
