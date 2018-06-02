//静态数据conv，给定field以指定值
window.forms.StaticValueConv = function (val) {
    window.forms.SingleValueConv.apply(this);
    this.ApplyValue = function (ele, value) {
    }
    this.GetValue = this.GetUIValue = function (ele) {
        return val;
    }
}
//前端conv，以前端数据作为字段值
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
    if (!impl || typeof (impl) != 'object') {
        impl = {};
        window.forms.SingleValueConv.apply(impl, args);
    }
    impl.GetValue = impl.GetUIValue;

    this.CompareValues = impl.CompareValues;
    this.DetermineApply = impl.DetermineApply;
    this.DecodeArguments = impl.DecodeArguments;
    this.SetValue = impl.SetValue;
    this.GetValue = impl.GetValue;
    this.GetUIValue = impl.GetUIValue;
    this.ApplyValue = impl.ApplyValue;
}
//缓存conv，只做数据缓存不做UI展现
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
    if (!impl || typeof (impl) != 'object') {
        impl = {};
        window.forms.SingleValueConv.apply(impl, args);
    }
    impl.GetUIValue = impl.GetValue;
    impl.ApplyValue = function (ele, value) {
    }

    this.CompareValues = impl.CompareValues;
    this.DetermineApply = impl.DetermineApply;
    this.DecodeArguments = impl.DecodeArguments;
    this.SetValue = impl.SetValue;
    this.GetValue = impl.GetValue;
    this.GetUIValue = impl.GetUIValue;
    this.ApplyValue = impl.ApplyValue;
}
//函数取值conv
window.forms.FuncValueConv = function (func) {
    window.forms.SingleValueConv.apply(this);
    this.ApplyValue = function (ele, value) {
    }
    this.GetValue = this.GetUIValue = function (ele) {
        return func(ele);
    }
}
//操作conv
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
//下拉列表conv
window.forms.ListViewConv = function (userInput, filter, style) {
    window.forms.ListValueConv.apply(this, [style]);
    this.GetUIValue = function (self) {
        return function (ele) { return self.GetValue(ele); }
    } (this);
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

                    function getImplItem(selectFirstItem) {
                        var t = window.forms.Element(txt).GetText();
                        var selection = null;
                        var bindedFlag = false;
                        var binded = null;
                        var data = self.GetValue(ele);
                        if (data) {
                            //绝对相等
                            for (var i = 0; i < data.length; i++) {
                                if (data[i][style.displayMember] == t) {
                                    if (!bindedFlag) {
                                        bindedFlag = true;
                                        var itemField = ele.getAttribute("itemField");
                                        if (itemField && itemField.length > 0) {
                                            var form = formCallCenter.DetectFormByElement(ele);
                                            binded = form.GetField(itemField);
                                        }
                                    }
                                    if (data[i] == binded) return binded;
                                    selection = data[i];
                                    break;
                                }
                            }
                            if (!selection) {
                                if (selectFirstItem) {
                                    //过滤规则
                                    if (typeof (filter) == "function") {
                                        for (var i = 0; i < data.length; i++) {
                                            if (filter(data[i], t)) {
                                                if (!bindedFlag) {
                                                    bindedFlag = true;
                                                    var itemField = ele.getAttribute("itemField");
                                                    if (itemField && itemField.length > 0) {
                                                        var form = formCallCenter.DetectFormByElement(ele);
                                                        binded = form.GetField(itemField);
                                                    }
                                                }
                                                if (data[i] == binded) return binded;
                                                selection = data[i];
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (!selection) {
                                if (userInput) {
                                    var displayMember = ele.getAttribute("displayMember");
                                    var valueMember = ele.getAttribute("valueMember");
                                    var value = {};
                                    value[valueMember] = null;
                                    value[displayMember] = t;
                                    selection = value;
                                }
                            }
                            if (!selection) {
                                if (!bindedFlag) {
                                    bindedFlag = true;
                                    var itemField = ele.getAttribute("itemField");
                                    if (itemField && itemField.length > 0) {
                                        var form = formCallCenter.DetectFormByElement(ele);
                                        binded = form.GetField(itemField);
                                    }
                                }
                                selection = binded;
                            }
                            if (!selection) {
                                var displayMember = ele.getAttribute("displayMember");
                                var valueMember = ele.getAttribute("valueMember");
                                var value = {};
                                value[valueMember] = null;
                                value[displayMember] = null;
                                selection = value;
                            }
                        }
                        return selection;
                    }

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
                                    if (!f) {
                                        setItemField(getImplItem());
                                        mnu.Hide();
                                    }
                                },
                                function () {
                                    var e = mnu.GetElement();
                                    var sur = window.forms.Event.Source();
                                    while (sur) {
                                        if (sur == e || sur == ele) return true;
                                        sur = sur.parentNode;
                                    }
                                    return false;
                                })
                    }
                    var drawRow = mnu.drawRow;
                    mnu.drawRow = function (doc, e, ri, d, style) {
                        e.__currData = d;
                        e.className = style.classItem;
                        e.title = d[style.displayMember]||"";
                        window.forms.Element(e).SetText(d[style.displayMember]);
                        e.onclick = function (e) {
                            return function () {
                                setItemField(e.__currData);
                                mnu.Hide();
                            }
                        } (e);
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
                    }
                    if (typeof (filter) == "function") {
                        txt.onchange = function () {
                            setItemField(getImplItem());
                            mnu.Hide();
                        }
                        txt.onkeyup = function () {
                            var key = window.forms.Event.KeyCode();
                            switch (key) {
                                case 13:
                                    {
                                        setItemField(getImplItem(true));
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
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.ListViewConv.ListViewItemValueConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.ListViewConv.ListViewItemValueConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.CompareValues = function (val1, val2) {
            return 1; //可手输下拉框需要，应结合GetUIValue，改为return val1==val2?0:1;
        }
        this.GetUIValue = function (self) {
            return function (ele) { return self.GetValue(ele); }
        } (this);
        this.ApplyValue = function (ele, value) {
            var displayMember = ele.getAttribute("displayMember");
            var text = value ? (value[displayMember]||"") : "";
            window.forms.Element(ele).SetText(text);
            ele.title = text;
        }
    }
}
//下拉列表conv，不可手录筛选
window.forms.DropDownListConv = function (style) {
    window.forms.ListViewConv.apply(this, [false, null, style]);
}
//可筛选列表conv
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
//表格conv
window.forms.TableViewConv = function (style) {
    window.forms.ListValueConv.apply(this, [style]);
    this.CompareValues = function (val1, val2) {
        return val1 == val2 ? 0 : 1;
    };
    this.GetUIValue = function (self) {
        return function (ele) { return self.GetValue(ele); }
    } (this);
    var table;
    var applyValue = this.ApplyValue;
    this.ApplyValue = function (ele, value) {
        applyValue(ele, value);
        if (table) table.Refresh();
    };
    this.ApplyItem = function (self) {
        return function (ele, list, index) {
            if (index == -1) {
                self.__fieldElement = ele;
                if (!table) {
                    var tableContainer = ele.ownerDocument.createElement('div');
                    self.__itemFieldElement = tableContainer;
                    ele.appendChild(tableContainer);
                    tableContainer.style.height = 'inherit';
                    tableContainer.style.width = 'inherit';
                    table = new TableView(tableContainer, style);

                    var drawHeaderRow = table.drawHeaderRow;
                    var drawContentRow = table.drawContentRow;
                    var drawHeaderCell = table.drawHeaderCell;
                    var drawContentCell = table.drawContentCell;
                    table.drawHeaderRow = function (doc, e, columns, style) {
                        e.__currData = columns;
                        drawHeaderRow(doc, e, columns, style);
                        self.drawHeaderRow(doc, e, columns, style);
                        if (typeof (style.drawHeaderRow) == "function") style.drawHeaderRow(doc, e, columns, style);
                    }
                    table.drawContentRow = function (doc, e, columns, ri, row, style) {
                        e.__currData = row;
                        drawContentRow(doc, e, columns, ri, row, style);
                        self.drawContentRow(doc, e, columns, ri, row, style);
                        if (typeof (style.drawContentRow) == "function") style.drawContentRow(doc, e, columns, ri, row, style);
                    }
                    table.drawContentCell = function (doc, e, ri, r, ci, c, style) {
                        drawContentCell(doc, e, ri, r, ci, c, style);
                        self.drawContentCell(doc, e, ri, r, ci, c, style);
                        if (typeof (style.drawContentCell) == "function") style.drawContentCell(doc, e, ri, r, ci, c, style);
                    }
                    table.drawHeaderCell = function (doc, e, ci, c, style) {
                        drawHeaderCell(doc, e, ci, c, style);
                        self.drawHeaderCell(doc, e, ci, c, style);
                        if (typeof (style.drawHeaderCell) == "function") style.drawHeaderCell(doc, e, ci, c, style);
                    }
                }
                var columns = style.columns;
                table.Columns().Clear();
                for (var i = 0; i < columns.length; i++) {
                    table.Columns().Add(columns[i]);
                }
                table.Rows().Clear();
                self.InheritProperties(ele, ele.children[0]);
            }
            else {
                table.Rows().Add(list[index]);
            }
        }
    } (this);
    this.drawHeaderRow = function (doc, e, columns, style) { };
    this.drawContentRow = function (self) {
        return function (doc, e, columns, ri, row, style) {
            if (row) {
                var ele = self.__itemFieldElement;
                var conv = window.forms.Element(ele).GetObject("conv");
                var valueMember = ele.getAttribute("valueMember");
                var selectedExamOrder = conv.GetValue(ele);
                if (selectedExamOrder && row[valueMember] == selectedExamOrder[valueMember]) {
                    e.className = style.classSelectedRow;
                }
                else {
                    e.className = style.classUnselectedRow;
                }
            } else {
                e.className = style.classUnselectedRow;
            }
            var events = manageElement(e, "tableView", "events");
            window.forms.Event.Unregister(e, "mousedown", events.RowClick);
            events.RowClick = function () {
                var ele = self.__itemFieldElement;
                var field = ele.getAttribute("field");
                if (!field || field == "") return;
                var form = formCallCenter.DetectFormByElement(ele);
                form.SetField(field, [row], true);
            }
            window.forms.Event.Register(e, "mousedown", events.RowClick);
        }
    } (this);
    this.drawContentCell = function (doc, e, ci, c, style) { };
    this.drawHeaderCell = function (doc, e, ci, c, style) { };
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.TableViewConv.TableViewItemValueConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.TableViewConv.TableViewItemValueConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.CompareValues = function (val1, val2) {
            return val1 == val2 ? 0 : 1;
        }
        this.GetUIValue = function (self) {
            return function (ele) { return self.GetValue(ele); }
        } (this);
        this.ApplyValue = function (ele, value) {
            var valueMember = ele.getAttribute("valueMember");
            var rows = ele.children[0].children[1].children[0].children[0].children;
            for (var i = 1, l = rows.length; i < l; i++) {
                var e = rows[i];
                if ((e.__currData == value) || (valueMember && e.__currData && value && e.__currData[valueMember] == value[valueMember])) {
                    e.className = style.classSelectedRow;
                }
                else {
                    e.className = style.classUnselectedRow;
                }
            }
        }
    };
};
window.forms.TileListConv = function (style) {
    window.forms.ListValueConv.apply(this, [style]);
    this.GetUIValue = function (self) {
        return function (ele) { return self.GetValue(ele); }
    } (this);
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
                    if(typeof style.drawItem == 'function')style.drawItem(e,list[i]);
                    root.appendChild(e);
                }
            }
            else {
                var e = root.children[index];
                e.className = style.classItem;
                e.__currData = list[index];
                window.forms.Element(e).SetText(list[index][root.getAttribute("displayMember")]);
            }
        }
    } (this);
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.TileListConv.TileListItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.TileListConv.TileListItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.GetUIValue = function (self) {
            return function (ele) { return self.GetValue(ele); }
        } (this);
        this.ApplyValue = function (ele, value) {
            for (var i = 0; i < ele.children.length; i++) {
                ele.children[i].style.color = ele.children[i].__currData == value ? "red" : "black";
            }
        }
    }
}
window.forms.RadioButtonListConv = function (style) {
    window.forms.TileListConv.apply(this, [style]);
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.RadioButtonListConv.RadioListItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.RadioButtonListConv.RadioListItemConv = function (style) {
        window.forms.TileListConv.TileListItemConv.apply(this, [style]);
        this.ApplyValue = function (ele, value) {
            var valueMember = ele.getAttribute("valueMember");
            for (var i = 0; i < ele.children.length; i++) {
                var e = ele.children[i];
                var label;
                var text;
                if (e.children.length != 2) {
                    e.innerHTML = "";
                    label = ele.ownerDocument.createElement('span');
                    text = ele.ownerDocument.createElement('span');
                    e.style.cursor = 'pointer';
                    e.style.display = label.style.display = text.style.display = 'inline-block';
                    label.style.verticalAlign = text.style.verticalAlign = 'middle';
                    e.appendChild(label);
                    e.appendChild(text);
                }
                else {
                    label = e.children[0];
                    text = e.children[1];
                }
                window.forms.Element(text).SetText(e.__currData ? e.__currData[ele.getAttribute("displayMember")] : "");
                if (e.__currData == value || (valueMember && e.__currData && value && e.__currData[valueMember] == value[valueMember])) {
                    e.className = style.classSelectedItem;
                    label.className = style.classSelectedLabel;
                    text.className = style.classSelectedText;
                } else {
                    e.className = style.classUnselectdItem;
                    label.className = style.classUnselectedLabel;
                    text.className = style.classUnselectedText;
                }
            }
        };
    }
};

window.forms.CheckboxListConv = function (filter, style) {
    window.forms.ListValueConv.apply(this);
    this.GetUIValue = function (self) {
        return function (ele) { return self.GetValue(ele); }
    } (this);
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
                    var size = parseInt(ele.offsetHeight / 4, 10);
                    var txt = ele.ownerDocument.createElement("div");
                    txt.className = style.classText;
                    txt.style.height = "100%";
                    txt.style.border = "0px";
                    txt.style.overflow = "auto";
                    txt.style.marginRight = size * 4 + "px";
                    txt.style.backgroundColor = "transparent";
                    ele.appendChild(txt);
                    var unfold = ele.ownerDocument.createElement("div");
                    unfold.style.cursor = "pointer";
                    unfold.style.border = "inherit";
                    unfold.className = style.classDropDown;
                    unfold.style.width = 0;
                    unfold.style.height = 0;
                    unfold.style.borderLeft = size + "px solid transparent";
                    unfold.style.borderRight = size + "px solid transparent";
                    unfold.style.borderTopWidth = size + "px";
                    unfold.style.borderBottom = "0px";
                    unfold.style.display = "inline-block";
                    unfold.style.cssFloat = 'right';
                    unfold.style.margin = -2.5 * size + "px " + size + "px 0 0";
                    ele.appendChild(unfold);

                    function getImplItem(input, selectFirstItem) {
                        var t = window.forms.Element(input).GetText();
                        var selection = null;
                        var bindedFlag = false;
                        var binded = null;
                        var data = self.GetValue(ele);
                        if (data) {
                            //绝对相等
                            for (var i = 0; i < data.length; i++) {
                                if (data[i][style.displayMember] == t) {
                                    if (!bindedFlag) {
                                        bindedFlag = true;
                                        var itemField = ele.getAttribute("itemField");
                                        if (itemField && itemField.length > 0) {
                                            var form = formCallCenter.DetectFormByElement(ele);
                                            binded = form.GetField(itemField);
                                        }
                                    }
                                    if (data[i] == binded) return binded;
                                    selection = data[i];
                                    break;
                                }
                            }
                            if (!selection) {
                                if (selectFirstItem) {
                                    //过滤规则
                                    if (typeof (filter) == "function") {
                                        for (var i = 0; i < data.length; i++) {
                                            if (filter(data[i], t)) {
                                                if (!bindedFlag) {
                                                    bindedFlag = true;
                                                    var itemField = ele.getAttribute("itemField");
                                                    if (itemField && itemField.length > 0) {
                                                        var form = formCallCenter.DetectFormByElement(ele);
                                                        binded = form.GetField(itemField);
                                                    }
                                                }
                                                if (data[i] == binded) return binded;
                                                selection = data[i];
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (!selection) {
                                if (!bindedFlag) {
                                    bindedFlag = true;
                                    var itemField = ele.getAttribute("itemField");
                                    if (itemField && itemField.length > 0) {
                                        var form = formCallCenter.DetectFormByElement(ele);
                                        binded = form.GetField(itemField);
                                    }
                                }
                                selection = binded;
                            }
                            if (!selection) {
                                var displayMember = ele.getAttribute("displayMember");
                                var valueMember = ele.getAttribute("valueMember");
                                var value = {};
                                value[valueMember] = null;
                                value[displayMember] = null;
                                selection = value;
                            }
                        }
                        return selection;
                    }

                    mnu = new Menu(ele, style);
                    if (typeof (filter) == "function") {
                        var clear = mnu.Clear;
                        mnu.Clear = function () {
                            var cnt = mnu.Count();
                            if (cnt < 1) {
                                var d = {};
                                d[ele.getAttribute("valueMember")] = {};
                                d[ele.getAttribute("displayMember")] = " ";
                                mnu.Add(d);
                            }
                            else {
                                for (var i = cnt - 1; i > 0; i--) {
                                    mnu.RemoveAt(i);
                                }
                            }
                        }
                    }
                    var hide = mnu.Hide;
                    var show = mnu.Show;
                    mnu.Hide = function () {
                        window.forms.Event.UnhookMouseEvent(ele, "mousedown")
                        hide();
                    }
                    function selectItem(data, shift) {
                        var itemField = ele.getAttribute("itemField");
                        if (!itemField || itemField == "") return;
                        var form = formCallCenter.DetectFormByElement(ele);
                        var items = form.GetField(itemField);
                        if (!items || !items.length) items = [];
                        var list = [];
                        for (var i = 0; i < items.length; i++) {
                            list[i] = items[i];
                        }
                        for (var i = list.length - 1; i > -1; i--) {
                            if (list[i] == data) {
                                for (var j = i; j < list.length - 1; j++) {
                                    list[j] = list[j + 1];
                                }
                                list.length--;
                                if (shift) data = null;
                            }
                        }
                        if (data) list[list.length] = data;
                        form.SetField(itemField, [list], true);
                    }
                    mnu.Show = function () {
                        show();
                        window.forms.Event.HookMouseEvent(ele, "mousedown",
                                function (f) {
                                    if (!f) mnu.Hide();
                                },
                                function () {
                                    var e = mnu.GetElement();
                                    var sur = window.forms.Event.Source();
                                    while (sur) {
                                        if (sur == e || sur == ele) return true;
                                        sur = sur.parentNode;
                                    }
                                    return false;
                                })
                    }

                    var drawRow = mnu.drawRow;
                    mnu.drawRow = function (doc, e, ri, d, style) {
                        e.__currData = d;
                        if (typeof (filter) == "function" && ri == 0) {
                            var check = null;
                            var input = null;
                            if (e.children.length == 0) {
                                input = doc.createElement("input");
                                input.style.width = "100%";
                                input.style.borderTop = input.style.borderRight = "0px";
                                input.type = "text";
                                input.className = style.classInput;
                                input.onkeyup = function () {
                                    var key = window.forms.Event.KeyCode();
                                    switch (key) {
                                        case 13:
                                            {
                                                selectItem(getImplItem(input, true), false);
                                            }
                                            break;
                                        default:
                                            {
                                                mnu.Clear();
                                                var data = self.GetValue(ele);
                                                if (data) {
                                                    var t = window.forms.Element(input).GetText();
                                                    for (var i = 0; i < data.length; i++) {
                                                        if (filter(data[i], t)) mnu.Add(data[i]);
                                                    }
                                                }
                                            }
                                            break;
                                    }
                                }
                                e.appendChild(input);
                            }
                            else {
                                input = e.children[0];
                            }
                        }
                        else {
                            e.style.cursor = "pointer";
                            e.className = d.chklSelected ? style.classSelectedItem : style.classUnselectedItem;
                            e.title = d[style.displayMember]||"";
                            window.forms.Element(e).SetText((d.chklSelected ? " ■ " : " □ ") + d[style.displayMember]);
                            e.onclick = function (e) {
                                return function () {
                                    selectItem(e.__currData, true);
                                }
                            } (e);
                        }
                    }
                    ele.onclick = function () {
                        var data = self.GetValue(ele);
                        if (data && data.length) {
                            var itemField = ele.getAttribute("itemField");
                            if (!itemField || itemField == "") return;
                            var form = formCallCenter.DetectFormByElement(ele);
                            var items = form.GetField(itemField);
                            if (items && items.length) {
                                var src = window.forms.Event.Source();
                                if (src == unfold) {//有选项时，需通过下拉小三角展开显示
                                    if (!mnu.Visible()) {
                                        mnu.Clear();
                                        for (var i = 0; i < data.length; i++) {
                                            mnu.Add(data[i]);
                                        }
                                        mnu.Show();
                                    }
                                }
                            }
                            else {
                                if (!mnu.Visible()) {
                                    mnu.Clear();
                                    for (var i = 0; i < data.length; i++) {
                                        mnu.Add(data[i]);
                                    }
                                    mnu.Show();
                                }
                            }
                        }
                        else {
                            mnu.Hide();
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
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.CheckboxListConv.CheckboxListItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.CheckboxListConv.CheckboxListItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.CompareValues = function (val1, val2) {
            return 1; //可手输下拉框需要，应结合GetUIValue，改为return val1==val2?0:1;
        }
        this.GetUIValue = function (self) {
            return function (ele) { return self.GetValue(ele); }
        } (this);
        var decodeArguments = this.DecodeArguments;
        this.DecodeArguments = function (self) {
            return function (ele, value) {
                var list = self.GetValue(ele);
                if (list) {
                    for (var i = 0; i < list.length; i++) {
                        delete list[i].chklSelected;
                    }
                }
                value = decodeArguments(ele, value);
                if (value) {
                    for (var i = 0; i < value.length; i++) {
                        value[i].chklSelected = true;
                    }
                }
                return value;
            }
        } (this);
        this.ApplyValue = function (self) {
            return function (ele, value) {
                var displayMember = ele.getAttribute("displayMember");
                var cnt = value && value.length ? value.length : 0;
                for (var i = ele.children.length; i > cnt; i--) {
                    ele.removeChild(ele.children[i - 1]);
                }
                var doc = window.forms.Element(ele).GetDocument();
                for (var i = ele.children.length; i < cnt; i++) {
                    var ee = doc.createElement("span");
                    ee.className = style.classRemove;
                    ee.style.padding = "2px";
                    ee.style.margin = "2px";
                    ee.style.display = "inline-block";
                    var et = doc.createElement("span");
                    et.className = "Text";
                    et.style.marginRight = "2px";
                    var ec = doc.createElement("span");
                    ec.className = "Close";
                    ec.style.cursor = "pointer";
                    ec.onclick = function (ee) {
                        return function () {
                            if (confirm("是否删除选项：" + (ee.__currData ? ee.__currData[displayMember] : ""))) {
                                var items = self.GetValue(ele);
                                var list = [];
                                var find = false;
                                for (var i = items.length - 1; i > -1; i--) {
                                    if (items[i] == ee.__currData) {
                                        find = true;
                                    }
                                    else {
                                        list[list.length] = items[i];
                                    }
                                }
                                var field = ele.getAttribute('field');
                                var form = formCallCenter.DetectFormByElement(ele);
                                if (find) form.SetField(field, [list]);
                            }
                        }
                    } (ee);
                    ee.appendChild(et);
                    ee.appendChild(ec);
                    ele.appendChild(ee);
                }
                var text = "";
                for (var i = 0; i < cnt; i++) {
                    var ee = ele.children[i];
                    ee.__currData = value[i];
                    var et = ee.children[0];
                    var ec = ee.children[1];
                    et.title = value[i][displayMember]||"";
                    ec.title = "删除选项:" + (value[i][displayMember]||"");
                    window.forms.Element(et).SetText(value[i][displayMember]);
                    window.forms.Element(ec).SetText("⊗");
                    if (i < cnt - 1) {
                        text += value[i][displayMember] + ";";
                    }
                    else {
                        text += value[i][displayMember];
                    }
                }
                ele.title = text;
                var mnu = manageElement(ele.parentNode, "menu").impl;
                if (mnu) {
                    var cnt = mnu.Count();
                    for (var i = 0; i < cnt; i++) {
                        mnu.ItemAt(i, mnu.ItemAt(i));
                    }
                    mnu.Refresh();
                }
            }
        } (this);
    }
}
//树conv
window.forms.TreeViewConv = function (style) {
    if (!style) {
        style = { "idMember": "id" };
    }
    else {
        if (!style.idMember) style.idMember = "id";
    }
    window.forms.ListValueConv.apply(this);
    var tv;
    this.ApplyValue = function (self) {
        return function (ele, val) {
            var tv = getTreeView(self, ele);
            var n = tv.FindNode(findCall(val));
            if (!n) n = tv;
            var nodes = n.Nodes();
            nodes.Clear();
            var children = val ? val[style.childrenMember] : [];
            for (var i = 0; i < children.length; i++) {
                nodes.Add(children[i]);
            }
        };
    } (this);
    function findCall(val) {
        return function (node) {
            if (val == node) return 1;
            var data = node.GetData();
            var d1 = data ? data[style.idMember] : null;
            var d2 = val ? val[style.idMember] : null;
            return d1 == d2;
        }
    }
    function getTreeView(self, ele) {
        if (tv) return tv;
        tv = new TreeView(ele, null, style);
        self.InheritProperties(ele, tv.GetElement());
        var drawNode = tv.drawNode;
        tv.drawNode = function (header, content, node) {
            drawNode(header, content, node);

            var itemField = ele.getAttribute("itemField");
            if (!itemField || itemField == "") return;

            content.style.cursor = "pointer";

            if (node.IsLeaf()) {
                header.style.cursor = "pointer";
                var events = manageElement(header, "events");
                window.forms.Event.Unregister(header, "click", events.NodeClick);
                events.NodeClick = function () {
                    var form = formCallCenter.DetectFormByElement(ele);
                    form.SetField(itemField, [node], true);
                }
                window.forms.Event.Register(header, "click", events.NodeClick);
            }

            var events = manageElement(content, "events");
            window.forms.Event.Unregister(content, "click", events.NodeClick);
            events.NodeClick = function () {
                var form = formCallCenter.DetectFormByElement(ele);
                form.SetField(itemField, [node], true);
            }
            window.forms.Event.Register(content, "click", events.NodeClick);

            var form = formCallCenter.DetectFormByElement(ele);
            var curr = form.GetField(itemField);
            var c = curr;
            var selected = false;
            while (curr) {
                if (curr == node) {
                    selected = true;
                    break;
                }
                curr = curr.GetParent();
            }
            var e = node.GetElement();
            if (e) e.className = selected ? (curr == c ? style.classCurrentNode : style.classSelectedNode) : style.classUnselectedNode;
        }
        return tv;
    }
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.TreeViewConv.TreeViewItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.TreeViewConv.TreeViewItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        var oldValue = null;
        this.DecodeArguments = function (ele, args) {
            var tv = new TreeView(ele.parentNode, null, style);
            var node = tv.FindNode(findCall(args[0]));
            return node;
        }
        function findCall(val) {
            return function (node) {
                if (val == node) return 1;
                var data = node.GetData();
                var d1 = data ? data[style.idMember] : null;
                var d2 = val ? val[style.idMember] : null;
                return d1 == d2;
            }
        }
        this.CompareValues = function (val1, val2) {
            return val1 == val2 ? 0 : 1;
        }
        this.GetUIValue = function (self) {
            return function (ele) { return self.GetValue(ele); }
        } (this);
        this.ApplyValue = function (ele, value) {
            var node = oldValue;
            while (node) {
                var p = node.GetParent();
                if (!p) break;
                var e = node.GetElement();
                if (e) e.className = style.classUnselectedNode;
                node = p;
            }
            oldValue = value;
            node = oldValue;
            while (node) {
                var p = node.GetParent();
                if (!p) break;
                var e = node.GetElement();
                if (e) e.className = oldValue == node ? style.classCurrentNode : style.classSelectedNode;
                node = p;
            }
        }
    }
}
