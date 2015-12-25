"use strict";

var bg = chrome.extension.getBackgroundPage();

(function($){
    $(function(){
        var cachePlan = null;
        (function () {
            var a = localStorage.accessToken;
            var e = bg.app.isExpires(localStorage.expired);
            if (a && e) {
                var t = Math.round(((localStorage.expired * 1000) - new Date().getTime()) / 3600000);
                var e = $("#authorization");
                var f = a + " 剩余 " + t + " 小时过期";
                e.find(".line").append(f).append("<span></span>").find("span").addClass("removeAuth").attr("title","移除授权").html("移除授权").on("click", function () {
                    e.html("").hide();
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("expired")
                });
                e.show();
            }
        })();
        (function () {
            var a = localStorage.totalNumberOfTimes;
            if(!a) a = localStorage.totalNumberOfTimes = -1;
            var e = $("#totalNumberOfTimes");
            e.val(a).on("change", function () {
                var v = + this.value;
                
                if(v < 100 && v !== -1){
                    bg.app.notifications("修改失败","总次数不能小于100次");
                    this.value = localStorage.totalNumberOfTimes = 100;
                    return false
                }
                localStorage.totalNumberOfTimes = v
                bg.app.notifications("修改成功","总次数为：" + ((v === -1) ? "无限" : v) + "次");
            })
        })();
        (function () {
            var a = localStorage.intervalLength;
            if(!a) a = localStorage.intervalLength = 300;
            var e = $("#intervalLength");
            e.val(a).on("change", function () {
                if(+ this.value < 3){
                    bg.app.notifications("修改失败","间隔时间不能小于3秒");
                    this.value = localStorage.intervalLength = 3;
                    return false
                }
                localStorage.intervalLength = this.value
                bg.app.notifications("修改成功","间隔时间为：" + this.value + "秒");
            })
        })();
        (function () {
            var a = localStorage.offerIntervalLength;
            if(!a) a = localStorage.offerIntervalLength = 50;
            var e = $("#offerIntervalLength");
            e.val(a).on("change", function () {
                if(+ this.value < 5){
                    bg.app.notifications("修改失败","修改报价间隔时间不能小于5秒");
                    this.value = localStorage.offerIntervalLength = 5;
                    return false
                }
                localStorage.offerIntervalLength = this.value
                bg.app.notifications("修改成功","修改报价间隔时间为：" + this.value + "秒");
            })
        })();
        (function () {
            var a = localStorage.offerFluctuation;
            if(!a) a = localStorage.offerFluctuation = 1;
            var e = $("#offerFluctuation");
            e.val(a).on("change", function () {
                if(+ this.value < 0){
                    bg.app.notifications("修改失败","修改报价浮动不能小于0元");
                    this.value = localStorage.offerFluctuation = 0;
                    return false
                }
                localStorage.offerFluctuation = this.value
                bg.app.notifications("修改成功","修改报价浮动为：" + this.value + "元");
            })
        })();
        function showPlan (o) {
            var h = '';
            o = o || {};
            
            h += '<dl>' +
                '<dt><i data-name="">' + o.name + '</i></dt>';
            if (o.days === "1") {
                h += '<dd><span>计划天数：<i>' + o.days + '</i>天</span><span>计划时间：<i>' + o.month + '</i> 月<i>' + o.date + '</i> 日<i>' + o.hour + '</i> 时<i>' + o.minute + '</i> 分</span><span>运行或停止：<i>' + (+ o.runStop ? '运行' : '停止') + '</i></span></dd>';
            } else {
                h += '<dd><span>计划天数：<i>' + o.days + '</i>天</span><span>计划时间：<i>' + o.hour + '</i> 时<i>' + o.minute + '</i> 分</span><span>运行或停止：<i>' + (+ o.runStop ? '运行' : '停止') + '</i></span></dd>';
            }
            if(+ o.runStop) {
                h += '<dd><span>价格浮动：<i>' + o.offerFluctuation + '</i> 元</span><span>修改间隔：<i>' + o.offerIntervalLength + '</i> 秒</span><span>是否全部修改：<i>' + (+ o.oneMore ? '是' : '否') + '</i></span></dd>';
                if(+ o.oneMore) {
                    h += '<dd><span>价格：<i>' + o.offer + '</i> 元</span><span>计划时间前 <i>' + o.pauseBefore + '</i> 秒停止改价</span><span>计划时间后 <i>' + o.pauseAfter + '</i> 秒开始改价</span></dd>';
                }
            } else {
                h += '<dd><span>暂停/删除推广计划：<i>' + (o.stopOption == 1 ? '无操作' : o.stopOption == 0 ? '暂停' : '删除') + '</i></dd>';
            }
            h += '<dd><button class="btn-edit" data-name="' + o.name + '">修改</button><button class="btn-del" data-name="' + o.name + '">删除</button></dd>'
            h += '</dl>';
            return h;
        }
        function editPlan (o) {
            var date = new Date(),
                h = '';
            o = o || {};
            
            h += '<dl>' +
              '<dt><input type="text" id="planName" placeholder="请填写计划名称" value="' + (o.name ? o.name : '') + '"></dt>'+
              '<dd>'+
                  '<div class="l1">'+
                      '<label for="days">计划天数：<input type="text" value="' + (o.days ? o.days : '1') + '" id="days"> 天</label>';
            if (o.days && o.days === '1' || !o.days) {
                 h += '<label for="date-month" id="date">　 　计划时间：<input type="text" id="date-month" value="' + (o.month ? o.month : date.getMonth() + 1) + '"> 月 <input type="text" id="date-date" value="' + (o.date ? o.date : date.getDate()) + '"> 日 <input type="text" id="date-hour" value="' + (o.hour ? o.hour : date.getHours()) + '"> 时 <input type="text" id="date-minute" value="' + (o.minute ? o.minute : date.getMinutes()) + '"> 分</label>';
            } else {
                 h += '<label for="date-month" id="date">　 　计划时间：<input type="text" id="date-hour" value="' + (o.hour ? o.hour : date.getHours()) + '"> 时 <input type="text" id="date-minute" value="' + (o.minute ? o.minute : date.getMinutes()) + '"> 分</label>';
            }
                 h += '<span>　 　运行或停止：<input type="radio" name="run-stop" id="run" value="1" ' + (o.runStop ? + o.runStop ? 'checked' : '' : 'checked') + '><label for="run">运行</label> <input type="radio" name="run-stop" id="stop" value="0" ' + (o.runStop ? + o.runStop ? '' : 'checked' : '') + '><label for="stop">停止</label></span>'+
                      '<div class="l2" ' + (o.runStop ? + o.runStop ? '' : 'style="display:none"' : '') + '>'+
                          '<label for="offer-fluctuation">价格浮动：<input type="text" id="offer-fluctuation" value="' + (o.offerFluctuation ? o.offerFluctuation : localStorage.offerFluctuation) + '"> 元</label>'+
                          '<label for="offer-interval-length">　 　修改间隔：<input type="text" id="offer-interval-length" value="' + (o.offerIntervalLength ? o.offerIntervalLength : localStorage.offerIntervalLength) + '"> 秒</label>'+
                          '<span>　 　是否全部修改：<input type="radio" name="one-more" id="more" value="1" ' + (o.oneMore ? + o.oneMore ? 'checked' : '' : '') + '><label for="more">是</label> <input type="radio" name="one-more" id="one" value="0" ' + (o.oneMore ? + o.oneMore ? '' : 'checked' : 'checked') + '><label for="one">否</label></span>'+
                          '<div class="l3" ' + (o.oneMore ? + o.oneMore ? '' : 'style="display:none"' : 'style="display:none"') + '>'+
                              '<label for="offer">价格：<input type="text" id="offer" value="' + (o.offer ? o.offer : localStorage.defaultOffer) + '"> 元</label>'+
                              '<label for="pause-before">　 　计划时间前 <input type="text" value="' + (o.pauseBefore ? o.pauseBefore : '0') + '" id="pause-before"> 秒停止改价</label>'+
                              '<label for="pause-after">　 　计划时间后 <input type="text" id="pause-after" value="' + (o.pauseAfter ? o.pauseAfter : localStorage.offerIntervalLength) + '"> 秒开始改价</label>'+
                          '</div>'+
                      '</div>'+
                      '<div class="l2-2" ' + (o.runStop ? + o.runStop ? 'style="display:none"' : '' : 'style="display:none"') + '>'+
                          '<span>暂停/删除推广计划：<input type="radio" name="stopOption" id="stop-none" value="1" ' + (o.stopOption ? o.stopOption == 1 ? 'checked' : '' : 'checked') + '><label for="stop-none">无操作</label> <input type="radio" name="stopOption" id="stop-pause" value="0" ' + (o.stopOption ? o.stopOption == 0 ? 'checked' : '' : '') + '><label for="stop-pause">暂停</label> <input type="radio" name="stopOption" id="stop-delete" value="-1" ' + (o.stopOption ? o.stopOption == -1 ? 'checked' : '' : '') + '><label for="stop-delete">删除</label></span>'+
                      '</div>'+
                  '</div>'+
              '</dd>'+
            '</dl>';
            return h;
        }
        function savePlan (o) {
            var timingPlan = (localStorage.timingPlan && JSON.parse(localStorage.timingPlan)) || [],
                l = timingPlan.length;
            o = o || {};
            
            if (cachePlan) {
                delPlan(0,cachePlan);
                cachePlan = null;
            }
            $("#btn-addPlan").attr("data-set","add").html("添加计划");
            $("#editPlanWrap").html("");
            $("#showPlanWrap").append(showPlan(o));
            timingPlan[l] = {};
            timingPlan[l].name = o.name;
            timingPlan[l].days = o.days;
            if (o.days === "1") {
                timingPlan[l].month = o.month;
                timingPlan[l].date = o.date;
                timingPlan[l].hour = o.hour;
                timingPlan[l].minute = o.minute;
            } else {
                timingPlan[l].hour = o.hour;
                timingPlan[l].minute = o.minute;
            }
            if (+ o.runStop) {
                timingPlan[l].runStop = o.runStop;
                timingPlan[l].offerFluctuation = o.offerFluctuation;
                timingPlan[l].offerIntervalLength = o.offerIntervalLength;
                if (+ o.oneMore) {
                    timingPlan[l].oneMore = o.oneMore;
                    timingPlan[l].offer = o.offer;
                    timingPlan[l].pauseBefore = o.pauseBefore;
                    timingPlan[l].pauseAfter = o.pauseAfter;
                }
            } else {
                timingPlan[l].runStop = o.runStop;
                timingPlan[l].stopOption = o.stopOption;
            }
            if (timingPlan.length > 1) {
                $("#btn-delAll").show()
            }
            localStorage.timingPlan = JSON.stringify(timingPlan);
            bg.app.timeController();
        }
        function delPlan (e,o,t) {
            if (~e) {
                t ? (bg.app.deltimingPlan($(o).attr("data-name")),$(o).closest("dl").remove()) : bg.app.deltimingPlan($(o).attr("data-name"),1);
                if (JSON.parse(localStorage.timingPlan).length < 2) {
                    $("#btn-delAll").hide()
                }
            } else {
                bg.app.deltimingPlan();
                $("#showPlanWrap").html("");
                $(o).hide();
            }
        }
        function splitPlan (o) {
            var timingPlan = (localStorage.timingPlan && JSON.parse(localStorage.timingPlan)) || [];
            
            if (timingPlan.length) {
                for (var i = 0; i < timingPlan.length; i++) {
                    if ($(o).attr("data-name") == timingPlan[i].name) {
                        $("#editPlanWrap").append(editPlan(timingPlan[i]));
                    }
                }
            }
            $("#btn-addPlan").attr("data-set","save").html("保存计划");
            cachePlan = o;
            $(o).closest("dl").remove();
        }
        function validationPlan () {
            var date = new Date(),
                o = {};
            
            function valTime () {
                if($("#days").val() === "1"){
                    return ($("#date-month").val() && $("#date-date").val() && $("#date-hour").val() && $("#date-minute").val()) && ($("#date-month").val() > date.getMonth() + 1 || ($("#date-month").val() >= date.getMonth() + 1 && $("#date-date").val() > date.getDate()) || ($("#date-month").val() >= date.getMonth() + 1 && $("#date-date").val() >= date.getDate() && $("#date-hour").val() > date.getHours()) || ($("#date-month").val() >= date.getMonth() + 1 && $("#date-date").val() >= date.getDate() && $("#date-hour").val() >= date.getHours() && $("#date-minute").val() > date.getMinutes()))
                } else {
                    return ($("#date-hour").val() && $("#date-minute").val()) && ($("#date-hour").val() > date.getHours() || ($("#date-hour").val() >= date.getHours() && $("#date-minute").val() > date.getMinutes()))
                }
            }
            function valTime () {
                var timingPlan = (localStorage.timingPlan && JSON.parse(localStorage.timingPlan)) || [];
                if (cachePlan && $("#planName").val() == $(cachePlan).attr("data-name")) {
                    return true;
                }
                if (timingPlan.length) {
                    for (var i = 0; i < timingPlan.length; i++) {
                        if ($("#planName").val() == timingPlan[i].name) {
                            return false;
                        }
                    }
                }
                return true;
            }
            valTime() ?
                (o.name = $("#planName").val()) && ($("#days").val() && $("#days").val() > -1) ?
                    (o.days = $("#days").val()) && valTime() ?
                        (o.month = $("#date-month").val() , o.date = $("#date-date").val() , o.hour = $("#date-hour").val() , o.minute = $("#date-minute").val()) && $("#run")[0].hasAttribute("checked") ?
                            (o.runStop = $("#run").val()) && ($("#offer-fluctuation").val() && $("#offer-fluctuation").val() > 0) ?
                                (o.offerFluctuation = $("#offer-fluctuation").val()) && ($("#offer-interval-length").val() && $("#offer-interval-length").val() > 0) ?
                                    (o.offerIntervalLength = $("#offer-interval-length").val()) && $("#more")[0].hasAttribute("checked") ?
                                        (o.oneMore = $("#more").val()) && ($("#offer").val() && $("#offer").val() >= 30) ?
                                            (o.offer = $("#offer").val()) && ($("#pause-before").val() && $("#pause-before").val() > -1) ?
                                                (o.pauseBefore =  $("#pause-before").val()) && ($("#pause-after").val() && $("#pause-after").val() > -1) ?
                                                    (o.pauseAfter =  $("#pause-after").val() , savePlan(o)) :
                                                    (alert("计划时间后开始改价应不小于0秒"), $("#pause-after").val(1).focus()) :
                                                (alert("计划时间前停止改价应不小于0秒"), $("#pause-before").val(0).focus()) :
                                            (alert("价格应不小于30元"), $("#offer").val(30).focus()) :
                                        savePlan(o) :
                                    (alert("间隔时间应大于0秒"), $("#offer-interval-length").val(1).focus()) :
                                (alert("价格浮动应大于0元"), $("#offer-fluctuation").val(1).focus()) :
                            (o.runStop = "0", o.stopOption = $("[name='stopOption']:checked").val(), savePlan(o)) :
                        (alert("计划时间应超过当前时间至少1分钟"), $("#date-minute").focus()):
                    (alert("计划运行天数不应小于0，0代表每天"), $("#days").val(1).focus()) :
                (alert("请输入计划名称,并确保与其他的计划名称不相同"), $("#planName").focus());
        }
        (function timingPlan() {
            var btn = $("#btn-addPlan");
            var editPlanWrap = $("#editPlanWrap");
            var showPlanWrap = $("#showPlanWrap");
            var timingPlan = (localStorage.timingPlan && JSON.parse(localStorage.timingPlan)) || [];
            if (timingPlan.length) {
                for (var i = 0; i < timingPlan.length; i++) {
                    var o = timingPlan[i];
                    showPlanWrap.append(showPlan(o))
                }
                if (timingPlan.length > 1) {
                    $("#btn-delAll").show()
                }
            }
            btn.on("click", function () {
                if ($(this).attr("data-set") === "add") {
                    editPlanWrap.append(editPlan());
                    $(this).attr("data-set","save").html("保存计划");
                    $("#planName").focus();
                } else if (this.getAttribute("data-set") === "save") {
                    validationPlan();
                }
            });
            $(document).on("click","input[name=run-stop],input[name=one-more],input[name=stopOption]",function () {
                switch(this.id){
                    case "run":
                        editPlanWrap.find(".l2").show().next().hide();
                        break;
                    case "stop":
                        editPlanWrap.find(".l2").hide().next().show();
                        break;
                    case "more":
                        editPlanWrap.find(".l3").show();
                        break;
                    case "one":
                        editPlanWrap.find(".l3").hide();
                        break;
                    default:
                        break
                }
                $(this).attr("checked",true).parent().find("input").not(this).removeAttr("checked");
            }).on("change","#days",function () {
                var d = new Date();
                if(this.value === "1") {
                    $("#date").html('　 　计划时间：<input type="text" id="date-month" value="' + (d.getMonth() + 1) + '"> 月 <input type="text" id="date-date" value="' + d.getDate() + '"> 日 <input type="text" id="date-hour" value="' + d.getHours() + '"> 时 <input type="text" id="date-minute" value="' + d.getMinutes() + '"> 分');
                } else {
                    $("#date").html('　 　计划时间：<input type="text" id="date-hour" value="' + d.getHours() + '"> 时 <input type="text" id="date-minute" value="' + d.getMinutes() + '"> 分');
                }
            }).on("click","#btn-delAll",function () {
                delPlan(-1,this);
            }).on("click",".btn-del",function () {
                delPlan(0,this,1);
            }).on("click",".btn-edit",function () {
                splitPlan(this)
            });
        })();
    });
})(jQuery);


