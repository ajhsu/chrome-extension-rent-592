window.onload = function(){
    // Overwrite the set data method
    Map_Opt.setData = function() {
        var self = Map_Opt;
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
                // console.log(json);
                // Sending markers to chrome extension
                dispatchMarker(json);
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
    document.dispatchEvent(new CustomEvent('RW759_connectExtension', {
        detail: {
            type: 'MARKER_UPDATE',
            payload: payload
        }
    }));
};