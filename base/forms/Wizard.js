//封装timeout，及时clear
if (!window.setTimeout.__impl) {
    var func = function (to) {
        return function (code, timeout) {
            if (typeof (code) != 'function') code = eval("(function () {" + code + "; })");
            var func = function () {
                window.clearTimeout(arguments.callee.id);
                delete arguments.callee.id;
                code();
            }
            return func.id = to(func, timeout);
        }
    } (window.setTimeout);
    window.setTimeout = func;
    window.setTimeout.__impl = func;
}
//解析url
function parseUrl(url) {
    var result = {};
    result.Parameters = {};
    var split = url.split("://");
    var left;
    if (split.length > 1 && split[0].length) {
        result.Protocol = split[0];
        left = url.substr(split[0].length + 3, url.length - split[0].length - 3);
    }
    else {
        result.Protocol = "http";
        left = url;
    }
    split = left.split("?");
    result.Path = "";
    for (var i = 0; i < split.length - 1; i++) {
        if (i == split.length - 2) {
            result.Path += split[i];
        }
        else {
            result.Path += split[i] + "?";
        }
    }
    var params = split[split.length - 1].split("&");
    for (var i = 0; i < params.length; i++) {
        var nv = params[i].split("=");
        result.Parameters[nv[0]] = nv[1];
    }
    return result;
}
//提示框
function messageBox(msg, title, button) {
    if (msg.length > 1) {
        var skip = 1;
        for (var i = skip; i < msg.length; i++) {
            if (msg[i - skip] != msg[i]) {
                msg[i - skip] = msg[i];
            }
            else {
                skip++;
            }
        }
        msg.length -= skip;
    }
    var m = "";
    for (var i = 0; i < msg.length; i++) {
        m += msg[i] + '\r\n';
    }
    window.alert(m);
}
window.forms.Element = function (ele) {
    if (ele.__element) return ele.__element;
    if (!window.forms.Element.helper) {
        window.forms.Element.helper = new function () {
            function getTextByTextContent(e) {
                return e.textContent;
            }
            function getTextByInnerText(e) {
                return e.innerText;
            }
            function setTextByTextContent(e, txt) {
                e.textContent = txt;
            }
            function setTextByInnerText(e, txt) {
                e.innerText = txt;
            }

            var getTextImpl = null;
            var setTextImpl = null;
            var div = document.createElement("div");
            if (typeof (div.innerText) == "undefined") {
                getTextImpl = getTextByTextContent;
                setTextImpl = setTextByTextContent;
            } else {
                getTextImpl = getTextByInnerText;
                setTextImpl = setTextByInnerText;
            }

            function defFormat(text) {
                if (text != 0) text = text ? text : "";
                if (text == "未定义") text = "";
                return text;
            }
            this.SetText = function (e, text, format) {
                if (!format) format = defFormat;
                text = format(text);
                switch (e.tagName) {
                    case "INPUT":
                    case "TEXTAREA":
                        e.value = text;
                        break;
                    case "SELECT":
                        var index = -1;
                        for (var i = 0; i < e.options.length; i++) {
                            if (e.options[i].value == text) {
                                index = i;
                                break;
                            }
                        }
                        if (index > -1) {
                            e.selectedIndex = index;
                        } else {
                            e.value = text;
                        }
                        break;
                    default:
                        setTextImpl(e, text);
                        break;
                }
                return text;
            }
            this.GetText = function (e, format) {
                switch (e.tagName) {
                    case "INPUT":
                    case "TEXTAREA":
                        return e.value;
                    case "SELECT":
                        var index = e.selectedIndex;
                        if (index > -1 && index < e.options.length) {
                            return e.options[index].value;
                        } else {
                            return e.value;
                        }
                    default:
                        return getTextImpl(e);
                }
            }
            this.SetHtml = function (e, html, format) {
                if (html != 0) html = html ? html : "";
                e.innerHTML = html;
                return html;
            }
            this.GetHtml = function (e, format) {
                return e.innerHTML;
            }
            this.GetWindow = function (e) {
                if (!e.__window) e.__window = window.formRoot(e);
                return e.__window;
            }
            this.GetDocument = function (e) {
                if (!e.__document) e.__document = window.formRoot(e).document;
                return e.__document;
            }
            this.GetBody = function (e) {
                if (!e.ownerDocument) return null;
                var bs = e.ownerDocument.getElementsByTagName("body");
                return bs.length ? bs[0] : null;
            }
            this.GetParent = function (e) {
                if (e.parentNode) return e.parentNode;
                if (e.parentElement) return e.parentElement;
                var wnd = e.parentWindow;
                if (!wnd) return null;
                if (!wnd.parent) return null;
                var doc = wnd.parent.document;
                if (!doc) return null;
                var frames = doc.getElementsByTagName("iframe");
                for (var i = 0; i < frames.length; i++) {
                    if (e.parentWindow == frames[i].contentWindow) return frames[i];
                }
                return null;
            }
            this.GetClient = function (self) {
                return function (e) {
                    return self.GetOffset(e, self.GetParent(e));
                }
            } (this);
            this.GetOffset = function (self) {
                return function (e, ref) {
                    var wnd = self.GetWindow(e);
                    var b1 = e.getBoundingClientRect();
                    b1 = { "x": parseInt(b1.left, 10), "y": parseInt(b1.top, 10), "width": parseInt(b1.right - b1.left, 10), "height": parseInt(b1.bottom - b1.top, 10) };
                    var marginLeft = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginLeft"] : e.currentStyle["marginLeft"], 10);
                    var marginTop = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginTop"] : e.currentStyle["marginTop"], 10);
                    if (!(marginLeft > 0)) marginLeft = 0;
                    if (!(marginTop > 0)) marginTop = 0;
                    b1.x -= marginLeft;
                    b1.y -= marginTop;
                    if (ref) {
                        var b2 = ref.getBoundingClientRect();
                        b2 = { "x": parseInt(b2.left, 10), "y": parseInt(b2.top, 10), "width": parseInt(b2.right - b2.left, 10), "height": parseInt(b2.bottom - b2.top, 10) };
                        marginLeft = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginLeft"] : e.currentStyle["marginLeft"], 10);
                        marginTop = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginTop"] : e.currentStyle["marginTop"], 10);
                        if (!(marginLeft > 0)) marginLeft = 0;
                        if (!(marginTop > 0)) marginTop = 0;
                        b2.x -= marginLeft;
                        b2.y -= marginTop;

                        b1.x -= b2.x;
                        b1.y -= b2.y;
                    }
                    return b1;
                }
            } (this);
            this.GetScroll = function (self) {
                return function (e) {
                    var scrollLeft = parseInt(e.scrollLeft, 10);
                    var scrollTop = parseInt(e.scrollTop, 10);
                    if (!(scrollLeft > 0)) scrollLeft = 0;
                    if (!(scrollTop > 0)) scrollTop = 0;
                    return { "x": scrollLeft, "y": scrollTop };
                }
            } (this);
            this.GetBounds = function (self) {
                return function (e) {
                    var wnd = self.GetWindow(e);
                    var bounds = e.getBoundingClientRect();
                    bounds = { "x": parseInt(bounds.left, 10), "y": parseInt(bounds.top, 10), "width": parseInt(bounds.right - bounds.left, 10), "height": parseInt(bounds.bottom - bounds.top, 10) };
                    var marginLeft = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginLeft"] : e.currentStyle["marginLeft"], 10);
                    var marginTop = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginTop"] : e.currentStyle["marginTop"], 10);
                    var marginRight = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginRight"] : e.currentStyle["marginRight"], 10);
                    var marginBottom = parseInt(wnd.getComputedStyle ? wnd.getComputedStyle(e, null)["marginBottom"] : e.currentStyle["marginBottom"], 10);
                    if (!(marginLeft > 0)) marginLeft = 0;
                    if (!(marginTop > 0)) marginTop = 0;
                    if (!(marginRight > 0)) marginRight = 0;
                    if (!(marginBottom > 0)) marginBottom = 0;
                    bounds.x -= marginLeft;
                    bounds.y -= marginTop;
                    bounds.width += marginLeft + marginRight;
                    bounds.height += marginTop + marginBottom;
                    return bounds;
                }
            } (this);
            this.GetObject = function (e, objAttrName, defCotr) {
                var objName = e.getAttribute(objAttrName);
                var __objectName = "__object_" + objAttrName;
                var __objectNameStr = __objectName + "_str";
                if (e[__objectName] && e[__objectNameStr] == objName) return e[__objectName];
                e[__objectNameStr] = objName;
                var dgt = null;
                var objectParams = "()";
                if (objName) {
                    try {//以下'('的处理不严谨
                        var index = objName.indexOf("(");
                        if (index > -1) {
                            objectParams = objName.substr(index, objName.length - index);
                            objName = objName.substr(0, index);
                        }
                        try {
                            dgt = eval("(" + objName + ")");
                        }
                        catch (err) { }
                        if (!dgt) {
                            try {
                                dgt = eval("window.formRoot(e)." + objName);
                            }
                            catch (err) { }
                        }
                        if (!dgt && window.formRoot(e) != window.formRoot()) {
                            try {
                                dgt = eval("window.formRoot()." + objName);
                            }
                            catch (err) { }
                        }
                    }
                    catch (err) { }
                }
                if (!dgt) dgt = defCotr;
                e[__objectName] = typeof (dgt) == 'function' ? eval("new dgt" + objectParams) : dgt;
                return e[__objectName];
            }
            return this;
        } ();
    }
    function cotr(e) {
        //设置文本
        this.SetText = function (text, format) {
            return window.forms.Element.helper.SetText(ele, text, format);
        }
        //获取文本
        this.GetText = function (format) {
            return window.forms.Element.helper.GetText(ele, format);
        }
        //设置html
        this.SetHtml = function (html, format) {
            return window.forms.Element.helper.SetText(ele, html, format);
        }
        //获取html
        this.GetHtml = function (format) {
            return window.forms.Element.helper.GetHtml(ele, format);
        }
        //获取所属window
        this.GetWindow = function () {
            return window.forms.Element.helper.GetWindow(ele);
        }
        //获取所属文档
        this.GetDocument = function () {
            return window.forms.Element.helper.GetDocument(ele);
        }
        this.GetBody = function () {
            return window.forms.Element.helper.GetBody(ele);
        }
        //获取父元素
        this.GetParent = function () {
            return window.forms.Element.helper.GetParent(ele);
        }
        //获取相对父对象布局区域
        this.GetClient = function () {
            return window.forms.Element.helper.GetClient(ele);
        }
        //获取相对布局参考对象布局区域
        this.GetOffset = function (ref) {
            return window.forms.Element.helper.GetOffset(ele, ref);
        }
        //获取滚动量
        this.GetScroll = function () {
            return window.forms.Element.helper.GetScroll(ele);
        }
        //获取相对视窗左上角布局区域
        this.GetBounds = function () {
            return window.forms.Element.helper.GetBounds(ele);
        }
        this.GetObject = function (objAttrName, defValue) {
            return window.forms.Element.helper.GetObject(ele, objAttrName, defValue);
        }
    }
    ele.__element = new cotr(ele);
    return ele.__element;
}
window.formRoot = function (ele) {
    var p = window;
    if (ele) {
        return ele.ownerDocument.parentWindow ? ele.ownerDocument.parentWindow : (ele.ownerDocument.defaultView.window ? ele.ownerDocument.defaultView.window : ele.ownerDocument.defaultView);
    }
    else {
        return window.top;
    }
    return p;
}
window.forms.object = function (o) {
    function ObjImpl(oi) {
        var oi = oi;
        this.InstanceOf = function (cls) {
            if (typeof (oi) == "undefined") return typeof (cls) == "undefined";
            if (oi == null) return cls == null;
            return oi.constructor + "" == cls + "";
        }
    }
    return new ObjImpl(o);
}
window.forms.object.Compare = function (obj1, obj2) {
    var x = 0;
    var y = 0;
    var map = { 'undefined': 1, 'object': 2, 'number': 3, 'boolean': 4, 'string': 5 };
    if (!obj1) {
        x = map[typeof (obj1)];
        if (!x) x = 0;
    }
    if (!obj2) {
        y = map[typeof (obj2)];
        if (!y) y = 0;
    }
    if (x || y) {
        var array =
                [
                    [0, 1, 1, 1, 1, 1],
                    [-1, 0, -1, -1, -1, -1],
                    [-1, 1, 0, -1, -1, -1],
                    [-1, 1, 1, 0, -1, -1],
                    [-1, 1, 1, 1, 0, -1],
                    [-1, 1, 1, 1, 1, 0]
                ];
        return array[x][y];
    }
    else {
        if (typeof (obj1) == typeof (obj2)) {
            if (obj1 == obj2) return 0;

            if (obj1) {
                if (obj1.localeCompare) return obj1.localeCompare(obj2);
                if (obj1.CompareTo) {
                    var c = obj1.CompareTo(obj2);
                    if (typeof (c) == 'number') return c;
                }
            }

            if (obj2) {
                if (obj2.localeCompare) return obj2.localeCompare(obj1);
                if (obj2.CompareTo) {
                    var c = obj2.CompareTo(obj1);
                    if (typeof (c) == 'number') return -c;
                }
            }

            x = obj1 + "";
            y = obj2 + "";
            if (x != y) return x > y ? 1 : -1;
            return -1;
        }
        else {
            return typeof (x) > typeof (y) ? 1 : -1;
        }
    }
}
Math.sign = function (num) {
    if (num == 0) return 0;
    if (num < 0) return -1;
    if (num > 0) return 1;
}
