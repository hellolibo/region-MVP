define(function (require, exports, module) {

    var $ = require("http://modules.spmjs.org/gallery/jquery/1.8.3/jquery");

    // 用于缓存所有已经拿到的地区数据
    var cache = {};

    var Model = function (options) {
            var self = this;

            self.api = "";

            if (options && options.api) {
                self.api = options.api;
            } else {
                throw new Error("need region api path.");
            }
        };

    /**
     * 根据父id调取其下的地区信息
     * @param  {string} parentID 地址父ID
     */
    Model.prototype.fetch = function (parentID, callback) {
        var self = this;
        
        if (isNaN(parseInt(parentID, 10)) || parseInt(parentID, 10) < 0) {
            throw new Error("parentID is invalid.");
        }

        if (cache[parentID + ""]) {
            return callback && callback(cache[parentID]);
        }

        $.ajax({
            type: "GET",
            url: self.api,
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: {
                "parentId": parentID
            },
            success: function (data) {
                if (data && data.result) {
                    cache[parentID + ""] = data.result;
                    return callback && callback(data.result);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                throw new Error("region data load fail! [parentID:" + parentID + "," + textStatus + "]");
            }
        });
    };

    module.exports = Model;

});