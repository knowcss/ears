# ears
The Super-Charged Event Listener

```
window.ears = window.ears || [];

const opt = { rate: 250, flood: true };
const domReady = (e) => { console.log('listening..'); };
const callBack = (e) => { console.log(e); };

// push 1 listener
window.ears.push(['load', 'id', callBack, { "startup": true, "once": true }]);

// create many listeners
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
    ['click', 'id', callBack, { target: '.next', key: 39 }],
    ['click', 'id', callBack, { target: '.prev', key: 37 }],
    ['dragholding', 'id', callBack, { mobile: false }],
    ['swipeholding', 'id', callBack, { desktop: false }]
]);
```
