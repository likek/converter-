window.forms.CheckboxlistViewConv = function (filter, style) {
    window.forms.ListValueConv.apply(this, [style]);
    var mnu;
    var applyValue = this.ApplyValue;
    this.ApplyValue = function (ele, value) {
        if (style) {
            if (!ele.getAttribute("displayMember")) ele.setAttribute("displayMember", style.displayMember);
            if (!ele.getAttribute("valueMember")) ele.setAttribute("valueMember", style.valueMember);
        }
        applyValue(ele, value);
    };
    this.ApplyItem = function (self) {
        return function (ele, list, index) {
            if (index == -1) {
                if (!mnu) {
                    var container = ele.ownerDocument.createElement('div');
                    ele.appendChild(container);
                    container.style.height = "100%";
                    container.style.width = "100%";
                    ele.style.overflowY = 'visible';

                    var txtContainer = ele.ownerDocument.createElement('div');
                    txtContainer.style.height = '100%';
                    txtContainer.style.borderColor = 'inherit';
                    container.appendChild(txtContainer);
                    txtContainer.className = style.classText;

                    var txt = ele.ownerDocument.createElement("input");
                    var size = parseInt(txtContainer.offsetHeight / 4, 10);
                    txt.setAttribute("readonly", true);
                    txt.type = "text";
                    txt.style.font = "inherit";
                    txt.style.color = "inherit";
                    txt.style.width = txtContainer.offsetWidth -  4*size + 'px';
                    txt.style.height = '100%';
                    txt.style.border = "none";
                    txt.style.outline = "none";
                    txt.style.boxSizing = "border-box";
                    txtContainer.appendChild(txt);
                    var unfold = ele.ownerDocument.createElement("div");
                    unfold.style.cursor = "pointer";
                    unfold.style.borderStyle = "solid";
                    unfold.style.borderColor = "inherit";
                    unfold.className = style.classDropDown;
                    unfold.style.width = 0;
                    unfold.style.height = 0;
                    unfold.borderWidth = size + "px";
                    unfold.style.borderLeft = size + "px solid transparent";
                    unfold.style.borderRight = size + "px solid transparent";
                    unfold.style.borderTopWidth = size + "px";
                    unfold.style.borderBottom = "0px";
                    unfold.style.display = "inline-block";
                    unfold.style.cssFloat = 'right';
                    unfold.style.margin = 1.5*size + "px " + size + "px 0 0";
                    txtContainer.appendChild(unfold);
                    ele.__txtContainer = txtContainer;
                    if (typeof filter === 'function') {
                        var filterContainer = ele.ownerDocument.createElement('div');
                        filterContainer.className = style.classFilterInput;
                        filterContainer.style.boxSizing = 'border-box';
                        filterContainer.style.display = 'none';
                        filterContainer.style.position = 'relative';

                        var eleBounds = window.forms.Element(ele).GetBounds();
                        var body = window.forms.Element(ele).GetBody();
                        var bodyBounds = window.forms.Element(body).GetBounds();

                        var h1 = eleBounds.y - bodyBounds.y;
                        var h2 = bodyBounds.height - (eleBounds.y + eleBounds.height);
                        var filterInput = ele.ownerDocument.createElement('input');
                        filterInput.type = "text";
                        filterInput.style.border = 'none';
                        filterInput.style.outline = 'none';
                        filterInput.style.font = "inherit";
                        filterInput.style.color = "inherit";
                        filterInput.style.width = '100%';
                        filterInput.style.height = '100%';
                        filterInput.placeholder = '检索';
                        filterInput.style.boxSizing = 'border-box';
                        filterInput.style.position = 'absolute';
                        filterInput.style.top = '0';
                        filterInput.style.left = '0';
                        filterContainer.appendChild(filterInput);

                        container.style.height = container.offsetHeight * 2 + "px";
                        filterContainer.style.height = "50%";
                        txtContainer.style.height = "50%";
                        filterContainer.style.border = ele.style.border;
                        txtContainer.style.border = ele.style.border;
                        ele.style.border = 'none';

                        if(h1<=h2){//向下
                            container.appendChild(filterContainer);
                            filterContainer.style.borderTop = 'none';
                        }else {//向上
                            container.insertBefore(filterContainer,container.children[0]);
                            filterContainer.style.marginTop = - ele.offsetHeight + "px";//??
                            filterContainer.style.borderBottom = 'none';
                        }
                    }
                    mnu = txtContainer.__menu = new Menu(container, style);
                    var hide = mnu.Hide;
                    var show = mnu.Show;
                    mnu.Hide = function () {
                        window.forms.Event.UnhookMouseEvent(ele, "mousedown");
                        hide();
                        if (typeof filter === 'function') filterContainer.style.display = "none";
                    };
                    mnu.Show = function () {
                        if (typeof filter === 'function') filterContainer.style.display = "";
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
                                    if (sur == e || (typeof filter === 'function' && sur == filterContainer)) return false;
                                    sur = sur.parentNode;
                                }
                                return true;
                            })
                    };
                    mnu.drawRow = function (doc, e, ri, d, style) {
                        if (e.__hasDrawed) return;
                        e.style.cursor = "pointer";
                        e.title = d[style.displayMember];
                        var label = ele.ownerDocument.createElement('span');
                        var desc = ele.ownerDocument.createElement('span');
                        label.style.display = 'inline-block';
                        label.style.boxSizing = 'border-box';
                        label.style.width = '12px';
                        label.style.height = '12px';
                        label.style.margin = '0 6px';
                        e.appendChild(label);
                        e.appendChild(desc);
                        window.forms.Element(desc).SetText(d[style.displayMember]);
                        if (txtContainer.__selectedData instanceof Array && getItemMemberByValue(txtContainer.__selectedData, style.valueMember, d[style.valueMember])) {
                            e.__selected = true;
                            setStyle("selected",e,label,desc);
                        } else {
                            e.__selected = false;
                            setStyle("unselected",e,label,desc);
                        }
                        e.onclick = function () {
                            e.__selected = !e.__selected;
                            if (e.__selected) {
                                currDataRefresh(d, 'push');
                                setStyle("selected",e,label,desc);
                            } else {
                                currDataRefresh(d, 'Remove');
                                setStyle("unselected",e,label,desc);
                            }
                        };
                        function setStyle(mode,e,label,desc) {
                            switch (mode) {
                                case "selected":
                                    label.style.backgroundColor = '#000';
                                    label.style.border = '3px solid #ccc';
                                    e.className = style.classSelectdItem;
                                    label.className = style.classSelectedLabel;
                                    desc.className = style.classSelectedText;
                                    break;
                                case "unselected":
                                    label.style.backgroundColor = "#fff";
                                    label.style.border = '1px solid #ccc';
                                    e.className = style.classUnselectdItem;
                                    label.className = style.classUnselectedLabel;
                                    desc.className = style.classUnelectedText;
                                    break;
                            }
                        }
                        e.__hasDrawed = true;
                    };
                    txtContainer.onclick = function () {
                        if (!mnu.Visible()) {
                            mnu.Clear();
                            var data = self.GetValue(ele);
                            if (!data || !data.length) return;
                            for (var i = 0; i < data.length; i++) {
                                if(typeof filter === 'function'){
                                    if (filter(data[i], filterInput.value)) mnu.Add(data[i]);
                                }else {
                                    mnu.Add(data[i]);
                                }
                            }
                            mnu.Show();
                        }
                    };

                    if (typeof filter === 'function') {
                        filterInput.onkeyup = function () {
                            if (filterInput.__keyupLastTrigger !== void 0) {
                                clearTimeout(filterInput.__keyupLastTrigger)
                            }
                            filterInput.__keyupLastTrigger = setTimeout(function () {//已经输完
                                mnu.Clear();
                                var data = self.GetValue(ele);
                                if (data) {
                                    for (var i = 0; i < data.length; i++) {
                                        if (filter(data[i], filterInput.value)) mnu.Add(data[i]);
                                    }
                                }
                                mnu.Show();
                            }, 200);
                        }
                    }

                    function currDataRefresh(data, mode) {
                        var valueMember = ele.getAttribute('valueMember');
                        var displayMember = ele.getAttribute('displayMember');
                        txtContainer.__selectedData = txtContainer.__selectedData || [];
                        txtContainer.__displayText = txtContainer.__displayText || [];
                        var idx = -1;
                        for (var i = 0; i < txtContainer.__selectedData.length; i++) {
                            if (txtContainer.__selectedData[i][valueMember] + "" === data[valueMember]) {
                                idx = i;
                                break;
                            }
                        }
                        switch (mode) {
                            case 'push': {
                                if (idx === -1) {
                                    txtContainer.__selectedData.push(data);
                                    txtContainer.__displayText.push(data[displayMember]);
                                }
                            }
                                break;
                            case 'Remove': {
                                if (idx !== -1) {
                                    txtContainer.__selectedData.splice(idx, 1);
                                    txtContainer.__displayText.splice(idx, 1);
                                }
                            }
                        }
                        var textDisplay = txtContainer.__displayText.slice().join(',');
                        window.forms.Element(txt).SetText(textDisplay);
                        txtContainer.title = textDisplay;
                        var form = formCallCenter.DetectFormByElement(ele);
                        form.SetField(txtContainer.getAttribute('field'),[txtContainer.__selectedData])
                    }

                    function getItemMemberByValue(list, member, value) {
                        for (var i = 0; i < list.length; i++) {
                            if (list[i][member] + "" === value + "") {
                                return list[i];
                            }
                        }
                        return null;
                    }
                }
                mnu.Clear();
            }
            else {
                if (index == 0) {
                    self.InheritProperties(ele, ele.__txtContainer);
                }
                mnu.Add(list[index]);
            }
        }
    }(this);
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.CheckboxlistViewConv.ItemValueConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        window.forms.Form.InheritAttributes(srcElement, desElement);
    };
    window.forms.CheckboxlistViewConv.ItemValueConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.DetermineApply = function (self) {
            return function (ele, val) {
                return self.CompareValues(val, self.GetValue(ele.parentElement.parentElement)) != 0;
            }
        } (this);
        this.GetUIValue = function (ele) {
            return ele.__selectedData.slice() || [];
        };
        this.ApplyValue = function (ele, value) {
            var displayMember = ele.getAttribute("displayMember");
            var text = [];
            if(value instanceof Array){
                for(var i = 0,l=value.length;i<l;i++){
                    text.push(value[i][displayMember])
                }
            }
            ele.__displayText = text;
            text = text.slice().join(',');
            window.forms.Element(ele.children[0]).SetText(text);
            ele.title = text;
            ele.__selectedData = value;
        }
    };
};
window.forms.FilterableCheckboxlistViewConv = function (style) {
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
    window.forms.CheckboxlistViewConv.apply(this,[filter,style]);
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

/*分页conv*/
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
            //“首页”按钮
            var firstPage = doc.createElement('div');
            firstPage.innerHTML = style.firstPageText || '首页';
            firstPage.style.display = 'inline-block';
            firstPage.style.margin = '0 6px';
            firstPage.style.cursor = 'pointer';
            firstPage.setAttribute('class', style.classButton);
            firstPage.onclick = function() { PageJump("first"); };
            ele.appendChild(firstPage);
            //“上一页”按钮
            var prePage = doc.createElement('div');
            prePage.innerHTML = style.prePageText || '上一页';
            prePage.style.display = 'inline-block';
            prePage.style.margin = '0 6px';
            prePage.style.cursor = 'pointer';
            prePage.setAttribute('class', style.classButton);
            prePage.onclick = function() { PageJump("pre"); };
            ele.appendChild(prePage);
            //“当前页/总页数”显示
            var pageCountShow = doc.createElement('div');
            pageCountShow.style.display = 'inline-block';
            pageCountShow.style.margin = '0 6px';
            ele.__pageCountShow = pageCountShow;
            ele.appendChild(pageCountShow);
            //“下一页”按钮
            var nextPage = doc.createElement('div');
            nextPage.innerHTML = style.nextPageText || '下一页';
            nextPage.style.display = 'inline-block';
            nextPage.style.margin = '0 6px';
            nextPage.style.cursor = 'pointer';
            nextPage.setAttribute('class', style.classButton);
            nextPage.onclick = function() { PageJump("next"); };
            ele.appendChild(nextPage);
            //“尾页”按钮
            var lastPage = doc.createElement('div');
            lastPage.innerHTML = style.lastPageText || '尾页';
            lastPage.style.display = 'inline-block';
            lastPage.style.margin = '0 6px';
            lastPage.style.cursor = 'pointer';
            lastPage.setAttribute('class', style.classButton);
            lastPage.onclick = function() { PageJump("last"); };
            ele.appendChild(lastPage);
            //“跳转页码”输入框
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
            //“跳转”按钮
            var jumpToBtn = doc.createElement('div');
            jumpToBtn.innerHTML = style.jumpToBtnText || '跳转';
            jumpToBtn.style.display = 'inline-block';
            jumpToBtn.style.margin = '0 3px';
            jumpToBtn.style.cursor = 'pointer';
            jumpToBtn.setAttribute('class', style.classButton);
            jumpToBtn.onclick = function(e) {PageJump("jump", jumpToInput.value);jumpToInput.value='';};
            jumpToContainer.appendChild(jumpToBtn);
            ele.appendChild(jumpToContainer);
            //显示“页大小”信息
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
    this.ApplyValue = function (ele, val) {
        form = form ||formCallCenter.DetectFormByElement(ele);
        if(!root){
            root=ele.ownerDocument.createElement('div');
            root.__CurrTimestamps = new Date().getTime() + "";
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
        var itemDataMember = root.__itemDataMember = style.itemDataMember||'itemData';//itemDataMember可能会变所以每次都重新获取
        for(var i = 0;i < val.length;i++){
            var container = root.children[i];
            var groupTitle = container.children[0];
            groupTitle.className = style.classTitle;
            var groupContent = container.children[1];
            groupContent.className = style.classContent;
            groupTitle.innerText = val[i][style.displayMember];
            groupTitle.__bindedData = val[i];
            var field = val[i][style.valueMember]+ itemDataMember + root.__CurrTimestamps;//可能重复
            groupContent.setAttribute('field',field);
            groupContent.setAttribute('localField','true');
            groupContent.setAttribute('itemField','Curr'+ field);
            groupContent.setAttribute('itemLocalField','true');
            groupContent.setAttribute('conv',style.itemConv);
            form.SetField(field,[val[i][itemDataMember]]);
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
            for(var i=0;i<val.length;i++){
                form.SetField('Curr'+val[i][style.valueMember]+ele.__itemDataMember + ele.__CurrTimestamps,[val[i][ele.__itemDataMember]]);
            }
        }
    };
};

//普通多选下拉列表
FIISForm.CheckboxlistViewConv = function (style) {
    window.forms.CheckboxlistViewConv.apply(this, [null, style]);
    FIISForm.FIISValueDecoder.apply(this);
};
//可过滤多选下拉
FIISForm.FilterableCheckboxlistViewConv = function (style,decode) {
    window.forms.FilterableCheckboxlistViewConv.apply(this,[style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
//右键菜单
FIISForm.FloatListConv = function () {
    window.forms.FloatListConv.apply(this,arguments);
    FIISForm.FIISValueDecoder.apply(this);
};
//单选框
FIISForm.RadioButtonListConv = function (decode) {
    window.forms.RadioButtonListConv.apply(this, arguments);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
//多选框
FIISForm.CheckboxButtonListConv = function () {
    window.forms.CheckboxButtonListConv.apply(this,arguments);
    FIISForm.FIISValueDecoder.apply(this);
};
//表格（单选行）
FIISForm.TableViewConv = function (decode) {
    window.forms.TableViewConv.apply(this, arguments);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};

/*分组列表*/
FIISForm.GroupListConv = function () {
    window.forms.GroupListConv.apply(this,arguments);
    FIISForm.FIISValueDecoder.apply(this);
};

/**************************************************************************************/
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
    /*
    * 后两个参数可交换位置
    * doc:显示在哪个文档对象下，默认最顶层
    * */
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
    var timmer = doc.defaultView.setTimeout(function () { hide(box) },2500);//doc.defaultView:防止iframe切换造成无法执行销毁
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