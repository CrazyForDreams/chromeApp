"use strict";

var page = {
    sendMessage: function (a) {
        chrome.runtime.sendMessage(a)
    },
    getInfo: function () {
        var info     = {},
            n        = 0,
            status   = $("[name='check-id']"),
            lists    = $(".curleveal a"),
            budgets  = $(".btn-plan-budget"),
            href     = $(lists[0]).attr("href");
        info.plans = [];
        $("script").each(function (i,o) {
            var str = $(o).html().match(/var uid.*'/);
            if (str) {
                info.uid = str[0].split("'")[1];
            }
        });
        for(var i = lists.length; i-- ;){
            if (lists[i].innerText.slice(0,1) !== "p") {
                continue;
            }
            if (!n) {
                info.token       = href.split("&")[1].split("=")[1];
                info.expireTimes = href.split("&")[2].split("=")[1];
            }
            info.plans[n++] = {
                status: status.eq(i).attr("data-status"),
                pid:    status.eq(i).attr("value"),
                budget: + budgets[i].innerText,
                name:   lists[i].innerText
            }
        }
        page.sendMessage({info: info});
    },
    init: function () {
        if(~document.URL.indexOf("http://dianjing.360.cn/adplan/list") || ~document.URL.indexOf("http://dianjing.e.360.cn/adplan/list")){
            page.getInfo()
        }
    }
};
page.init();
chrome.runtime.onMessage.addListener(function (e, b, a) {
    switch (e.msg) {
        case "changeTheOffer":
            page.init()
            break;
    }
});
