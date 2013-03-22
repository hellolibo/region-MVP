define(function (require, exports, module) {

    var $ = require("http://modules.spmjs.org/gallery/jquery/1.8.3/jquery");
    var Events = require("http://modules.spmjs.org/arale/events/1.0.0/events");

    var Model = require("./region-model");
    var View = require("./region-view");

    require("./skin_CSS3.css");

    var Region = function (options) {
        var self = this;
        // 混入事件方法
        Events.mixTo(self);

        // 省市区的选中的项
        self.selectedIds = [0, 0, 0];

        self.opts = $.extend(Region.defaults, options || {});

        // 初始化视图
        self.view = new View({
            container: self.opts.target,
            inputName: self.opts.inputName,
            inputId: self.opts.inputId
        });

        // 初始化模型
        self.model = new Model({
            api: self.opts.api
        });

        self.view.on("showSelect", self.onShowSelect, self);
        self.view.on("selected", self.onSelected, self);

    };

    // 初始化联动列表
    Region.prototype.init = function (selectedInitArr) {
        var self = this;

        // 初始化视图
        self.view.init();

        // 如果省市区有初始值，则覆盖默认值
        if (selectedInitArr) {
            self.selectedIds = selectedInitArr;
        }

        // 获取省数据
        self.model.fetch(0, function (data) {
            self.onDataLoaded(0, self.selectedIds[0], data);
        });

        // 循环初始化市和区
        for (var i = 1; i < self.selectedIds.length; i++) {

            var selectedId = self.selectedIds[i];
            var parentId = self.selectedIds[i - 1];

            // 如果parentId是0，则要重置它及下级列表，否则要根据parentId获取数据
            if (!parentId) {
                self.view.reset(i);
            } else {
                // 使用一个闭包把typeId保存住
                (function(type, selectedId){
                    self.model.fetch(parentId, function (data) {
                        self.onDataLoaded(type, selectedId, data);
                    });
                })(i, selectedId);
            }
        }

    };

    // 对显示列表时的处理
    Region.prototype.onShowSelect = function (type) {
        var self = this;
        var selectedId = self.selectedIds[type];
        var parentId = (type !== 0 ? self.selectedIds[type - 1] : 0);

        if (type !== 0 && parentId === 0) {
            // 除省外，parentId没有确定需要显示提示
            self.view.needParentId(type);
        } else if (selectedId === 0) {
            // 如果selectedId不为0，表示有选中结果，显示即可，如果是0则要重新加载数据
            self.view.loading(type);
            self.model.fetch(parentId, function(data){
                self.onDataLoaded(type, selectedId, data);
            });
        }
    };

    // 当用户选择了一个地址
    Region.prototype.onSelected = function (evtData) {
        var self = this;
        var type = evtData.type;
        var id = evtData.id;

        self.selectedIds[type] = id;

        // 当前选择区域向下的都恢复初始
        for (var i = type + 1; i < 3; i++) {
            self.selectedIds[i] = 0;
            self.view.reset(i);
        }

        // 广播事件
        self.trigger("selected", evtData);
    };

    // 当数据加载完了
    Region.prototype.onDataLoaded = function (who, selectedId, originalList) {
        var self = this;
        var list = [];
        var selectedObj;

        // 整理拿到的数据，以便符合自己的要求
        for (var i = 0, l = originalList.length; i < l; i++) {

            var isSelected = originalList[i].regionId === selectedId;

            var item = {
                name: originalList[i].regionName,
                id: originalList[i].regionId,
                who: who,
                postCode: originalList[i].postCode,
                selected: isSelected
            };

            if (isSelected) {
                selectedObj = item;
            }

            list.push(item);
        }

        self.view.render(who, list, selectedObj);

        // 如果有选中的项
        if(selectedObj){
            self.onSelected(selectedObj);
        }

    };


    Region.defaults = {
        api: "http://api.mbaobao.com/findRegion.html",
        target: ".region",
        inputName: ["provinceId", "cityId", "districtId"],
        inputId: ["provinceId", "cityId", "districtId"]
    };

    module.exports = Region;
});