var ScriptInjection = {
    injectLocalScript: function(src){
        var s = document.createElement('script');
        s.src = chrome.extension.getURL(src);
        (document.head||document.documentElement).appendChild(s);
        s.onload = function() {
            s.parentNode.removeChild(s);
        };
    },
    injectRemoteScript: function(src){
        var s = document.createElement('script');
        s.src = src;
        (document.head||document.documentElement).appendChild(s);
        s.onload = function() {
            s.parentNode.removeChild(s);
        };
    }
};

module.exports = ScriptInjection;