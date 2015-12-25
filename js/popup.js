"use strict";

var bg = chrome.extension.getBackgroundPage();

function init() {
    var l = $("login");
    var m = $("menu");
    var u = $("user-name");
    var p = $("user-password");
    var s = $("btn-submit");
    var r = $("reload-page");
    var t = $("reload-text");
    var o = $("change-offer");
    var c = $("change-text");
    (function () {
        if(bg.app.isLogin()){
            m.classList.add("on")
        }else{
            bg.app.init();
            l.classList.add("on")
        }
    })();
    (function a() {
        var h = document.getElementsByTagName("a");
        for (var j = 0; h[j]; j++) {
            h[j].addEventListener("click", function () {
                if (this.href && !~this.href.indexOf("chrome-extension")) {
                    window.open(this.href)
                }
                return false
            })
        }
    })();
    (function v() {
        if (localStorage.btnReload === "stopReload") {
            t.innerText = "停止刷新";
        }else{
            t.innerText = "刷新页面";
        }
    })();
    (function o() {
        if (parseInt(localStorage.changeTheOffer)) {
            c.innerText = "停止修改报价";
        } else {
            c.innerText = "修改报价";
        }
    })();
    l.addEventListener("submit", function (e) {
        e.preventDefault();
        //bg.app.getAccessToken(u.value,p.value);
        setTimeout(function () {
            window.close()
        }, 100)
    });
    r.addEventListener("click", function (e) {
        if (localStorage.btnReload === "stopReload") {
            bg.app.stopReload("停止刷新","取消刷新并停止发送cookies");
        }else{
            bg.app.getCookie();
        }
        setTimeout(function () {
            window.close()
        }, 100)
    });
    o.addEventListener("click", function (e) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (h) {
            chrome.tabs.get(h[0].id,function(e){
                if(~e.url.indexOf("http://dianjing.360.cn/adplan/list") || ~e.url.indexOf("http://dianjing.e.360.cn/adplan/list")){
                    if (parseInt(localStorage.changeTheOffer)) {
                        localStorage.changeTheOffer = 0;
                        bg.app.stopChangeTheOffer("停止修改报价","停止修改报价并取消刷新");
                    } else {
                        localStorage.changeTheOffer = 1;
                        chrome.tabs.sendMessage(h[0].id, {msg: "changeTheOffer"})
                    }
                } else {
                    bg.app.notifications("停止修改报价","当前页面不是360点睛实效平台页面");
                }
            });
        });
        setTimeout(function () {
            window.close()
        }, 100)
    });
}
document.addEventListener("DOMContentLoaded", init);
    
