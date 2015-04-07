var _ = require('lodash'),
    RSVP = require('rsvp'),
    LocalStorage = require('./utils/localstorage'),
    AppConstants = require('./constants/AppConstants');

var key = AppConstants.LOCALSTORAGE_KEY;

var PostOperate = {
    hasChecked: function(postId){
        return new RSVP.Promise(function(resolve, reject){
            LocalStorage.Long.get(key)
            .then(function(ls){
                resolve(_.has(ls.postChecked, postId));
            })
            .catch(function(){
                console.warn('localStorage is empty, writing default template..');
                LocalStorage.Long.set(key, AppConstants.localStorageDefaultObject);
                resolve(false);
            });
        });
    },
    hasCollected: function(postId){
        return new RSVP.Promise(function(resolve, reject){
            LocalStorage.Long.get(key)
            .then(function(ls){
                resolve(_.has(ls.postCollected, postId));
            })
            .catch(function(){
                console.warn('localStorage is empty, writing default template..');
                LocalStorage.Long.set(key, AppConstants.localStorageDefaultObject);
                resolve(false);
            });
        });
    },
    checkPost: function(postId){
        var data = null;

        LocalStorage.Long.get(key)
        .then(function(ls){
            data = ls;
        })
        .catch(function(){
            console.warn('localStorage is empty, writing default template..');
            LocalStorage.Long.set(key, AppConstants.localStorageDefaultObject);
        })
        .finally(function(){
            // declare a new post object to insert to postChecked
            var newPost = {};
            newPost[postId] = {};
            data.postChecked = _.assign(data.postChecked, newPost );

            // set into localStorage
            LocalStorage.Long.set(key, data)
            .then(function(){
                console.log('Post #%s checked.', postId);
            })
            .catch(function(err){
                console.warn('localStorage error');
            });
        });
    },
    uncheckPost: function(postId){
        var data = null;

        LocalStorage.Long.get(key)
        .then(function(ls){
            data = ls;
        })
        .catch(function(){
            console.warn('localStorage is empty, writing default template..');
            LocalStorage.Long.set(key, AppConstants.localStorageDefaultObject);
        })
        .finally(function(){
            if( data.postChecked[postId] ){
                delete data.postChecked[postId];
            }
            // set into localStorage
            LocalStorage.Long.set(key, data)
            .then(function(){
                console.log('Post #%s un-checked.', postId);
            })
            .catch(function(err){
                console.warn('localStorage error');
            });
        });  
    },
    collectPost: function(postId){
        var data = null;

        LocalStorage.Long.get(key)
        .then(function(ls){
            data = ls;
        })
        .catch(function(){
            console.warn('localStorage is empty, writing default template..');
            LocalStorage.Long.set(key, AppConstants.localStorageDefaultObject);
        })
        .finally(function(){
            // declare a new post object to insert to postCollected
            var newPost = {};
            newPost[postId] = {};
            data.postCollected = _.assign(data.postCollected, newPost );

            // set into localStorage
            LocalStorage.Long.set(key, data)
            .then(function(){
                console.log('Post #%s collected.', postId);
            })
            .catch(function(err){
                console.warn('localStorage error');
            });
        });
    },
    uncollectPost: function(postId){
        var data = null;

        LocalStorage.Long.get(key)
        .then(function(ls){
            data = ls;
        })
        .catch(function(){
            console.warn('localStorage is empty, writing default template..');
            LocalStorage.Long.set(key, AppConstants.localStorageDefaultObject);
        })
        .finally(function(){
            if( data.postCollected[postId] ){
                delete data.postCollected[postId];
            }
            // set into localStorage
            LocalStorage.Long.set(key, data)
            .then(function(){
                console.log('Post #%s un-collected.', postId);
            })
            .catch(function(err){
                console.warn('localStorage error');
            });
        });
    }
};

module.exports = PostOperate;