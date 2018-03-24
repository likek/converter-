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
                        e.title = d[style.displayMember];
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
            var text = value ? value[displayMember] : "";
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
                        if (typeof (style.drawContentCell) == "function") style.drawHeaderCell(doc, e, ci, c, style);
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