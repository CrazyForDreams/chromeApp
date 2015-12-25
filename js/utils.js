"use strict";

var n = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
var Utils = {
    trim: function (a) {
        return null == a ? "" : (a + "").replace(n, "")
    }
}
function $(a) {
    return document.getElementById(a)
}
function $$(a) {
    return document.querySelectorAll(a)
}