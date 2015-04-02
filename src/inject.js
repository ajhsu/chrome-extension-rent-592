var $ = require('jquery');

var injectScript = function(src){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(src);
    (document.head||document.documentElement).appendChild(s);
    s.onload = function() {
        s.parentNode.removeChild(s);
    };
};

console.log('592 injected');

injectScript('injected-script.js');
injectScript('markershow-refined.js');
// Event listener
document.addEventListener('RW759_connectExtension', function(evt) {
    console.log(evt.detail);
});

$(function(){
    var map = document.getElementById('map_canvas');
});