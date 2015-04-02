console.log('markershow-refined.js injected');

var MarkerTypes = {
    
};

function MarkerShow(map, latLng, ware) {
    this.setMap(map);
    this.map_ = map;
    this.latLng_ = latLng;
    this.div_ = null;
    this.ware_ = ware;
    if (8 == ware['type']) {
        this.html_ = '<div class="marker_left" id="prop_num_' + ware['c_id'] + '">' + ware[0] + '<span>' + ware[7] + '</span></div>';
    } else if (7 == ware['type']) {
        this.html_ = '<div class="marker_left" id="prop_num_' + ware['c_id'] + '"><a href=' + ware[7] + ' target="_blank">' + ware[0] + '</a></div>';
    } else {
        this.html_ = '<div id="prop_num_' + ware['c_id'] + '"><strong>' + ware[1] + '</strong>&nbsp;間</div>';
    }
}
MarkerShow.prototype = new google.maps.OverlayView();
MarkerShow.prototype.onAdd = function() {
    var div = document.createElement('div');
    div.className = 'marker';
    if (8 == this.ware_['type'] && 15 <= this.map_.getZoom()) {
        div.className = 'marker marker_expand';
    }

    // Style here
    div.style.position = 'absolute';
    div.style.display = 'block';
    // div.style.border = '4px solid red';

    div.innerHTML = this.html_;
    div.id = this.ware_['c_id'];
    var div_obj = $jq(div);
    div_obj.attr('propNum', this.ware_[1]);
    div_obj.attr('postId', this.ware_[5]);
    div_obj.attr('casesId', this.ware_[6]);
    div_obj.attr('name', this.ware_[0]);
    div_obj.attr('fullname', this.ware_[4]);
    $jq(div).bind('mouseover', function(event) {
        $jq(this).attr("className", "marker marker_hover");
        var cases_obj = $jq("#map2_commname_default_" + $jq(this).attr('id'));
        if (cases_obj) {
            cases_obj.css("display", 'block');
            cases_obj.attr("className", "map2_commname_default map2_commname_hover");
        }
        $jq("#show_id").val($jq(this).attr('id'));
        var obj = $jq(this);
        $jq(this).bind('click', function() {
            var className = obj.attr("className");
            if (className) {
                if (className.indexOf("marker_hover") && obj.attr('id') == $jq("#show_id").val()) {
                    var div_ = document.getElementById(obj.attr('id'));
                    var x = parseFloat(div_.style.left);
                    var y = parseFloat(div_.style.top) + 40;
                    Map_Opt.showPropWind(obj.attr('id'), obj.attr('name'), obj.attr('fullname'), obj.attr('postId'), obj.attr('casesId'), x, y);
                    $jq("#show_id").val(0);
                }
            }
        });
    });
    $jq(div).bind("mouseout", function(event) {
        $jq(this).attr("className", "marker");
        var cases_obj = $jq("#map2_commname_default_" + $jq(this).attr('id'));
        if (cases_obj) {
            cases_obj.css("display", 'none');
            cases_obj.attr("className", "map2_commname_default");
        }
        $jq("#show_id").val(0);
    });
    this.div_ = div;
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div_);
};
MarkerShow.prototype.draw = function() {
    var overlayProjection = this.getProjection();
    var latLng = overlayProjection.fromLatLngToDivPixel(this.latLng_);
    var div = this.div_;
    var size = new google.maps.Size(-5, -35);
    size.width = size.height = 0;
    div.style.left = (latLng.x + size.width) + 'px';
    div.style.top = (latLng.y + size.height) + 'px';
    if (0 != this.ware_[6]) {
        var div_obj = $jq(div);
        var display = '';
        if (16 > this.map_.getZoom()) {
            display = 'display:none;';
        }
        div_obj.after('<div class="map2_commname_default" id="map2_commname_default_' + this.ware_['c_id'] + '" style="position:absolute; display:block; left:' + (latLng.x + size.width + 45) + 'px; top:' + (latLng.y + size.height - 2) + 'px; ' + display + '">' + this.ware_[4] + '</div>');
        var cases_obj = $jq("#map2_commname_default_" + this.ware_['c_id']);
        cases_obj.bind('mouseover', function(event) {
            $jq(this).prev().mouseover();
        });
        cases_obj.bind('mouseout', function(event) {
            $jq(this).prev().mouseout();
        });
    }
};
MarkerShow.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};