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
                            e.title = d[style.displayMember];
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
                                if (src == unfold) {
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
            return 1;
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
                                if (find) self.SetValue(ele, [list]);
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
                    et.title = value[i][displayMember];
                    ec.title = "删除选项:" + value[i][displayMember];
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
window.forms.FilterableCheckboxListConv = function (style) {
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
    window.forms.CheckboxListConv.apply(this,[filter,style]);
};
window.forms.FloatListConv = function (style) {
    window.forms.ListValueConv.apply(this, [style]);
    this.GetUIValue = this.GetValue;
    var mnu;
    var applyValue = this.ApplyValue;
    this.ApplyValue = function (ele, value) {
        if (style) {
            if (!ele.getAttribute("displayMember")) ele.setAttribute("displayMember", style.displayMember);
        }
        applyValue(ele, value);
    };
    this.ApplyItem = function (self) {
        return function (ele, list, index) {
            if (index == -1) {
                if (!mnu) {
                    var body = window.forms.Element(ele).GetBody();
                    var srcEle = document.getElementById(style.src + "") || body;
                    var showEvent = style.event || "contextmenu";
                    var handler = style.handler || {
                        "*": function () {
                        }
                    };
                    var menuRef = ele.ownerDocument.createElement('div');
                    menuRef.style.height = '0px';
                    menuRef.style.width = 'inherit';
                    ele.appendChild(menuRef);
                    mnu = new Menu(menuRef, style);
                    var hide = mnu.Hide;
                    var show = mnu.Show;
                    mnu.Hide = function () {
                        window.forms.Event.UnhookMouseEvent(ele, "mousedown");
                        hide();
                    };
                    mnu.Show = function () {
                        show();
                        window.forms.Event.HookMouseEvent(ele, "mousedown",
                            function (f) {
                                if (f) {
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
                            });
                    };
                    window.forms.Event.Register(srcEle, showEvent, function (e) {
                        var ev = e || window.event;
                        ev.preventDefault();
                        var x = ev.clientX - body.scrollLeft,
                            y = ev.clientY - body.scrollTop;
                        menuRef.style.position = 'fixed';
                        menuRef.style.left = x + 'px';
                        menuRef.style.top = y + 'px';
                        mnu.Show();
                    });
                    mnu.drawRow = function (doc, e, ri, d, style) {
                        e.className = style.classItem;
                        e.title = d[style.displayMember];
                        e.style.cursor = 'pointer';
                        window.forms.Element(e).SetText(d[style.displayMember]);
                        e.onclick = function () {
                            var fn = handler[d[style.displayMember]] || handler['*'];
                            if (typeof fn === 'function') {
                                fn(e, d);
                            }
                            mnu.Hide();
                        }
                    }
                }
                mnu.Clear();
            }
            else {
                mnu.Add(list[index]);
            }
        }
    }(this);
};
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
window.forms.CheckboxButtonListConv = function (style) {
    window.forms.TileListConv.apply(this, [style]);
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
                    var label = root.ownerDocument.createElement('span');
                    var text = root.ownerDocument.createElement('span');
                    e.style.cursor = 'pointer';
                    e.style.display = label.style.display = 'inline-block';
                    label.style.width = label.style.height = '16px';
                    label.style.boxSizing = 'border-box';
                    e.appendChild(label);
                    e.appendChild(text);
                    e.onclick = function (e) {
                        return function () {
                            e.__selected = !e.__selected;
                            var form = formCallCenter.DetectFormByElement(root);
                            var field = root.getAttribute('field');
                            var conv = form.GetConverter(root);
                            form.SetField(field,[conv.GetUIValue(root)]);
                            if(typeof style.currItemCheckChanged === 'function') style.currItemCheckChanged({
                                status:e.__selected,
                                data:e.__currData
                            })
                        }
                    } (e);
                    root.appendChild(e);
                }
            }
            else {
                var e = root.children[index];
                var text = e.children[1];
                if (e.__currData == list[index]) return;
                e.className = style.classItem;
                e.__currData = list[index];
                window.forms.Element(text).SetText(list[index][root.getAttribute("displayMember")]);
                setStyle(style,e,e.children[0],e.children[1],false);
            }
        }
    } (this);
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.CheckboxButtonListConv.ItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return window.forms.Form.InheritAttributes(srcElement, desElement);
    }
    window.forms.CheckboxButtonListConv.ItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.CompareValues = function (val1, val2) {
            return window.forms.object.Compare(val1,val2)===0 ? 0 : 1;
        };
        this.GetUIValue = this.GetValue = function (ele) {
            var val = [];
            for (var i = 0; i < ele.children.length; i++) {
                var e = ele.children[i];
                if (e.__selected) val[val.length] = e.__currData;
            }
            return val;
        };
        this.ApplyValue = function (ele, val) {
            var len = !val || !val.length ? 0 : val.length;
            var temp = {};
            for (var j = 0; j < len; j++) {
                temp[val[j][style.valueMember]] = true;
            }
            for (var i = 0; i < ele.children.length; i++) {
                var e = ele.children[i];
                var curr = e.__currData[style.valueMember];
                e.__selected = !!temp[curr];
                var label = e.children[0];
                var text = e.children[1];
                setStyle(style, e, label, text, e.__selected);
            }
        };
    }
    function setStyle(style,e,label,text,selected) {
        if(selected){
            label.style.backgroundColor = '#000';
            label.style.border = Math.floor(label.offsetWidth/3) + "px solid #ccc";
            e.className = style.classSelectedItem;
            label.className = style.classSelectedLabel;
            text.className = style.classSelectedText;
        }else {
            label.style.backgroundColor = "#fff";
            label.style.border = '1px solid #ccc';
            e.className = style.classUnselectedItem;
            label.className = style.classUnselectedLabel;
            text.className = style.classUnselectedText;
        }
    }
};
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
window.forms.PaginatorConv = function (style) {
    window.forms.SingleValueConv.apply(this);
    this.DecodeArguments = function(ele, args) {
        return args[0]||{};
    };
    this.GetUIValue = this.GetValue = function(ele) {
        if(ele.__pInfo){
            ele.__pInfo['PageIndex'] = ele.__pInfo['PageIndex']||1;
            ele.__pInfo['PageSize'] = ele.__pInfo['PageSize']||0;
            ele.__pInfo['TotalCount'] = ele.__pInfo['TotalCount']||0;
            return JSON.parse(ele.__pInfo.getJsonRaw());
        }
        return ele.__pInfo;
    };
    this.ApplyValue = function(ele, val) {
        var doc = ele.ownerDocument;
        ele.__pInfo = ele.__pInfo||{};
        ele.__pInfo['PageIndex'] = +val['PageIndex']||1;
        ele.__pInfo['PageSize'] = +val['PageSize']||0;
        ele.__pInfo['TotalCount'] = +val['TotalCount']||0;
        if(!ele.__paginator){
            var form = formCallCenter.DetectFormByElement(ele);
            var firstPage = doc.createElement('div');
            firstPage.innerHTML = style.firstPageText || '首页';
            firstPage.style.display = 'inline-block';
            firstPage.style.margin = '0 6px';
            firstPage.style.cursor = 'pointer';
            firstPage.setAttribute('class', style.classButton);
            firstPage.onclick = function() { PageJump("first"); };
            ele.appendChild(firstPage);
            var prePage = doc.createElement('div');
            prePage.innerHTML = style.prePageText || '上一页';
            prePage.style.display = 'inline-block';
            prePage.style.margin = '0 6px';
            prePage.style.cursor = 'pointer';
            prePage.setAttribute('class', style.classButton);
            prePage.onclick = function() { PageJump("pre"); };
            ele.appendChild(prePage);
            var pageCountShow = doc.createElement('div');
            pageCountShow.style.display = 'inline-block';
            pageCountShow.style.margin = '0 6px';
            ele.__pageCountShow = pageCountShow;
            ele.appendChild(pageCountShow);
            var nextPage = doc.createElement('div');
            nextPage.innerHTML = style.nextPageText || '下一页';
            nextPage.style.display = 'inline-block';
            nextPage.style.margin = '0 6px';
            nextPage.style.cursor = 'pointer';
            nextPage.setAttribute('class', style.classButton);
            nextPage.onclick = function() { PageJump("next"); };
            ele.appendChild(nextPage);
            var lastPage = doc.createElement('div');
            lastPage.innerHTML = style.lastPageText || '尾页';
            lastPage.style.display = 'inline-block';
            lastPage.style.margin = '0 6px';
            lastPage.style.cursor = 'pointer';
            lastPage.setAttribute('class', style.classButton);
            lastPage.onclick = function() { PageJump("last"); };
            ele.appendChild(lastPage);
            var jumpToContainer=doc.createElement('div');
            jumpToContainer.style.display = 'inline-block';
            jumpToContainer.style.margin = '0 6px';
            jumpToContainer.style.textAlign = 'center';
            var jumpToInput = doc.createElement('input');
            jumpToInput.style.display = 'inline-block';
            jumpToInput.style.margin = '0 3px';
            jumpToInput.style.width = '36px';
            jumpToInput.style.textAlign = 'center';
            jumpToInput.onkeyup = function (ev) {if((ev||window.event).keyCode === 13){
                if(this.__lastChange && new Date().getTime() - this.__lastChange < 1000)return;
                PageJump("jump", this.value);this.value='';
                this.__lastChange = new Date().getTime();
            }};
            jumpToContainer.appendChild(jumpToInput);
            var jumpToBtn = doc.createElement('div');
            jumpToBtn.innerHTML = style.jumpToBtnText || '跳转';
            jumpToBtn.style.display = 'inline-block';
            jumpToBtn.style.margin = '0 3px';
            jumpToBtn.style.cursor = 'pointer';
            jumpToBtn.setAttribute('class', style.classButton);
            jumpToBtn.onclick = function(e) {PageJump("jump", jumpToInput.value);jumpToInput.value='';};
            jumpToContainer.appendChild(jumpToBtn);
            ele.appendChild(jumpToContainer);
            var pageSizeShowContainer = doc.createElement('div');
            pageSizeShowContainer.style.display = 'inline-block';
            pageSizeShowContainer.style.margin = '0 6px';
            var pageSizeShowLabel = doc.createElement('span');
            pageSizeShowLabel.innerText = "每页";
            pageSizeShowContainer.appendChild(pageSizeShowLabel);
            var pageSizeShow = doc.createElement('input');
            pageSizeShow.style.display = 'inline-block';
            ele.__pageSizeShow = pageSizeShow;
            pageSizeShowContainer.appendChild(pageSizeShow);
            var pageSizeShowLabel1 = doc.createElement('span');
            pageSizeShowLabel1.innerText = "条";
            pageSizeShowContainer.appendChild(pageSizeShowLabel1);
            ele.appendChild(pageSizeShowContainer);
            pageSizeShow.style.display = 'inline-block';
            pageSizeShow.style.margin = '0 6px';
            pageSizeShow.style.width = '36px';
            pageSizeShow.style.textAlign = 'center';
            pageSizeShow.onchange =function (ev) {
                if(this.__lastChange && new Date().getTime() - this.__lastChange < 1000)return;
                ele.__pInfo['PageSize']= +this.value||1;
                PageJump('first');
                this.__lastChange = new Date().getTime();
            };
            pageSizeShow.onkeyup =function (ev) {
                if(this.__lastChange && new Date().getTime() - this.__lastChange < 1000)return;
                if((ev||window.event).keyCode === 13){
                    ele.__pInfo['PageSize']= +this.value||1;
                    PageJump('first');
                    this.__lastChange = new Date().getTime();
                }
            };
            function PageJump(code,index) {
                var totalPage = Math.ceil(ele.__pInfo['TotalCount'] / ele.__pInfo['PageSize'])||1;
                switch (code) {
                    case "first":
                        index = 1;
                        break;
                    case "pre":
                        index = ele.__pInfo['PageIndex'] - 1;
                        if (index < 1) index = 1;
                        break;
                    case "next":
                        index = ele.__pInfo['PageIndex'] + 1;
                        if (index > totalPage) index = totalPage;
                        break;
                    case "last":
                        index = totalPage;
                        break;
                    case "jump":
                        if (isNaN(index)) index = 1;
                        if (index < 1) index = 1;
                        if (index > totalPage) index = totalPage;
                        break;
                }
                var pageInfo = {};
                pageInfo['PageIndex'] = index;
                pageInfo['PageSize'] = ele.__pInfo['PageSize'];
                pageInfo['TotalCount'] = ele.__pInfo['TotalCount'];
                var fieldName = ele.getAttribute('field');
                form.SetField(fieldName, [pageInfo], true);
                if(typeof style.onPageInfoChange === 'function'){
                    style.onPageInfoChange(pageInfo);
                }
            }
            ele.__paginator = true;
        }
        var totalPage = Math.ceil(ele.__pInfo['TotalCount'] / (ele.__pInfo['PageSize']||1))||1;
        ele.__pageCountShow.innerText = ele.__pInfo['PageIndex'] + "/" + totalPage;
        ele.__pageSizeShow.value = +ele.__pInfo['PageSize']||1;
    };
};
window.forms.GroupListConv = function (style) {
    window.forms.ListValueConv.apply(this);
    var self = this;
    var root,form;
    this.DetermineApply = function (self) {
        return true;
    } ;
    this.ApplyValue = function (ele, val) {
        form = form ||formCallCenter.DetectFormByElement(ele);
        if(!root){
            root=ele.ownerDocument.createElement('div');
            root.__BirthTime = new Date().getTime() + "";
            ele.appendChild(root);
            self.InheritProperties(ele,ele.children[0]);
        }else {
            root = ele.children[0];
        }
        for(var j=root.children.length-1;j>val.length-1;j--){
            root.removeChild(root.children[j]);
        }
        for(var c=root.children.length;c<val.length;c++){
            var box = root.ownerDocument.createElement('div');
            var title = root.ownerDocument.createElement('div');
            var content=root.ownerDocument.createElement('div');
            box.appendChild(title);
            box.appendChild(content);
            root.appendChild(box);
        }
        var itemDataMember = root.__itemDataMember = style.itemDataMember||'itemData';
        for(var i = 0;i < val.length;i++){
            var container = root.children[i];
            var groupTitle = container.children[0];
            groupTitle.className = style.classTitle;
            var groupContent = container.children[1];
            groupContent.className = style.classContent;
            groupTitle.innerText = val[i][style.displayMember];
            groupTitle.__bindedData = val[i];
            var field = val[i][style.valueMember]+ itemDataMember + root.__BirthTime;
            var itemField = 'Curr'+ field;
            groupContent.setAttribute('field',field);
            groupContent.setAttribute('localField','true');
            groupContent.setAttribute('itemField',itemField);
            groupContent.setAttribute('itemLocalField','true');
            groupContent.setAttribute('conv',style.itemConv);
            form.SetField(field,[val[i][itemDataMember]]);
            if(typeof style.drawGroup === 'function'){
                style.drawGroup(field,itemField,groupTitle,groupContent)
            }
        }
    };
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.GroupListConv.ItemConv(" + (style ? style.getJsonRaw() : null) + ")");
        return inherit(srcElement, desElement);
    };
    window.forms.GroupListConv.ItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.GetUIValue = this.GetValue = function (ele) {
            var res =[];
            for(var i=0;i<ele.children.length;i++){
                var groupTitle= ele.children[i].children[0].__bindedData;
                var groupContent = ele.children[i].children[1];
                var info = {};
                info[style.valueMember] = groupTitle[style.valueMember];
                info[style.displayMember] = groupTitle[style.displayMember];
                info[ele.__itemDataMember]  = form.GetField(groupContent.getAttribute('itemField'));
                res.push(info);
            }
            return res;
        };
        this.ApplyValue = function (ele, val) {
            form = form ||formCallCenter.DetectFormByElement(ele);
            var val = val||[];
            for(var i=0;i<val.length;i++){
                form.SetField('Curr'+val[i][style.valueMember]+ele.__itemDataMember + ele.__BirthTime,[val[i][ele.__itemDataMember]]);
            }
        }
    };
};
window.forms.CloseableTileListConv = function (style) {
    window.forms.TileListConv.apply(this,arguments);
    this.DetermineApply = function (self) {
        return true;
    };
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
                    e.style.position = 'relative';
                    var text = root.ownerDocument.createElement('div');
                    var closeBtn = root.ownerDocument.createElement('div');
                    closeBtn.innerText = 'X';
                    text.style.display = closeBtn.style.display = 'inline-block';
                    text.style.width = text.style.height = '100%';
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.right = '0';
                    closeBtn.style.top = '0';
                    closeBtn.className = style.classCloseBtn;
                    e.appendChild(text);
                    e.appendChild(closeBtn);
                    text.onclick = function () {
                        var field = root.getAttribute("field");
                        if (!field || field == "") return;
                        var form = formCallCenter.DetectFormByElement(root);
                        form.SetField(field, [this.parentElement.__currData], true);
                    };
                    closeBtn.onclick = function (closeBtn) {
                        return function () {
                            var target = window.forms.Event().Source();
                            if(target === closeBtn){
                                var title = closeBtn.parentElement;
                                var titleData = title.__currData;
                                var field = root.getAttribute("field");
                                if (!field || field == "") return;
                                var form = formCallCenter.DetectFormByElement(root);
                                var currData = form.GetField(field);
                                for(var i = 0;i<list.length;i++){
                                    if(list[i][style.valueMember]===titleData[style.valueMember]){
                                        list.splice(i,1);
                                        form.SetField(ele.getAttribute('field'),[list]);
                                        break;
                                    }
                                }
                                if(titleData[style.valueMember] === currData[style.valueMember]){
                                    var newData = root.lastElementChild.__currData;
                                    newData && form.SetField(field, [newData],true);
                                }else {
                                    form.SetField(field, [currData],true);
                                }
                            }
                        }
                    }(closeBtn);
                    root.appendChild(e);
                }
            }
            else {
                var e = root.children[index];
                e.className = style.classUnselectedItem;
                e.__currData = list[index];
                window.forms.Element(e.children[0]).SetText(list[index][root.getAttribute("displayMember")]);
                if(typeof style.drawTitle === 'function') style.drawTitles(e,e.__currData,style);
            }
        }
    } (this);
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.CloseableTileListConv.TileListItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.CloseableTileListConv.TileListItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.DetermineApply = function () {
            return true;
        };
        this.GetUIValue = function (self) {
            return function (ele) { return self.GetValue(ele); }
        } (this);
        this.ApplyValue = function (ele, value) {
            for (var i = 0; i < ele.children.length; i++) {
                ele.children[i].className = ele.children[i].__currData[style.valueMember]==value[style.valueMember] ? style.classSelectedItem : style.classUnselectedItem;
            }
        }
    }
};
window.forms.ReadonlyListValueConv = function (style) {
    window.forms.ListValueConv.apply(this);
    this.ApplyValue = (function(self){
        return function (ele, val) {
            if(ele.children.length === 0){
                var text = ele.ownerDocument.createElement('div');
                ele.appendChild(text);
                self.InheritProperties(ele,text);
            }
        };
    })(this);
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.ReadonlyListValueConv.ItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    };
    window.forms.ReadonlyListValueConv.ItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.ApplyValue = function (ele, val) {
            if(val){
                if(val[style.displayMember]){
                    window.forms.Element(ele).SetText(val[style.displayMember]);
                }else {
                    if(val[style.valueMember]){
                        var form = formCallCenter.DetectFormByElement(ele.parentElement);
                        if(form){
                            var conv = form.GetConverter(ele.parentElement);
                            if(conv){
                                var list = conv.GetValue(ele.parentElement)||[];
                                for(var i =0;i<list.length;i++){
                                    if(list[i][style.valueMember] === val[style.valueMember]){
                                        window.forms.Element(ele).SetText(list[i][style.displayMember]);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

FIISForm.CheckboxListConv = function (style, decode) {
    window.forms.CheckboxListConv.apply(this, [null, style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
FIISForm.FilterableCheckboxListConv = function (style,decode) {
    window.forms.FilterableCheckboxListConv.apply(this,[style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
FIISForm.FloatListConv = function () {
    window.forms.FloatListConv.apply(this,arguments);
    FIISForm.FIISValueDecoder.apply(this);
};
FIISForm.RadioButtonListConv = function (decode) {
    window.forms.RadioButtonListConv.apply(this, arguments);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
FIISForm.CheckboxButtonListConv = function () {
    window.forms.CheckboxButtonListConv.apply(this,arguments);
    FIISForm.FIISValueDecoder.apply(this);
};
FIISForm.TableViewConv = function (decode) {
    window.forms.TableViewConv.apply(this, arguments);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
FIISForm.GroupListConv = function (style,decode) {
    window.forms.GroupListConv.apply(this,[style]);
    FIISForm.FIISValueDecoder.apply(this,[decode]);
};
FIISForm.PathValueSupportedTableConv = function (style, decode) {
    FIISForm.TableViewConv.apply(this,arguments);
    var decodeArgs = this.DecodeArguments;
    this.DecodeArguments=function (ele,value) {
        value = decodeArgs(ele,value);
        var valueMember = ele.getAttribute("itemValueMember");
        if(valueMember&&value){
            for (var i=0;i<value.length;i++){
                value[i][valueMember]=GetPathData(value[i],valueMember);
            }
        }
        return value;
    };
    this.drawContentCell = function(doc, e, ri, r, ci, c, style) {
        window.forms.Element(e).SetText(GetPathData(r,c.Name));
    };
    function GetPathData(data,path){
        if(!data||!path||!path.length)return data;
        var ps = path.split('.');
        for(var i=0;i<ps.length;i++){
            data=data[ps[i]];
            if(!data)break;
        }
        return data;
    }
};
FIISForm.ReadonlyListValueConv = function (style,decode) {
    window.forms.ReadonlyListValueConv.apply(this,[style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};


var components = components || {};
components.navTabs = function (tabBox,defaultTab,style,doc) {
    if(tabBox instanceof HTMLElement){
        style = style||{};
        if(style.defaultView && (style instanceof style.defaultView.HTMLDocument)){
            var temp = style;
            style = doc;
            doc = temp;
        }
        doc = doc||document;
        var tabs = tabBox.children,tab,targetID,target;
        for(var i =0,l=tabs.length;i<l;i++){
            tab = tabs[i];
            targetID = tab.getAttribute('target');
            target = doc.getElementById(targetID);
            if(target){
                target.style.overflow = 'hidden';
                target.style.transition = 'opacity 1000ms';
                if(targetID === defaultTab){
                    show(target,tab);
                }else {
                    hide(target,tab);
                }
            }
        }
        window.forms.Event.Unregister(tabBox,'click',pageTrigger);
        window.forms.Event.Register(tabBox,'click',pageTrigger);
        function pageTrigger() {
            var tab = window.forms.Event().Source();
            var targetID = tab.getAttribute('target');
            var target = doc.getElementById(targetID);
            if(target){
                show(target,tab);
            }
        }
        function hide(page,tab) {
            page.style.height = '0';
            page.style.opacity = '0';
            tab.style.fontWeight = 'inherit';
            tab.className = (tab.className + "").replace(" "+style.classUnselectedTab,"");
            tab.className = (tab.className + "").replace(" "+style.classSelectedTab,"");
            tab.className += " "+style.classUnselectedTab;
        }
        function show(page,tab) {
            if(tabBox.__CurrPage){
                hide(tabBox.__CurrPage, tabBox.__CurrTab);
            }
            page.style.height = null;
            page.style.opacity = '';
            tab.style.fontWeight = '600';
            tab.className = (tab.className + "").replace(" "+style.classUnselectedTab,"");
            tab.className = (tab.className + "").replace(" "+style.classSelectedTab,"");
            tab.className += " "+style.classSelectedTab;
            tabBox.__CurrPage = page;
            tabBox.__CurrTab = tab;
        }
    }
};
components.messageBox = function (msg,type,style,doc) {
    style = style||{};
    if(style.defaultView && (style instanceof style.defaultView.HTMLDocument)){
        var temp = style;
        style = doc;
        doc = temp;
    }
    doc = doc||window.top.document;
    if(doc.__messageBox){hide(doc.__messageBox)}
    var box = doc.createElement('div');
    doc.__messageBox = box;
    doc.body.appendChild(box);
    box.style.right = style.right||'6px';
    box.style.bottom = style.bottom||'6px';
    box.style.minWidth = style.width || '220px';
    box.style.height = '54px';
    box.style.lineHeight = '54px';
    box.style.padding = '0 12px';
    box.style.borderRadius = '3px';
    box.style.color = '#fff';
    box.style.position = 'fixed';
    box.style.overflow = 'hidden';
    box.style.transition = 'opacity 1000ms';
    box.className = style.classContainer;
    box.innerHTML = msg;
    box.title = msg;
    switch (type){
        case 'warn':
            box.style.backgroundColor = '#FF832A';
            break;
        case 'error':
            box.style.backgroundColor = '#CA5E59';
            break;
        case 'succ':
        default:
            box.style.backgroundColor = '#73B573';
            break;
    }
    var timmer = doc.defaultView.setTimeout(function () { hide(box) },2500);
    box.onmouseenter = function () {doc.defaultView.clearTimeout(timmer);};
    box.onmouseleave = function () { hide(box) };
    function hide(box) {
        box.style.opacity = '0';
        doc.defaultView.setTimeout(function () { try {doc.body.removeChild(box);}catch (e){}},6000);
    }
}
var $cookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys:function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
};