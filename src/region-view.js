define(function (require, exports, module) {

    var $ = require("http://modules.spmjs.org/gallery/jquery/1.8.3/jquery");
    var Events = require("http://modules.spmjs.org/arale/events/1.0.0/events");

    var View = function (options) {

        var self = this;
        Events.mixTo(self);

        self.types = [0, 1, 2];
        self.first = ['请选择省份...', '请选择城市...', '请选择县区...'];

        self.opt = options;
    };

    View.prototype.init = function () {
        var self = this;

        self.dom = $(document.createElement("div")).addClass("rg-selects");

        var html = "";

        for (var i = 0; i < self.types.length; i++) {
            html = html + '<div style="z-index:' + (3 - i) + '" class="rg-item rg-' + self.types[i] + '" data-type="' + self.types[i] + '"><div class="rg-current"><div class="rg-cur-title" data-first="' + self.first[i] + '">' + self.first[i] + '</div><div class="rg-ico"><i class="rg-arrow"></i></div></div><input type="hidden" value="" class="rg-value" name="' + self.opt.inputName[i] + '" id="' + self.opt.inputId[i] + '"/><div class="rg-list" style="z-index:' + (4 - i) + '"></div></div>';
        }

        self.dom.append(html);

        self.dom.on("mouseenter", ".rg-item", function () {
            self.trigger("showSelect", $(this).data("type"));
            $(this).addClass("rg-over");
            return false;
        }).on("mouseleave", ".rg-item", function () {
            $(this).removeClass("rg-over");
            return false;
        });

        self.dom.on("click", ".rg-list a", function () {
            var type = $(this).data("type");
            var id = $(this).data("id");
            var name = $(this).data("name");
            var postCode = $(this).data("code");

            $(this).parent().find("a").removeClass("rg-item-select");
            $(this).addClass("rg-item-select");

            $(".rg-" + type, self.dom).find(".rg-cur-title").html(name);
            $(".rg-" + type, self.dom).find(".rg-value").val(id);
            $(".rg-" + type, self.dom).removeClass("rg-over");

            self.trigger("selected", {
                type: type,
                id: id,
                name: name,
                postCode: postCode
            });

            return false;
        });

        $(self.opt.container).append(self.dom);
    };

    View.prototype.reset = function (type) {
        var self = this;

        for (var i = type; i < 3; i++) {
            var title = $(".rg-" + i, self.dom).find(".rg-cur-title");

            title.html(title.data("first"));

            $(".rg-" + i, self.dom).find(".rg-list").html("");
            $(".rg-" + i, self.dom).find(".rg-value").val("");
        }
    };

    View.prototype.render = function (type, list, selectedObj) {
        var self = this;
        var html = "";

        if (selectedObj && selectedObj.name !== "") {
            $(".rg-" + type, self.dom).find(".rg-cur-title").html(selectedObj.name);
            $(".rg-" + type, self.dom).find(".rg-value").val(selectedObj.id);
        }

        for (var i = 0, l = list.length; i < l; i++) {
            html = html + '<a href="#" ' + (list[i].selected ? 'class="rg-item-select"' : '') + 'data-type="' + type + '"" data-id="' + list[i].id + '" data-code="' + list[i].postCode + '" data-name="' + list[i].name + '" title="' + list[i].name + '">' + self.format(list[i].name) + '</a>';
        }

        $(".rg-" + type, self.dom).find(".rg-list").html(html);
    };

    View.prototype.loading = function (type) {
        $(".rg-" + type, this.dom).find(".rg-list").html("<span class='rg-tip'>正在加载...</span>");
    };

    View.prototype.needParentId = function (type) {
        $(".rg-" + type, this.dom).find(".rg-list").html("<span class='rg-tip'>请选择上一级</span>");
    };

    View.prototype.format = function (name) {
        if (name.length > 8) {
            name = name.substr(0, 6) + "...";
        }
        return name;
    };

    module.exports = View;

});