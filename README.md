# ears
The Super-Charged Event Listener

```
window.ears = window.ears || [];
window.ears.push(['load', 'id', (e) => { console.log(e); }, { "startup": true, "once": true }]);

window.ears.push([
    ['scroll', 'id', (e) => { console.log(e); }, opt],
    ['click', 'id', (e) => { console.log(e); }, opt],
    ['keydown', 'id', (e) => { console.log(e); }, opt],
    ['DOMContentLoaded', 'id', (e) => { console.log(e); }, { "startup": true }],
    ['user', 'id', (e) => { console.log(e); }, opt],
    ['swipe', 'id', (e) => { console.log(e); }, opt],
    ['drag', 'id', (e) => { console.log(e); }, opt],
    ['render', 'id', (e) => { console.log(e); }, opt],
    ['hover', 'id', (e) => { console.log(e); }, opt],
    ['mouse', 'id', (e) => { console.log(e); }, opt],
    ['press', 'id', (e) => { console.log(e); }, opt],
    ['unpress', 'id', (e) => { console.log(e); }, opt],
    ['resize', 'id', (e) => { console.log(e); }, opt],
    ['dragholding', 'id', (e) => { console.log(e); }, opt],
    ['swipeholding', 'id', (e) => { console.log(e); }, opt]
]);
```
