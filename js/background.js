"use strict";

var timer  = null;
var oTimer = null;
var gTimer = null;
var off = !0;
var oInfo = {};
var _n = "timingPlan-";

var app = {
    isLogin: function () {
        return true//!!localStorage.accessToken && app.isExpires(localStorage.expired)
    },
    isExpires: function (n) {
        var m = n * 1000;
        if (m) {
            return new Date().getTime() <= m
        }
        return true//false
    },
    getAccessToken: function (n,p) {
        ajax({
            method: "POST",
            url: "http://boss.ibeixiao.com/login",
            parameters: {
                login: n,
                password: p,
                f: "json"
            },
            success: function (data) {
                var data = JSON.parse(data);
                switch(data.code){
                    case 200:
                        app.notifications(data.msg,"请点击工具栏按钮，选择相应功能");
                        localStorage.accessToken = data.data.token;
                        localStorage.expired = data.data.expired;
                        break;
                    case 500:
                        app.notifications(data.msg,"请核对账号密码")
                        break;
                    default:
                        break
                }
            }
        })
    },
    notifications: function (t,m) {
        chrome.notifications.create('', {
            type    : 'basic',
            iconUrl : '/images/logo_128.png',
            title   : t,
            message : m
        })
    },
    getCookie: function () {
        var e = localStorage.expired;
        var m = "";
        var u = "";
        var t = +localStorage.totalNumberOfTimes;
        localStorage.btnReload = "stopReload";
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (i) {
            chrome.tabs.onRemoved.addListener(function (e){
                if(e !== i[0].id){
                    return false;
                }
                app.stopReload("发送失败","关闭页面停止发送\n重新发送，请重新点击按钮")
            })
            u = i[0].url.split("/")[2];
            (function ref() {
                m = "domain=" + u + "&data=";
                chrome.cookies.getAll({url:"http://" + u},function(c){
                    for (var j in c) {
                        m += Utils.trim(c[j].name) + "=" + Utils.trim(c[j].value) + "%3B";
                    }
                    if(app.isExpires(e) && (t == -1 || t > 0)){
                        chrome.tabs.reload(i[0].id);
                        app.postCookie(m);
                        (t !== -1) && (t -= 1);
                        timer = setTimeout(ref,localStorage.intervalLength * 1000);
                    }else{
                        app.stopReload("发送失败","授权过期，请重新登录")
                    }
                })
            })();
        })
    },
    stopReload: function (t,m) {
        app.init();
        clearTimeout(timer);
        timer = null;
        app.notifications(t,m)
    },
    postCookie: function (m) {
        var k = localStorage.accessToken;
        ajax({
            method: "POST",
            url: "http://boss.ibeixiao.com/cookies",
            headers: {
                Authorization: k,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: m,
            success: function (s) {
                console.log(s)
            }
        })
    },
    getUrl: function (status) {
        return "http://" + oInfo.tabUrl+ "/adplan/" + (!status ? (+localStorage.modifyAllOffers ? "changebudget" : "AjaxUpdate") : "upallstatus");
    },
    getPid: function () {
        var o = {};
        if (+localStorage.modifyAllOffers) {
            for (var i = 0; i < oInfo.info.plans.length; i++) {
                o[oInfo.info.plans[i].pid] = oInfo.info.plans[i].status;
            }
            return encodeURIComponent(JSON.stringify(o));
        }
        o[oInfo.info.plans[+localStorage.offerPlacing].pid] = oInfo.info.plans[+localStorage.offerPlacing].status;
        return encodeURIComponent(JSON.stringify(o));
    },
    getBudget: function () {
        if (+localStorage.modifyAllOffers) {
            return localStorage.defaultOffer;
        }
        return oInfo.info.plans[+localStorage.offerPlacing].budget + (+localStorage.offerFluctuation);
    },
    getParameters: function (status) {
        //http://dianjing.360.cn/adplan/AjaxUpdate?
        //user_id=2535792679&
        // plan_id=28808535&
        // aj_type=exp_amt&
        // json=1&
        // is_emt=0&
        // exp_amt=32
        var o = {},
            p = app.getBudget();
        if (+localStorage.modifyAllOffers) {
            o.oper_id      = app.getPid();
            o.token        = oInfo.info.token;
            o.expire_times = oInfo.info.expireTimes;
            o.json = 1;
            return (status ? (o.oper_type = status) : (o.price = p,o.unlimit = "off")), o;
        }
        return (o.user_id = oInfo.info.uid, o.plan_id = oInfo.info.plans[+localStorage.offerPlacing].pid, o.aj_type = "exp_amt", o.json = 1, o.is_emt = 0, o.exp_amt = p), o;
    },
    getRequestHeader: function () {
        return +localStorage.modifyAllOffers ? {} : {token:oInfo.info.token,expireTimes:oInfo.info.expireTimes};
    },
    getOffer: function (status) {
        var u = app.getUrl(status),
            p = app.getParameters(status),
            h = app.getRequestHeader(),
            n = oInfo.info.plans[+localStorage.offerPlacing].name;
            localStorage.offerPlacing = +localStorage.offerPlacing === oInfo.info.plans.length - 1 ? 0 : +localStorage.offerPlacing + 1;
        ajax({
            url: u,
            parameters: p,
            headers: h,
            success: function (data) {
                var data = JSON.parse(data);
                if (data.status) {
                    switch (+ status) {
                        case 0:
                            app.notifications("计划执行","计划执行成功，已将全部推广计划暂停\n" + data.msg);
                            localStorage.modifyAllOffers = 0;
                            break;
                        case -1:
                            app.notifications("计划执行","计划执行成功，已将全部推广计划删除\n" + data.msg);
                            localStorage.modifyAllOffers = 0;
                            break;
                        default : 
                            if (+localStorage.modifyAllOffers) {
                                app.notifications("调价成功","当前调价计划为：全部;\n价格为：" + (p.price || p.exp_amt) + "\n" + data.msg);
                                localStorage.modifyAllOffers = 0;
                                localStorage.offerPlacing = 0;
                            } else {
                                app.notifications("调价成功","当前调价计划为：" + n + ";\n价格为：" + (p.price || p.exp_amt) + "\n" + data.msg);
                            }
                            break;
                    }
                    chrome.tabs.reload(oInfo.tabId);
                } else {
                    switch (+ status) {
                        case 0:
                            app.notifications("计划执行","计划执行失败，未能将全部推广计划暂停\n" + data.msg);
                            break;
                        case -1:
                            app.notifications("计划执行","计划执行成功，未能将全部推广计划删除\n" + data.msg);
                            break;
                        default : 
                            if (+localStorage.modifyAllOffers) {
                                app.notifications("调价失败","当前调价计划为：全部;\n价格为：" + (p.price  || p.exp_amt) + "\n间隔时间后重全部新调价\n" + data.msg);
                            } else {
                                app.notifications("调价失败","当前调价计划为：" + n + ";\n价格为：" + ((+p.price || +p.exp_amt) - (+localStorage.offerFluctuation)) + "\n" + data.msg + "\n将跳过此计划，执行下一个计划")
                            }
                            break;
                    }
                }
            }
        })
    },
    changeTheOffer: function (status) {
        if (status && status != 1) {
            localStorage.modifyAllOffers = 1;
            app.getOffer(status);
            return ;
        }
        (function or () {
            app.getOffer();
            if (+localStorage.pauseAfter) {
                app.notifications("计划执行","计划执行成功,修改全部报价,等待" + localStorage.pauseAfter + "秒后继续执行");
                oTimer = setTimeout(or,localStorage.pauseAfter * 1000);
                localStorage.pauseAfter = 0;
                return ;
            } else {
                oTimer = setTimeout(or,localStorage.offerIntervalLength * 1000);
            }
        })();
    },
    stopChangeTheOffer: function (t,m) {
        clearTimeout(oTimer);
        oTimer = null;
        off = !0;
        localStorage.changeTheOffer = 0;
        localStorage.offerPlacing = 0;
        app.notifications(t,m)
    },
    timingPlan: function (o) {
        if (window[_n + o.name]) return !0;
        var n = new Date(), t;
        if (o.days == 1 && o.month && o.date) {
            if (o.month == n.getMonth() + 1) {
                t = (+o.date - n.getDate()) * 86400000;
                if (t) {
                    t += ((+o.hour - n.getHours()) * 3600000) + ((+o.minute - n.getMinutes()) * 60000);
                } else if (t < 0) {
                    app.notifications(o.name + "计划过期","当前时间超过计划时间(" + o.month + "-" + o.date + "-" + o.hour + "-" + o.minute + ")，计划已过期");
                    return !1;
                } else {
                    t = (+o.hour - n.getHours()) * 3600000;
                    if (t) {
                        t += (+o.minute - n.getMinutes()) * 60000;
                    } else if (t < 0) {
                        app.notifications(o.name + "计划过期","当前时间超过计划时间(" + o.month + "-" + o.date + "-" + o.hour + "-" + o.minute + ")，计划已过期");
                        return !1;
                    } else {
                        t = ((+o.minute - n.getMinutes()) * 60000) - (n.getSeconds() * 1000);
                        if (t < 1000) {
                            app.notifications(o.name + "计划过期","当前时间超过计划时间(" + o.month + "-" + o.date + "-" + o.hour + "-" + o.minute + ")，计划已过期");
                            return !1;
                        }
                    }
                }
            } else if (o.month < n.getMonth() + 1) {
                app.notifications(o.name + "计划过期","当前时间超过计划时间(" + o.month + "-" + o.date + "-" + o.hour + "-" + o.minute + ")，计划已过期");
                return !1;
            }
        } else {
            t = (+o.hour - n.getHours()) * 3600000;
            if (t) {
                t += (+o.minute - n.getMinutes()) * 60000;
            } else if (t < 0) {
                app.notifications(o.name + "计划过期","当前时间超过计划时间(" + o.hour + "-" + o.minute + ")，计划今日已过期，于明日计划时间执行");
                t = ((+o.hour - n.getHours() + 24) * 3600000) + ((+o.minute - n.getMinutes()) * 60000);
            } else {
                t = ((+o.minute - n.getMinutes()) * 60000) - (n.getSeconds() * 1000);
                if (t < 1000) {
                    app.notifications(o.name + "计划过期","当前时间超过计划时间(" + o.hour + "-" + o.minute + ")，计划今日已过期，于明日计划时间执行");
                    t = 86400000 + ((+o.minute - n.getMinutes()) * 60000);
                }
            }
        }
        function implementationPlan () {
            localStorage.offerIntervalLength = o.offerIntervalLength || localStorage.offerIntervalLength;
            localStorage.offerFluctuation = o.offerFluctuation || localStorage.offerFluctuation;
            localStorage.modifyAllOffers = o.oneMore || localStorage.modifyAllOffers;
            localStorage.defaultOffer = o.offer || localStorage.defaultOffer;
            localStorage.pauseAfter = o.pauseAfter || localStorage.pauseAfter;
            localStorage.changeTheOffer = 1;
            off = !1;
            app.changeTheOffer();
            app.notifications(o.name + "计划执行","计划执行成功");
            if (o.days == 1) {
                app.deltimingPlan(o.name);
            } else {
                app.notifications("计划执行",o.name + "计划今日已执行，于明日此时再次执行");
                app.deltimingPlan(o.name,1);
                if (o.days > 1) {
                    var t = JSON.parse(localStorage.timingPlan);
                    o.days = +o.days - 1;
                    t[t.length] = o;
                    localStorage.timingPlan = JSON.stringify(t);
                }
                app.timingPlan(o);
            }
        }
        if (!+(o.runStop || 0)) {
            window[_n + o.name] = setTimeout(function(){
                app.stopChangeTheOffer(o.name + "计划执行","计划执行成功,停止改价");
                app.changeTheOffer(o.stopOption)
                app.deltimingPlan(o.name);
                delete window[_n + o.name];
            },t);
            return (window[_n + o.name]);
        }
        if (+(o.oneMore || 0)) {
            window[_n + o.name] = setTimeout(function(){
                app.stopChangeTheOffer(o.name + "计划执行","计划执行成功,停止改价,等待" + o.pauseBefore + "秒后重置默认报价");
                window[_n + o.name] = setTimeout(implementationPlan,o.pauseBefore * 1000);
            },t - (o.pauseBefore * 1000));
        } else {
            window[_n + o.name] = setTimeout(implementationPlan,t);
        }
        return (window[_n + o.name]);
    },
    deltimingPlan: function (n,d) {
        var o = JSON.parse(localStorage.timingPlan);
        if (n) {
            clearTimeout(window[_n + n]);
            delete window[_n + n];
            for (var i = 0; i < o.length; i++) {
                if (o[i].name === n) {
                    o.splice(i,1);
                    localStorage.timingPlan = JSON.stringify(o);
                    d || app.notifications("计划删除",n + "计划已成功删除");
                }
            }
        } else {
            for (var i = 0; i < o.length; i++) {
                clearTimeout(window[_n + o[i].name]);
                delete window[_n + o[i].name];
            }
            delete localStorage.timingPlan;
            app.notifications("计划删除","全部计划已成功删除");
        }
    },
    timeController: function () {
        var o = (localStorage.timingPlan && JSON.parse(localStorage.timingPlan)) || [];
        for (var i = 0; i < o.length; i++) {
            if (window[o[i].name]) {
                console.error(o[i].name + "变量已存在");
                continue;
            }
            if (!app.timingPlan(o[i])) {
                app.deltimingPlan(o[i].name);
            }
        }
    },
    init: function () {
        if(!app.isExpires(localStorage.expired)){
            localStorage.removeItem("accessToken")
            localStorage.removeItem("expired")
        }
        localStorage.totalNumberOfTimes = localStorage.totalNumberOfTimes || -1;
        localStorage.intervalLength = localStorage.intervalLength || 300;
        localStorage.btnReload = "initReload";
        if (off) {
            localStorage.changeTheOffer = 0;
            localStorage.offerIntervalLength = localStorage.offerIntervalLength || 50;
            localStorage.offerFluctuation = localStorage.offerFluctuation || 1;
            localStorage.modifyAllOffers = localStorage.modifyAllOffers || 0;
            localStorage.defaultOffer = localStorage.defaultOffer || 30;
            localStorage.pauseAfter = localStorage.pauseAfter || 0;
            localStorage.offerPlacing = 0;
        }
        var timingPlan = (localStorage.timingPlan && JSON.parse(localStorage.timingPlan)) || [];
        if (timingPlan.length) {
            app.timeController()
        }
    }
};

chrome.runtime.onMessage.addListener(function (e, b, a) {
    if (!oInfo.tabId) {
        app.notifications("--注意--","请等待360页面刷新完成，如期间切换到其他页面，请重新刷新360页面，并等待完成");
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (i) {
            var id = i[0].id;
            oInfo.tabId = id;
            chrome.tabs.get(id,function(e){
                oInfo.tabUrl = e.url.split("/")[2];
            });
            chrome.tabs.onRemoved.addListener(function (e){
                if(e !== id){
                    return false;
                }
                delete oInfo.tabId;
                delete oInfo.tabUrl;
            });
        });
    }
    oInfo.info = e.info;
    if (!+localStorage.changeTheOffer) return false;
    if (!oInfo.info.plans.length) {
        app.stopChangeTheOffer("调价失败","当前计划数量为0，请添加计划")
        return false;
    }
    if (off) {
        app.changeTheOffer();
        off = !1;
    }
});

(function(){
    app.init()
})();
