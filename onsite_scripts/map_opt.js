var Map_Opt = {
    init: function(trace_type, city_info, filter) {
        this.DEF_TRACETYPE = trace_type;
        this.DEF_CITY_INFO = city_info;
        this.markers = [];
        this.overlays = [];
        this.subwayOverlays = [];
        this.mapTrackers = new hash();
        this.geocoder = null;
        this.bounds = new Array();
        this.bounds['slatFrom'] = this.DEF_CITY_INFO['swlat'];
        this.bounds['slatTo'] = this.DEF_CITY_INFO['nelat'];
        this.bounds['slngFrom'] = this.DEF_CITY_INFO['swlng'];
        this.bounds['slngTo'] = this.DEF_CITY_INFO['nelng'];
        this.filter = filter;
        this.search_type = '';
    },
    drawMap: function() {
        var self = this;
        self.map = new google.maps.Map(document.getElementById('map_canvas'), {
            zoom: self.DEF_CITY_INFO.zoom,
            center: new google.maps.LatLng(self.DEF_CITY_INFO.lat, self.DEF_CITY_INFO.lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false
        });
        google.maps.event.addListener(self.map, 'zoom_changed', function() {});
        google.maps.event.addListener(self.map, 'dragstart', function() {
            self.search_type = 'drag';
        });
        google.maps.event.addListener(self.map, 'dragend', function() {
            self.setData();
        });
        google.maps.event.addListener(self.map, 'bounds_changed', function() {
            self.setBounds();
            if ('drag' == self.search_type) {
                return;
            }
            self.setData();
        });
        $jq(document).bind("map:geo", function(event, E) {
            self.searchKeyword(E.keyword);
        });
        $jq(document).bind("map:center", function(event, E) {
            self.search_type = 'area';
            self.map.setZoom(E.zoom);
            self.map.setCenter(new google.maps.LatLng(E.lat, E.lng));
            self.filter.customid = '';
        });
        $jq(document).bind("custom:tracker", function(event, E) {
            self.filter.customtype = E.customtype;
            self.filter.customid = E.pid;
            if (E.lat && E.lng && E.zoom) {
                self.map.setZoom(E.zoom);
                self.map.setCenter(new google.maps.LatLng(E.lat, E.lng));
            }
        });
        $jq(document).bind("map:filter", function(event, E) {
            if ('area' == self.search_type) {
                return;
            }
            var key = String(E.key);
            self.filter[key] = E.val;
            self.setData();
        });
        $jq(document).bind("custom:house", function(event, E) {
            self.searchHouse();
        });
        $jq("div.map2_propwind_close").bind("click", function() {
            self.hidePropWind();
        });
        this.propWindOrder = $jq("div.sort_buttons:first").children("a.sort_button");
        this.propWindOrder.each(function(event, E) {
            $jq(E).bind("click", function(event, G) {
                self.propWindOrder.each(function(event, H) {
                    $jq(H).attr("className", "sort_button");
                });
                switch ($jq(E).attr("rel")) {
                    case "11":
                        if (self.propOrder == 11) {
                            $jq(E).attr("className", "sort_button sort_button_up");
                            self.propOrder = 12
                        } else {
                            $jq(E).attr("className", "sort_button sort_button_down");
                            self.propOrder = 11
                        }
                        var F = 4;
                        break;
                    case "21":
                        if (self.propOrder == 21) {
                            $jq(E).attr("className", "sort_button sort_button_up");
                            self.propOrder = 22
                        } else {
                            $jq(E).attr("className", "sort_button sort_button_down");
                            self.propOrder = 21
                        }
                        var F = 5;
                        break;
                }
                self.updatePropWind();
            });
        });
        $jq("a.map2_notice_noresult_close").click(function() {
            $jq("div.map2_notice_noresult").css("display", 'none');
            if ($jq("#no_notice_noresult").attr("checked")) {
                document.cookie = "no_notice_noresult" + self.DEF_TRACETYPE + "=" + $jq("#no_notice_noresult").attr("checked");
                $jq("#no_notice_noresult").attr("checked", false);
            }
        });
        if (self.DEF_CITY_INFO.is_init) {
            self.DEF_CITY_INFO.is_init = '';
            var params = window.location.hash;
            if (params) {
                var lat_ = lng_ = zoom_ = '';
                params = params.substr(1).split('&');
                var str = '';
                $jq.each(params, function(i, data) {
                    str = data.split('=');
                    switch (str[0]) {
                        case 'l22':
                            lat_ = str[1];
                            break;
                        case 'l23':
                            lng_ = str[1];
                            break;
                        case 'l31':
                            zoom_ = parseInt(str[1]);
                            break;
                        default:
                            break;
                    }
                });
                if (lat_ && lng_ && zoom_) {
                    self.map.setZoom(zoom_);
                    self.map.setCenter(new google.maps.LatLng(lat_, lng_));
                }
            }
        }
    },
    searchKeyword: function(keyword) {
        var self = this;
        keyword = '台灣' + keyword;
        if (!self.geocoder) {
            self.geocoder = new google.maps.Geocoder();
        }
        self.geocoder.geocode({
            'address': keyword
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.clearMarkers();
                self.map.setZoom(14);
                self.map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    position: results[0].geometry.location,
                    title: results[0].formatted_address,
                    map: self.map
                });
                var infowindow = new google.maps.InfoWindow({
                    content: keyword
                });
                infowindow.open(self.map, marker);
                self.markers.push(marker);
            } else {
                $jq("#map2_notice_noresult").css("display", "block");
                $jq("#map2_notice_noresult .l1").html('地址無法找到：' + keyword);
            }
        });
    },
    customTrackers: function() {
        var self = this;
        var customType = self.filter.customtype;
        var customId = self.filter.customid;
        if (!customId) {
            return;
        }
        var url = 'map-subway.html?pid=' + customId;
        $jq.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            timeout: 50000,
            cache: false,
            error: function(XMLHttpRequest, status, thrownError) {},
            success: function(json) {
                var data = json.points;
                if (data) {
                    for (i in data) {
                        latLng = new google.maps.LatLng(data[i]['lat'], data[i]['lng']);
                        var overlay = new SubwayShow(self.map, latLng, data[i]);
                        self.subwayOverlays.push(overlay);
                    }
                }
            }
        })
    },
    searchHouse: function() {
        var self = this;
        var type = self.DEF_TRACETYPE;
        var post_id = $jq("#post_id").attr("value");
        var url = 'map-searchHouse.html?post_id=' + post_id;
        $jq.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            timeout: 50000,
            cache: false,
            error: function(XMLHttpRequest, status, thrownError) {},
            success: function(json) {
                self.clearMarkers();
                var latLng, val;
                $jq.each(json, function(key, val) {
                    latLng = new google.maps.LatLng(val.lat, val.lng);
                    self.map.setCenter(latLng);
                    self.map.setZoom(18);
                    var marker = new google.maps.Marker({
                        map: self.map,
                        position: latLng,
                        zindex: 3
                    });
                    self.markers.push(marker);
                })
                if (!latLng) {
                    alert("您搜尋的房屋不存在或已經關閉，請確認您的房屋編號是否輸入正確。");
                }
            }
        })
    },
    setData: function() {
        var self = this;
        self.clearData();
        self.customTrackers();
        var url = self.getUrl(0);
        if (!url) {
            return;
        }
        $jq.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            timeout: 50000,
            cache: false,
            error: function(XMLHttpRequest, status, thrownError) {},
            success: function(json) {
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
    },
    addWare: function(data) {
        var self = this;
        for (i in data) {
            latLng = new google.maps.LatLng(data[i][2], data[i][3]);
            data[i]['c_id'] = i;
            data[i]['type'] = self.DEF_TRACETYPE;
            var overlay = new MarkerShow(self.map, latLng, data[i]);
            self.overlays.push(overlay);
            delete data[i];
            self.auto_add_ware = window.setTimeout(function() {
                Map_Opt.addWare(data);
            }, 60);
            return;
        }
    },
    clearData: function() {
        var self = this;
        clearTimeout(self.auto_add_ware);
        for (i in self.overlays) {
            self.overlays[i].setMap(null);
        }
        self.overlays.length = 0;
        for (i in self.subwayOverlays) {
            self.subwayOverlays[i].setMap(null);
        }
        self.subwayOverlays.length = 0;
        $jq.each($jq(".map2_commname_default"), function(i, cases) {
            $jq(this).remove();
        });
        self.hidePropWind();
        $jq("#map2_notice_nothing").css('display', 'none');
    },
    clearMarkers: function() {
        var self = this;
        for (i in self.markers) {
            self.markers[i].setMap(null);
        }
        self.markers.length = 0;
    },
    setBounds: function() {
        var self = this;
        var bounds = self.map.getBounds();
        if (bounds) {
            var northEast = bounds.getNorthEast();
            var southWest = bounds.getSouthWest();
            self.bounds['slatFrom'] = southWest.lat();
            self.bounds['slatTo'] = northEast.lat();
            self.bounds['slngFrom'] = southWest.lng();
            self.bounds['slngTo'] = northEast.lng();
        }
    },
    getUrl: function(req_type) {
        var self = this;
        var G = self.map.getCenter();
        var Z = self.map.getZoom();
        var params = {
            l11: self.DEF_TRACETYPE,
            l12: 0,
            l21: Z,
            l22: G.lat(),
            l23: G.lng(),
            l31: Z,
            l32: G.lat(),
            l33: G.lng(),
            l41: self.bounds.slatFrom,
            l42: self.bounds.slatTo,
            l43: self.bounds.slngFrom,
            l44: self.bounds.slngTo,
            p11: self.propCommId,
            p12: self.propPage,
            p13: self.propOrder,
            f0: self.filter.kind,
            f1: self.filter.price,
            f2: self.filter.room,
            f3: self.filter.area,
            f4: self.filter.shape,
            f5: self.filter.houseclass,
            f6: self.filter.buildtype
        };
        var params = $jq.param(params);
        if (0 == req_type) {
            if (params == $jq("#req_url").val()) {
                return false;
            }
        }
        $jq("#req_url").val(params)
        window.location.hash = params;
        var action = req_type == 0 ? 'search' : 'list';
        var url = "/map-" + action + ".html?" + params;
        return url;
    },
    showPropWind: function(collectId, collectName, collectFullName, postId, casesId, x, y) {
        var self = this;
        $jq("#correcting_collect_id").attr("value", collectId);
        $jq("h2.map2_propwind_listlink:first").html(collectFullName + "<span>(<a href='#' onclick='correctingSH();return false;'>建案/社區位置錯誤？</a>)</span>");
        $jq("div.sort_buttons:first").children("a.sort_button").each(function(event, H) {
            $jq(H).attr("className", "sort_button");
        });
        this.propCommId = collectId;
        this.propPage = 0;
        this.propOrder = 0;
        if (8 == self.DEF_TRACETYPE) {
            self.show_x = x;
            self.show_y = y;
        }
        this.updatePropWind();
    },
    updatePropWind: function() {
        var self = this;
        if (8 == self.DEF_TRACETYPE) {
            self.buildPostion();
            $jq(".map2_propwind_content").html('');
            $jq("div.map2_propwind").show();
            $jq("div.map2_proparrow").show();
            $jq(".map2_loupanwind_load").show();
        } else {
            $jq("#props_result").html('<div class="map2_propwind_load"><img alt="loading..." src="./images/index/map/load_18x18.gif"></div>');
        }
        var url = this.getUrl(1);
        $jq.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            timeout: 50000,
            cache: false,
            error: function(XMLHttpRequest, status, thrownError) {},
            success: function(result) {
                if (8 == self.DEF_TRACETYPE) {
                    var temphtml = self.buildDetail(result);
                    $jq(".map2_loupanwind_load").hide();
                    $jq(".map2_propwind_content").html(temphtml);
                } else {
                    $jq("div.map2_propwind").show();
                    result.content.subContent = result.content.subContent.replace('style=\"float:left;width:71%\"', '');
                    $jq("#props_result")[0].innerHTML = result.content.subContent;
                    $jq("#totalRows").html(result.content.totalRows);
                    $jq("div#GlobalPagebar").children("a").bind("click", function(event) {
                        self.propPage = $jq(this).attr('firstrow');
                        self.updatePropWind();
                    });
                }
            }
        });
    },
    hidePropWind: function() {
        $jq("div.map2_propwind").css("display", "none");
        $jq("div.map2_detailwind").css("display", "none");
        if ($jq("div.map2_proparrow")) {
            $jq("div.map2_proparrow").hide();
        }
        this.propOrder = 0;
    },
    buildPostion: function() {
        var self = this;
        var x = self.show_x;
        var y = self.show_y;
        var panel_left, panel_top;
        if (x < 356) {
            panel_left = Number(x) + 6;
            $jq(".map2_proparrow").removeClass("map2_proparrow_left");
            $jq(".map2_proparrow").addClass("map2_proparrow_right");
            $jq(".map2_proparrow").css({
                "left": Number(x) - 1 + "px",
                "top": Number(y) + 86 + "px"
            });
        } else {
            panel_left = Number(x) - 362;
            $jq(".map2_proparrow").removeClass("map2_proparrow_right");
            $jq(".map2_proparrow").addClass("map2_proparrow_left");
            $jq(".map2_proparrow").css({
                "left": Number(x) - 7 + "px",
                "top": Number(y) + 86 + "px"
            });
        }
        if ($jq(window).height() - 98 - Number(y) + 57 < 256) {
            panel_top = $jq(window).height() - 256;
        } else {
            panel_top = Number(y) + 57;
        }
        $jq("div.map2_propwind").css({
            "top": panel_top + $jq(window).scrollTop() + "px",
            "left": panel_left + "px"
        });
    },
    buildDetail: function(result) {
        var temphtml = "",
            t1 = "",
            re = "",
            t2 = "";
        if (result.error != 1) {
            t1 = result.content.one_price;
            re = /&lt;/g;
            t1 = t1.replace(re, "<");
            re = /&gt;/g;
            t1 = t1.replace(re, ">");
            var _room = "";
            if (result.content.room.length > 1) {
                _room = '<li>格局：' + result.content.room + '</li>';
            }
            if (result.content.build_type_class == "n") {
                t2 = '<em class="n">新成屋</em>';
            } else if (result.content.build_type_class == "p") {
                t2 = '<em class="p">預售屋</em>';
            } else {
                t2 = '<em class="i">建構中</em>';
            }
            temphtml = '<div class="propwind_title"><a href="/housing-detail-' + result.content.hid + '.html" target="_blank">' + result.content.build_name + '</a>' + t2 + '</div><div class="propwind_attr"><ul><li class="price"><span>單價：</span>' + t1 + '</li><li>坪數：' + result.content.house_area + '</li>' + _room + '<li>公設比：' + result.content.ratio + '</li><li>屬性：' + result.content.shape + '</li></ul></div><div class="propwind_img"> <a class="img" target="_blank" href="/housing-detail-' + result.content.hid + '.html"><img width="132" height="99" src="' + result.content.cover + '"></a>  <div style="display: block;" class="photoNum"> <a target="_blank" href="/housing-detail-' + result.content.hid + '.html" target="_blank">' + result.content.photo_num + '張照片</a></div></div><div class="propwind_desc">個案概況：' + result.content.housing_pro_str + '</div><div class="propwind_more"><a href="/housing-detail-' + result.content.hid + '.html" target="_blank">查看更多詳細資料&gt;&gt;</a><a class="position-error" onclick="correctingSH();" href="javascript:;">個案位置錯誤？</a></div>';
        } else {
            temphtml = "加載超時:" + result.message + "!";
        }
        return temphtml;
    }
};