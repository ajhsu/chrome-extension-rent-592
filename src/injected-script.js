var PostOperate = require('./PostOperate');
var InjectEvent = {
    // 當地圖標記顯示完畢時
    onWareAdded: function(data){
        dispatchMarker(data);
    },
    // 當物件視窗被打開時
    onPropWindowOpened: function(){
        $('.property_list li').each(function(i, elem) {
            var $elem = $(elem),
                href = $elem.find('a').attr('href'),
                res = href.match(/([0-9]+)/),
                postId = null;
            if(res){
                postId = res[0];
                var insertDOM = '<a class="592-action-check" postId="{{postId}}" href="#">標記為已讀</a> | <a class="592-action-collect" postId="{{postId}}" href="#">加入收藏</a>'.replace(/{{postId}}/g, postId);
                $elem.find('.proname .s .c').append(insertDOM);
                $('.592-action-check').click(function(event){
                    var postId = event.currentTarget.getAttribute('postId');
                    PostOperate.checkPost(postId);
                });
                $('.592-action-collect').click(function(event){
                    var postId = event.currentTarget.getAttribute('postId');
                    PostOperate.collectPost(postId);
                });
            }
        });
    }
}

window.onload = function(){
    // Overwrite methods
    Map_Opt.addWare = function (data){
        var self = Map_Opt;
        
        for (i in data) {
            var _data = data[i];
            // 如果被標記已增加，則跳過
            if(_data.added){ continue; }
            // 添加物件標記
            latLng = new google.maps.LatLng(_data[2], _data[3]);
            _data['c_id'] = i;
            _data['type'] = self.DEF_TRACETYPE;
            var overlay = new MarkerShow(self.map, latLng, _data);
            self.overlays.push(overlay);

            // 刪除已添加，遞歸
            // delete _data;
            // 使用標記取代刪除
            _data.added = true;

            // 查詢更新時間
            if( _data[5] || _data[5] !== '' ){
                var postId = _data[5];
                var postURL = 'http://rent.591.com.tw/rent-detail-{{postId}}.html'.replace(/{{postId}}/, postId);
                $.get(postURL, function(html){
                    var propId = _data?_data['c_id']:null;
                    if( !propId ) { return; }

                    var res = null,
                        lastUpdated,
                        rentFee,
                        propSize,
                        floorCount,
                        output = '';

                    output += 'prop_id: ';
                    output += propId;
                    output += ' / ';

                    // 更新時間
                    res = html.match(/最近一次更新：(.+)<br/);
                    lastUpdated = (res ? res[1] : '')
                    output += lastUpdated;
                    output += ' / ';

                    // 租金
                    res = html.match(/<em>(.+)<\/em>/);
                    rentFee = (res ? res[1] : '')
                    output += rentFee;
                    output += ' / ';

                    // 坪數
                    res = html.match(/([0-9]+)坪/);
                    propSize = (res ? res[1] : '')
                    output += propSize;
                    output += ' / ';

                    // 樓層
                    res = html.match(/>(\S+\/[0-9]+F)/);
                    floorCount = (res ? res[1] : '');
                    output += floorCount;
                    output += ' / ';

                    $('#prop_num_' + propId).text(rentFee);

                    console.log(output);
                });
            }

            self.auto_add_ware = window.setTimeout(function() {
                Map_Opt.addWare(data);
            }, 5);
            return;
        }

        InjectEvent.onWareAdded(data);
    };

    Map_Opt.setData = function() {
        var self = Map_Opt;
        self.clearData();
        self.customTrackers();
        var url = self.getUrl(0);
        if ( !url ) { return; }
        $jq.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            timeout: 50000,
            cache: false,
            error: function(XMLHttpRequest, status, thrownError) {},
            success: function(json) {
                // console.log(json);
                // Sending markers to chrome extension
                for (i in json) {
                    self.addWare(json);
                    self.search_type = '';
                    return true;
                }
                if (!$jq.cookie('no_notice_noresult' + self.DEF_TRACETYPE)) {
                    $jq("#map2_notice_nothing").css('display', 'block');
                }
            }
        });
    };
    /**
     * 顯示列表彈窗內容
     * @param int collectId 當前物件集合collectId
     * @param string collectName 當前物件集合名稱
     * @param string collectFullName 當前物件集合全名稱
     * @param int postId 集合物件ID
     * @param int casesId 集合建案件ID
     * @return empty empty
     * @access public
     */
    Map_Opt.showPropWind = function(collectId, collectName, collectFullName, postId, casesId, x, y) {
        
        //反饋信息
        $jq("#correcting_collect_id").attr("value", collectId);
        $jq("h2.map2_propwind_listlink:first").html(collectFullName + "<span>(<a href='#' onclick='correctingSH();return false;'>建案/社區位置錯誤？</a>)</span>");
        //
        $jq("div.sort_buttons:first").children("a.sort_button").each(function(event, H) {
            $jq(H).attr("className", "sort_button");
        });
        //彈窗
        Map_Opt.propCommId = collectId;
        Map_Opt.propPage = 0;
        Map_Opt.propOrder = 0;
        if (8 == Map_Opt.DEF_TRACETYPE) {
            Map_Opt.show_x = x;
            Map_Opt.show_y = y;
        }
        Map_Opt.updatePropWind();
    };

    /**
     * 更新列表彈窗內容
     * @param int propCommId 當前物件集合collectId
     * @param int propPage 頁碼數
     * @param int propOrder 排序
     * @return empty empty
     * @access public
     */
    Map_Opt.updatePropWind = function() {
        
        if (8 == Map_Opt.DEF_TRACETYPE) { // 建案
            Map_Opt.buildPostion();
            $jq(".map2_propwind_content").html('');
            $jq("div.map2_propwind").show();
            $jq("div.map2_proparrow").show();
            $jq(".map2_loupanwind_load").show();
        } else {
            $jq("#props_result").html('<div class="map2_propwind_load"><img alt="loading..." src="./images/index/map/load_18x18.gif"></div>');
        }
        //loading
        var url = Map_Opt.getUrl(1);
        $jq.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            timeout: 50000,
            cache: false,
            error: function(XMLHttpRequest, status, thrownError) {
                //alert('Error loading ' + url +', Please send it again!');
            },
            success: function(result) {
                if (8 == Map_Opt.DEF_TRACETYPE) { // 建案
                    var temphtml = Map_Opt.buildDetail(result);
                    $jq(".map2_loupanwind_load").hide();
                    $jq(".map2_propwind_content").html(temphtml);
                } else { // 租售店面
                    $jq("div.map2_propwind").show();
                    result.content.subContent = result.content.subContent.replace('style=\"float:left;width:71%\"', '');
                    $jq("#props_result")[0].innerHTML = result.content.subContent;
                    $jq("#totalRows").html(result.content.totalRows);
                    $jq("div#GlobalPagebar").children("a").bind("click", function(event) {
                        Map_Opt.propPage = $jq(Map_Opt).attr('firstrow');
                        Map_Opt.updatePropWind();
                    });
                }

                // When prop window popup
                InjectEvent.onPropWindowOpened();
            }
        });
    };
    // var markers = Map_Opt.overlays.map(function(marker){
    //     return {
    //         html: marker.html_,
    //         ware: marker.ware_
    //     }
    // });
    // console.log(markers);
    // // var wares = Map_Opt.overlays.map(function(elem){ return elem.ware_; };
};

function dispatchMarker(payload){
    document.dispatchEvent(new CustomEvent('EVENT_FROM_INJECTION', {
        detail: {
            type: 'MARKER_UPDATE',
            payload: payload
        }
    }));
};