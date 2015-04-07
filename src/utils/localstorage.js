'use strict';

var RSVP = require('rsvp');

var LocalStorage = {
    /**
     * Test if localStorage is supported or not
     * @param  {Function} callback [description]
     * @return {Boolean}           [description]
     */
    isSupported: function( success, fail ){
        if(typeof(Storage) !== "undefined") {
            success();
        } else {
            fail( { msg: 'Sorry! No Web Storage support..' } );
        }
    },
    Short: {
        set: function(_key, _value){
            return new RSVP.Promise(function(resolve, reject){
                LocalStorage.isSupported(function(){
                    // LocalStorage only support string format, so we need stringify before store.
                    var stringifiedObject = JSON.stringify(_value);
                    sessionStorage.setItem(_key, stringifiedObject);
                    resolve( { key: _key, value: _value } );
                }, function(err){
                    reject(err);
                });
            });
        },
        get: function(_key){
            return new RSVP.Promise(function(resolve, reject){
                LocalStorage.isSupported(function(){
                    var res = sessionStorage.getItem(_key);
                    var parsedResult = JSON.parse(res);
                    if( !parsedResult ) { reject( _key + ' is empty!' ); }
                    resolve(parsedResult);
                }, function(err){
                    reject(err);
                });
            });
        }
    },
    Long: {
        set: function(_key, _value){
            return new RSVP.Promise(function(resolve, reject){
                LocalStorage.isSupported(function(){
                    // LocalStorage only support string format, so we need stringify before store.
                    var stringifiedObject = JSON.stringify(_value);
                    localStorage.setItem(_key, stringifiedObject);
                    resolve( { key: _key, value: _value } );
                }, function(err){
                    reject(err);
                });
            });
        },
        get: function(_key){
            return new RSVP.Promise(function(resolve, reject){
                LocalStorage.isSupported(function(){
                    var res = localStorage.getItem(_key);
                    var parsedResult = JSON.parse(res);
                    if( !parsedResult ) { reject( _key + ' is empty!' ); }
                    resolve(parsedResult);
                }, function(err){
                    reject(err);
                });
            });
        }
    }
};

module.exports = LocalStorage;