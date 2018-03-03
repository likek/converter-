window.forms.StaticValueConv = function (val) {
    window.forms.SingleValueConv.apply(this);
    this.ApplyValue = function (ele, value) {
    }
    this.GetValue = this.GetUIValue = function (ele) {
        return val;
    }
}
window.forms.FrontValueConv = function (impl) {
    if (typeof (impl) == "function") {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
        var obj = {};
        impl.apply(obj, args);
        impl = obj;
    }
    if (!impl || typeof (impl) != 'object') impl = new window.forms.SingleValueConv();
    this.CompareValues = impl.CompareValues;
    this.DetermineApply = impl.DetermineApply;
    this.DecodeArguments = impl.DecodeArguments;
    this.SetValue = impl.SetValue;
    this.GetValue = impl.GetUIValue;
    this.GetUIValue = impl.GetUIValue;
    this.ApplyValue = impl.ApplyValue;
}
window.forms.CacheValueConv = function (impl) {
    if (typeof (impl) == "function") {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
        var obj = {};
        impl.apply(obj, args);
        impl = obj;
    }
    if (!impl || typeof (impl) != 'object') impl = new window.forms.SingleValueConv();
    this.CompareValues = impl.CompareValues;
    this.DetermineApply = impl.DetermineApply;
    this.DecodeArguments = impl.DecodeArguments;
    this.SetValue = impl.SetValue;
    this.GetValue = impl.GetValue;
    this.GetUIValue = impl.GetValue;
    this.ApplyValue = function (ele, value) {
    }
}
window.forms.FuncValueConv = function (func) {
    window.forms.SingleValueConv.apply(this);
    this.ApplyValue = function (ele, value) {
    }
    this.GetValue = this.GetUIValue = function (ele) {
        return func(ele);
    }
}
window.forms.ActionValueConv = function (repeat, action) {
    window.forms.SingleValueConv.apply(this);
    if (repeat) {
        this.CompareValues = function (v1, v2) {
            return 1;
        }
    }
    this.ApplyValue = function (ele, value) {
        action(value);
    }
}
window.forms.ListViewConv = function (userInput, filter, style) {
    window.forms.ListValueConv.apply(this, [style]);
    this.GetUIValue = this.GetValue
    var mnu;
    var applyValue = this.ApplyValue;
    this.ApplyValue = function (ele, value) {
        if (style) {
            if (!ele.getAttribute("inputMember")) ele.setAttribute("inputMember", style.inputMember);
            if (!ele.getAttribute("displayMember")) ele.setAttribute("displayMember", style.displayMember);
            if (!ele.getAttribute("valueMember")) ele.setAttribute("valueMember", style.valueMember);
        }
        applyValue(ele, value);
    }
    this.ApplyItem = function (self) {
        return function (ele, list, index) {
            if (index == -1) {
                if (!mnu) {
                    var txt = ele.ownerDocument.createElement("input");
                    if ((!userInput && typeof (filter) != "function")) txt.setAttribute("readonly", true);
                    txt.type = "text";
                    txt.className = style.classText;
                    txt.style.width = "100%";
                    txt.style.height = "100%";
                    txt.style.border = "0px";
                    txt.style.backgroundColor = "transparent";
                    ele.appendChild(txt);
                    var unfold = ele.ownerDocument.createElement("div");
                    unfold.style.cursor = "pointer";
                    unfold.style.border = "inherit";
                    unfold.className = style.classDropDown;
                    unfold.style.width = 0;
                    unfold.style.height = 0;
                    var size = parseInt(ele.offsetHeight / 4, 10);
                    unfold.style.borderLeft = size + "px solid transparent";
                    unfold.style.borderRight = size + "px solid transparent";
                    unfold.style.borderTopWidth = size + "px";
                    unfold.style.borderBottom = "0px";
                    unfold.style.display = "inline-block";
                    unfold.style.cssFloat = 'right';
                    unfold.style.margin = -2.5 * size + "px " + size + "px 0 0";
                    ele.appendChild(unfold);
                    mnu = new Menu(ele, style);
                    var hide = mnu.Hide;
                    var show = mnu.Show;
                    mnu.Hide = function () {
                        window.forms.Event.UnhookMouseEvent(ele, "mousedown")
                        hide();
                    }
                    function setItemField(data) {
                        var itemField = ele.getAttribute("itemField");
                        if (!itemField || itemField == "") return;
                        var form = formCallCenter.DetectFormByElement(ele);
                        form.SetField(itemField, [data], true);
                    }
                    mnu.Show = function () {
                        show();
                        window.forms.Event.HookMouseEvent(ele, "mousedown",
                                function (f) {
                                    if (f) {
                                        if (userInput) setItemField(getInputData());
                                        mnu.Hide();
                                    }
                                },
                                function () {
                                    var e = mnu.GetElement();
                                    var sur = window.forms.Event.Source();
                                    while (sur) {
                                        if (sur == e) return false;
                                        sur = sur.parentNode;
                                    }
                                    return true;
                                })
                    }
                    var drawRow = mnu.drawRow;
                    mnu.drawRow = function (doc, e, ri, d, style) {
                        e.__currData = d;
                        e.className = style.classItem;
                        e.title = d[style.displayMember];
                        window.forms.Element(e).SetText(d[style.displayMember]);
                        e.onclick = function () {
                            setItemField(d);
                            mnu.Hide();
                        }
                    }
                    ele.onclick = function () {
                        if (!mnu.Visible()) {
                            mnu.Clear();
                            var data = self.GetValue(ele);
                            if (!data || !data.length) return;
                            for (var i = 0; i < data.length; i++) {
                                mnu.Add(data[i]);
                            }
                            mnu.Show();
                        }
                        else {
                            if (window.forms.Event.Source() == unfold) mnu.Hide();
                        }
                    }
                    function getInputData() {
                        var t = window.forms.Element(txt).GetText();
                        var n = 0;
                        var selection = {};
                        var data = self.GetValue(ele);
                        if (data) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i][style.displayMember] == t) {
                                    selection = data[i];
                                    n++;
                                }
                            }
                        }
                        if (n != 1) {
                            selection[style.valueMember] = null;
                            selection[style.displayMember] = t;
                        }
                        return selection;
                    }
                    if (typeof (filter) == "function") {
                        txt.onchange = function () {
                            if (userInput) setItemField(getInputData());
                            mnu.Hide();
                        }
                        var checkSelection = function () {
                            var t = window.forms.Element(txt).GetText();
                            var selection = null;
                            var data = self.GetValue(ele);
                            if (data) {
                                for (var i = 0; i < data.length; i++) {
                                    if (filter(data[i], t)) {
                                        selection = data[i];
                                        break;
                                    }
                                }
                            }
                            if (selection) {
                                setItemField(selection);
                            }
                            else {
                                if (userInput) setItemField(getInputData());
                            }
                        }
                        txt.onkeyup = function () {
                            var key = window.forms.Event.KeyCode();
                            switch (key) {
                                case 13:
                                    {
                                        checkSelection();
                                        mnu.Hide();
                                    }
                                    break;
                                default:
                                    {
                                        mnu.Clear();
                                        var data = self.GetValue(ele);
                                        if (data) {
                                            var t = window.forms.Element(txt).GetText();
                                            for (var i = 0; i < data.length; i++) {
                                                if (filter(data[i], t)) mnu.Add(data[i]);
                                            }
                                        }
                                        mnu.Show();
                                    }
                                    break;
                            }
                        }
                    }
                }
                mnu.Clear();
                self.InheritProperties(ele, ele.children[0]);
            }
            else {
                mnu.Add(list[index]);
            }
        }
    } (this);
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.ListViewConv.ListViewItemValueConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        window.forms.Form.InheritAttributes(srcElement, desElement);
    }
    window.forms.ListViewConv.ListViewItemValueConv = function () {
        window.forms.SingleValueConv.apply(this);
        this.CompareValues = function (val1, val2) {
            return 1;
        }
        this.GetUIValue = this.GetValue = function (ele) {
            if (ele.__bindedData) return ele.__bindedData;
            var displayMember = ele.getAttribute("displayMember");
            var valueMember = ele.getAttribute("valueMember");
            var value = {};
            value[valueMember] = null;
            value[displayMember] = null;
            return value;
        }
        this.ApplyValue = function (ele, value) {
            var displayMember = ele.getAttribute("displayMember");
            var text = value ? value[displayMember] : "";
            window.forms.Element(ele).SetText(text);
            ele.title = text;
        }
    }
}
window.forms.DropDownListConv = function (style) {
    window.forms.ListViewConv.apply(this, [false, null, style]);
}
window.forms.FilterableListConv = function (userInput, style) {
    function filter(d, test) {
        test = test ? test.toLowerCase() : "";
        var input = d[style.inputMember];
        if (input && input.toLowerCase().indexOf(test) > -1) return true;
        var display = d[style.displayMember];
        if (display && display.toLowerCase().indexOf(test) > -1) return true;
        var value = d[style.valueMember];
        if (value && value.toLowerCase().indexOf(test) > -1) return true;
        return false;
    }
    window.forms.ListViewConv.apply(this, [userInput, filter, style]);
}

window.forms.TileListConv = function (style) {
    window.forms.ListValueConv.apply(this, [style]);
    this.GetUIValue = this.GetValue;
    var applyValue = this.ApplyValue;
    this.ApplyValue = function (ele, value) {
        if (style) {
            if (!ele.getAttribute("displayMember")) ele.setAttribute("displayMember", style.displayMember);
        }
        applyValue(ele, value);
    }
    this.ApplyItem = function (self) {
        return function (ele, list, index) {
            var root;
            if (ele.children.length < 1) {
                var e = ele.ownerDocument.createElement("div");
                ele.appendChild(e);
                root = e;
            }
            else {
                root = ele.children[0];
            }
            if (index == -1) {
                self.InheritProperties(ele, root);
                root.className = style.classList;
                var cnt = list ? list.length : 0;
                for (var i = root.children.length; i > cnt; i--) {
                    root.removeChild(root.children[i - 1]);
                }
                for (var i = root.children.length; i < cnt; i++) {
                    var e = root.ownerDocument.createElement("div");
                    e.onclick = function (e) {
                        return function () {
                            var field = root.getAttribute("field");
                            if (!field || field == "") return;
                            var form = formCallCenter.DetectFormByElement(root);
                            form.SetField(field, [e.__currData], true);
                        }
                    } (e);
                    root.appendChild(e);
                }
            }
            else {
                var e = root.children[index];
                if (e.__currData == list[index]) return;
                e.className = style.classItem;
                e.__currData = list[index];
                window.forms.Element(e).SetText(list[index][root.getAttribute("displayMember")]);
            }
        }
    } (this);
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.TileListConv.TileListItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        window.forms.Form.InheritAttributes(srcElement, desElement);
    }
    window.forms.TileListConv.TileListItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.GetUIValue = this.GetValue;
        this.ApplyValue = function (ele, value) {
        }
    }
}