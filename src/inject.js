'use strict';

var $ = require('jquery'),
    PageType = require('./constants/PageType'),
    ScriptInjection = require('./utils/script-injection'),
    AppConstants = require('./constants/AppConstants'),
    PostOperate = require('./PostOperate');

var location = window.location.href,
    currentPage = null,
    postId = 0;

$.get(location, function(html){
    var res = html.match(/最近一次更新：(.+)<br/);
    console.log(res ? res[1] : '');
});

if( /rent.591.com.tw\/rent-detail/.test(location)){
    currentPage = PageType.RENT_DETAIL;
}else if(/rent.591.com.tw\/map-index.html/.test(location)){
    currentPage = PageType.MAP_INDEX;

    ScriptInjection.injectRemoteScript('https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js');
    ScriptInjection.injectLocalScript('injected-script.bundle.js');
    ScriptInjection.injectLocalScript('markershow-refined.js');
    ScriptInjection.injectLocalScript('map_opt-refined.js');

    // Event listener
    document.addEventListener('EVENT_FROM_INJECTION', function(evt) {
        var detail = evt.detail,
            type = detail.type,
            payload = detail.payload;

        switch(type){
            case 'MARKER_UPDATE':
                onMarkerUpdated();
                break;
        }

    });
}

// on jquery ready
$(function(){
    switch(currentPage){
        case PageType.RENT_DETAIL:
            rerenderPostToolbar();

            // 自動標記已讀
            if( AppConstants.POST_AUTO_CHECK ){
                var postId = $('#hid_post_id').val();
                PostOperate.checkPost(postId);
            }

            break;
        case PageType.MAP_INDEX:
            break;
    }
});

function onMarkerUpdated(){
    $('.bubble').each(function(i, elem){
        rerenderMarker(elem);

        var postId = elem.getAttribute('postId');

        PostOperate.hasChecked(postId)
        .then(function(checked){
            if(checked){
                $(elem).addClass('checked');
                // var path = chrome.extension.getURL('images/checked.png');
                // $(elem).css('background-image', 'url({{path}})'.replace('{{path}}', path)); 
            }
        });

        PostOperate.hasCollected(postId)
        .then(function(collected){
            if(collected){
                $(elem).addClass('collected');
                // var path = chrome.extension.getURL('images/collected.png');
                // $(elem).css('background-image', 'url({{path}})'.replace('{{path}}', path)); 
            }
        });
    });
}

function rerenderPostToolbar(){
    var postId = $('#hid_post_id').val();
    var innerDOM = '';
    innerDOM += '<span class="592-status">目前狀態：未讀</span>';
    innerDOM += '<br>';
    innerDOM += '<a href="#" class="592-action-check">標記為已讀</a>';
    innerDOM += '<a href="#" class="592-action-collect">加入收藏</a>';
    $('#tools .inner').html(innerDOM);

    $('.592-action-check').click(function(){
        PostOperate.checkPost(postId);
    });
    $('.592-action-collect').click(function(){
        PostOperate.collectPost(postId);
    });

    PostOperate.hasChecked(postId)
    .then(function(checked){
        if(checked){
            $('.592-status').text('目前狀態：已讀');
            $('body').css('border', '10px solid green');
        }
    });
}

function rerenderMarker(marker){
    var $marker = $(marker);

    // $marker.css('font-size', '10px');
    // $marker.css('color', 'black');
    // $marker.css('background-repeat', 'no-repeat');
    // $marker.removeClass('marker').addClass('bubble');
}