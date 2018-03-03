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
                    var txtContainer = ele.ownerDocument.createElement('div');
                    txtContainer.style.height = "inherit";
                    txtContainer.style.borderColor = 'inherit';
                    txtContainer.style.boxSizing = 'border-box';
                    ele.appendChild(txtContainer);

                    var txt = ele.ownerDocument.createElement("input");
                    txt.className = style.classInput;
                    txt.setAttribute("readonly", true);
                    txt.type = "text";
                    txt.style.font = "inherit";
                    txt.style.color = "inherit";
                    txt.style.width = "100%";
                    txt.style.height = '100%';
                    txt.style.border = "none";
                    txt.style.outline = "none";
                    txt.style.backgroundColor = "transparent";
                    txtContainer.appendChild(txt);
                    var unfold = ele.ownerDocument.createElement("div");
                    unfold.style.cursor = "pointer";
                    unfold.style.borderStyle = "solid";
                    unfold.style.borderColor = "inherit";
                    unfold.className = style.classDropDown;
                    unfold.style.width = 0;
                    unfold.style.height = 0;
                    var size = parseInt(txtContainer.offsetHeight / 4, 10);
                    unfold.borderWidth = size + "px";
                    unfold.style.borderLeft = size + "px solid transparent";
                    unfold.style.borderRight = size + "px solid transparent";
                    unfold.style.borderTopWidth = size + "px";
                    unfold.style.borderBottom = "0px";
                    unfold.style.display = "inline-block";
                    unfold.style.cssFloat = 'right';
                    unfold.style.margin = -2.5 * size + "px " + size + "px 0 0";
                    txtContainer.appendChild(unfold);
                    if (typeof filter === 'function') {
                        var filterContainer = ele.ownerDocument.createElement('div');
                        filterContainer.className = style.classFilterInput;
                        filterContainer.style.boxSizing = 'border-box';
                        filterContainer.style.borderTop = 'none';
                        filterContainer.style.display = 'none';
                        ele.appendChild(filterContainer);

                        var filterInput = ele.ownerDocument.createElement('input');
                        filterInput.type = "text";
                        filterInput.style.border = 'none';
                        filterInput.style.outline = 'none';
                        filterInput.style.font = "inherit";
                        filterInput.style.color = "inherit";
                        filterInput.style.width = '100%';
                        filterInput.style.height = '100%';
                        filterInput.placeholder = '检索';
                        filterContainer.appendChild(filterInput);

                        ele.style.height = ele.offsetHeight * 2 + "px";
                        filterContainer.style.height = "50%";
                        txtContainer.style.height = "50%";
                        filterContainer.style.border = ele.style.border;
                        filterContainer.style.borderTop = "none";
                        txtContainer.style.border = ele.style.border;
                        ele.style.border = 'none';
                    }
                    mnu = new Menu(ele, style);
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
                        if (txtContainer.__bindedData instanceof Array && getItemMemberByValue(txtContainer.__bindedData, style.valueMember, d[style.valueMember])) {
                            e.__selected = true;
                            setStyle("selected");
                        } else {
                            e.__selected = false;
                            setStyle("unselected");
                        }
                        e.onclick = function () {
                            e.__selected = !e.__selected;
                            if (e.__selected) {
                                currDataRefresh(d, 'push');
                                setStyle("selected");
                            } else {
                                currDataRefresh(d, 'remove');
                                setStyle("unselected");
                            }
                        };
                        function setStyle(mode) {
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
                                mnu.Add(data[i]);
                            }
                            mnu.Show();
                        }
                    };

                    if (typeof filter === 'function') {
                        filterInput.onkeyup = function () {
                            if (filterInput.__keyupLastTrigger !== void 0) {
                                clearTimeout(filterInput.__keyupLastTrigger)
                            }
                            filterInput.__keyupLastTrigger = setTimeout(function () {
                                var key = window.forms.Event.KeyCode();
                                switch (key) {
                                    case 13: {
                                        var t = window.forms.Element(filterInput).GetText();
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
                                            ele.children[0].__bindedData = selection;
                                        }
                                        mnu.Hide();
                                    }
                                        break;
                                    default: {
                                        mnu.Clear();
                                        var data = self.GetValue(ele);
                                        if (data) {
                                            var t = window.forms.Element(filterInput).GetText();
                                            for (var i = 0; i < data.length; i++) {
                                                if (filter(data[i], t)) mnu.Add(data[i]);
                                            }
                                        }
                                        mnu.Show();
                                    }
                                        break;
                                }
                            }, 200);
                        }
                    }

                    function currDataRefresh(data, mode) {
                        var valueMember = ele.getAttribute('valueMember');
                        var displayMember = ele.getAttribute('displayMember');
                        txtContainer.__bindedData = txtContainer.__bindedData || [];
                        txtContainer.__displayText = txtContainer.__displayText || [];
                        var idx = -1;
                        for (var i = 0; i < txtContainer.__bindedData.length; i++) {
                            if (txtContainer.__bindedData[i][valueMember] + "" === data[valueMember]) {
                                idx = i;
                                break;
                            }
                        }
                        switch (mode) {
                            case 'push': {
                                if (idx === -1) {
                                    txtContainer.__bindedData.push(data);
                                    txtContainer.__displayText.push(data[displayMember]);
                                }
                            }
                                break;
                            case 'remove': {
                                if (idx !== -1) {
                                    txtContainer.__bindedData.splice(idx, 1);
                                    txtContainer.__displayText.splice(idx, 1);
                                }
                            }
                        }
                        var textDisplay = txtContainer.__displayText.slice().join(',');
                        window.forms.Element(txt).SetText(textDisplay);
                        txtContainer.title = textDisplay;
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
                    self.InheritProperties(ele, ele.children[0]);
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
        this.CompareValues = function (val1, val2) {
            return window.forms.object.Compare(val1,val2)===0 ? 0 : 1;
        };
        this.GetUIValue = this.GetValue = function (ele) {
            return ele.__bindedData || [];
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
        }
    }
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

window.forms.RadioListConv = function (style) {
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
                    label.style.borderRadius = '50%';
                    e.appendChild(label);
                    e.appendChild(text);
                    e.onclick = function (e) {
                        return function () {
                            var field = root.getAttribute("field");
                            if (!field || field == "") return;
                            var form = formCallCenter.DetectFormByElement(root);
                            form.SetField(field, [e.__currData]);
                            root.__currData = e.__currData;
                        }
                    } (e);
                    root.appendChild(e);
                }
            }
            else {
                var e = root.children[index];
                var text = e.children[1];
                if (e.__currData == list[index]) return;
                e.__currData = list[index];
                window.forms.Element(text).SetText(list[index][root.getAttribute("displayMember")]);
                setStyle(style,e,e.children[0],e.children[1],false);
            }
        }
    } (this);
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.TileListConv.RadioListItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        window.forms.Form.InheritAttributes(srcElement, desElement);
    }
    window.forms.TileListConv.RadioListItemConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.CompareValues = function (val1, val2) {
            return window.forms.object.Compare(val1,val2)===0 ? 0 : 1;
        };
        this.GetUIValue = this.GetValue = function (ele) {
            if(ele.__bindedData){return ele.__bindedData;}
            else {
                var value = {};
                value[style.valueMember] = null;
                value[style.displayMember] = null;
                return value;
            }
        };
        this.ApplyValue = function (ele, value) {
            for (var i = 0; i < ele.children.length; i++) {
                var e = ele.children[i];
                var v = e.__currData ? e.__currData[style.valueMember] : null;
                var label = e.children[0];
                var text = e.children[1];
                setStyle(style, e, label, text, v == value[style.valueMember]);
            }
        };
    }
    function setStyle(style,e,label,text,selected) {
        if(selected){
            label.style.backgroundColor = '#000';
            label.style.border = Math.floor(label.offsetWidth/3) + "px solid #ccc";
            e.className = style.classSelectdItem;
            label.className = style.classSelectedLabel;
            text.className = style.classSelectedText;
        }else {
            label.style.backgroundColor = "#fff";
            label.style.border = '1px solid #ccc';
            e.className = style.classUnselectdItem;
            label.className = style.classUnselectedLabel;
            text.className = style.classUnselectedText;
        }
    }
};

window.forms.CheckboxListConv = function (style) {
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
                            var conv = form.GetConverter(root);
                            if (conv) conv.SetValue(root, [conv.GetUIValue(root)]);
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
    window.forms.TileListConv.TileListItemConv = function (style) {
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
            for (var i = 0; i < ele.children.length; i++) {
                var e = ele.children[i];
                var curr = e.__currData[style.valueMember];
                var flag = false;
                for (var j = 0; j < len; j++) {
                    if (curr == val[j][style.valueMember]) {
                        flag = true;
                        break;
                    }
                }
                e.__selected = flag;
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
            e.className = style.classSelectdItem;
            label.className = style.classSelectedLabel;
            text.className = style.classSelectedText;
        }else {
            label.style.backgroundColor = "#fff";
            label.style.border = '1px solid #ccc';
            e.className = style.classUnselectdItem;
            label.className = style.classUnselectedLabel;
            text.className = style.classUnselectedText;
        }
    }
};

window.forms.TableViewConv = function (style) {
    window.forms.ListValueConv.apply(this, [style]);
    this.CompareValues = function (val1, val2) {
        return window.forms.object.Compare(val1,val2)===0 ? 0 : 1;
    };
    this.GetUIValue = this.GetValue;
    var table;
    var applyValue = this.ApplyValue;
    this.ApplyValue = function (ele, value) {
        applyValue(ele, value);
        if(table)table.Refresh();
    };
    this.ApplyItem = function (self) {
        return function (ele, list, index) {
            if (index == -1) {
                if (!table) {
                    var tableContainer = ele.ownerDocument.createElement('div');
                    ele.appendChild(tableContainer);
                    tableContainer.style.height = 'inherit';
                    tableContainer.style.width = 'inherit';
                    table = new TableView(tableContainer,style);

                    var drawRow = table.drawRow;
                    var drawRowCell = table.drawRowCell;
                    table.drawRow = function (doc, e, ri, d, style) {
                        drawRow(doc, e, ri, d, style);
                        if(ri>0){
                            if(e.__hasDrawed)return;
                            var field = tableContainer.getAttribute("field");
                            var form = formCallCenter.DetectFormByElement(tableContainer);
                            e.__currData = d;
                            if(field){
                                var currD = form.GetField(field);
                                if(window.forms.object.Compare(currD,d) === 0){
                                    e.__selected = true;
                                    e.className = style.classSelectedRow;
                                }else {
                                    e.__selected = false;
                                    e.className = style.classUnselectedRow;
                                }
                            }else {
                                e.__selected = false;
                                e.className = style.classUnselectedRow;
                            }
                            window.forms.Event.Register(e,(style.selectedEvent||"mousedown"),function () {
                                if (!field || field == "") return;
                                form.SetField(field, [d], true);
                            });
                            e.__hasDrawed = true;
                        }
                        self.drawRow(doc, e, ri, d, style);
                    };
                    table.drawRowCell = function (doc, e, ri, r, ci, c, style) {
                        drawRowCell(doc, e, ri, r, ci, c, style);
                        self.drawRowCell(doc, e, ri, r, ci, c, style);
                    };
                    table.drawColumnCell = function (doc, e, ci, c, style) {
                        self.drawColumnCell(doc, e, ci, c, style,ele,list.slice());
                    };
                }
                var columns = style.columns;
                table.Columns().Clear();
                for(var i = 0;i<columns.length;i++){
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
    this.drawRow =function (doc, e, ri, d, style) {};
    this.drawRowCell = function (doc, e, ri, r, ci, c, style) {};
    this.drawColumnCell = function (doc, e, ci, c, style,ele,list) {
        var desc = null == c ? "" : c[style.displayMember];
        e.innerHTML = desc;
        e.title = desc;
        e.className = style.classColumnCell;
        ele.sortStatus = ele.sortStatus||{
            field:null,
            mode:-1,
        };
        var option = c.sortOption||{},locales = c.sortLocales||void 0;
        if(c.sortable){
            e.onclick = function () {
                if(ele.sortStatus.field !== c[style.nameMember]){
                    ele.sortStatus.mode = -1;
                }
                ele.sortStatus.mode--;
                if(ele.sortStatus.mode < -1){ele.sortStatus.mode = 1};
                sort(c[style.nameMember],ele.sortStatus.mode);
            };
        }
        function sort(fieldName,mode) {
            var data,statusShow = "";
            switch (mode){
                case -1:
                    data = list.slice();statusShow = "";
                    break;
                case 1:
                    data = list.slice().sort(function (a,b) {
                        return (a[fieldName] + "").localeCompare(b[fieldName] + "",locales,option);
                    });
                    statusShow = "&darr;"
                    break;
                case 0:
                    data = list.slice().sort(function (a,b) {
                        return (b[fieldName] + "").localeCompare(a[fieldName] + "",locales,option);
                    });
                    statusShow = "&uarr;";
                    break;
            }
            if(data){
                var field = ele.getAttribute("field");
                var form = formCallCenter.DetectFormByElement(ele);
                if(field && form) form.SetField(field,[{Result:data}]);
            }
            setTimeout(function () {e.innerHTML = c[style.displayMember] + statusShow;},160);
            ele.sortStatus.field = fieldName;
            ele.sortStatus.mode = mode;
        };
    };
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.TableViewConv.TableViewItemValueConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        window.forms.Form.InheritAttributes(srcElement, desElement);
    }
    window.forms.TableViewConv.TableViewItemValueConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.CompareValues = function (val1, val2) {
            return window.forms.object.Compare(val1,val2)===0 ? 0 : 1;
        }
        this.GetUIValue = this.GetValue = function (ele) {
            if (ele.__bindedData) {return ele.__bindedData;}
            else {
                var value = {};
                for(var i=0;i<style.columns.length;i++){
                    value[style.columns[i][style.nameMember]] = null;
                }
                return value;
            }
        }
        this.ApplyValue = function (ele, value) {
            var valueMember =ele.getAttribute('valueMember');
            var rows = ele.children[0].children[1].children[0].children[0].children;
            for(var i = 1,l = rows.length;i<l;i++){
                var e = rows[i];
                e.className = e.__currData&&e.__currData[valueMember] === value[valueMember] ? style.classSelectedRow : style.classUnselectedRow;
            }
        }
    };
};

// window.forms.CheckboxTableConv = function (style) {
//     window.forms.TableViewConv.apply(this,arguments);
//     var table;
//     var applyValue = this.ApplyValue;
//     this.ApplyValue = function (ele, value) {
//         applyValue(ele, value);
//         table.Refresh();
//     };
//     this.ApplyItem = function (self) {
//         return function (ele, list, index) {
//             if (index == -1) {
//                 if (!table) {
//                     var tableContainer = ele.ownerDocument.createElement('div');
//                     ele.appendChild(tableContainer);
//                     tableContainer.style.height = 'inherit';
//                     tableContainer.style.width = 'inherit';
//                     table = new TableView(tableContainer,style);
//
//                     var drawRow = table.drawRow;
//                     var drawRowCell = table.drawRowCell;
//                     table.drawRow = function (doc, e, ri, d, style) {
//                         drawRow(doc, e, ri, d, style);
//                         if(ri>0){
//                             if(e.__hasDrawed)return;
//                             e.__currData = d;
//                             var field = tableContainer.getAttribute("field");
//                             var form = formCallCenter.DetectFormByElement(tableContainer);
//                             if(field){
//                                 var currD = form.GetField(field);
//                                 var idx = -1;
//                                 for(var i = 0;i<currD.length;i++){
//                                     if(window.forms.object.Compare(currD[i],d)){
//                                         idx = i;
//                                     }
//                                 }
//                                 if(idx !== -1){
//                                     e.__selected = true;
//                                     e.className = style.classSelectedRow;
//                                 }else {
//                                     e.__selected = false;
//                                     e.className = style.classUnselectedRow;
//                                 }
//                             }else {
//                                 e.__selected = false;
//                                 e.className = style.classUnselectedRow;
//                             }
//                             window.forms.Event.Register(e,(style.selectedEvent||"mousedown"),function () {
//                                 if (!field || field == "") return;
//                                 if(e.__lastTrigger){clearTimeout(e.__lastTrigger)}
//                                 e.__lastTrigger = setTimeout(function () {
//                                     e.__selected = !(e.__selected);
//                                     if(e.__selected){
//                                         currDataRefresh(d,'push');
//                                     }else {
//                                         currDataRefresh(d,'remove');
//                                     }
//                                 },0)
//                             });
//                             function currDataRefresh(r,mode) {
//                                 var d = form.GetField(field);
//                                 var valueMember = ele.children[0].getAttribute('valueMember')
//                                 switch (mode){
//                                     case 'push':
//                                         form.SetField(field, [d.concat([r])], true);
//                                         break;
//                                     case 'remove':
//                                         var idx = -1;
//                                         for(var i=0;i<d.length;i++){
//                                             if(d[i][valueMember] === r[valueMember]){
//                                                 idx = i;
//                                                 break;
//                                             }
//                                         }
//                                         if(idx !== -1){
//                                             var pd = d.slice();
//                                             pd.splice(idx,1);
//                                             form.SetField(field, [pd], true);
//                                         }
//                                         break;
//                                 }
//                             }
//                             e.__hasDrawed = true;
//                         }
//                         self.drawRow(doc, e, ri, d, style);
//                     };
//                     table.drawRowCell = function (doc, e, ri, r, ci, c, style) {
//                         drawRowCell(doc, e, ri, r, ci, c, style);
//                         self.drawRowCell(doc, e, ri, r, ci, c, style);
//                     };
//                     table.drawColumnCell = function (doc, e, ci, c, style) {
//                         self.drawColumnCell(doc, e, ci, c, style,ele,list.slice());
//                     };
//                     var columns = style.columns;
//                     for(var i = 0;i<columns.length;i++){
//                         table.Columns().Add(columns[i]);
//                     }
//                 }
//                 table.Rows().Clear();
//                 self.InheritProperties(ele, ele.children[0]);
//             }
//             else {
//                 table.Rows().Add(list[index]);
//             }
//         }
//     } (this);
//     window.forms.TableViewConv.TableViewItemValueConv = function (style) {
//         window.forms.SingleValueConv.apply(this);
//         this.CompareValues = function (val1, val2) {
//             return window.forms.object.Compare(val1,val2)===0 ? 0 : 1;
//         }
//         this.GetUIValue = this.GetValue = function (ele) {
//             return ele.__bindedData || [];
//         }
//         this.ApplyValue = function (ele, value) {
//             setTimeout(function () {
//                 var valueMember = ele.getAttribute("valueMember");
//                 var rows = ele.children[0].children[1].children[0].children[0].children;
//                 for(var i = 1,l = rows.length;i<l;i++){
//                     var e = rows[i];
//                     e.className = HasSelected(e.__currData) ? style.classSelectedRow : style.classUnselectedRow;
//                 }
//                 function HasSelected(r) {
//                     for(var i = 0;i<ele.__bindedData.length;i++){
//                         if(ele.__bindedData[i][valueMember] === r[valueMember]){
//                             console.log(ele.__bindedData[i][valueMember])
//                             return true;
//                         }
//                     }
//                     return  false;
//                 }
//             },0);
//         }
//     };
// };

//普通多选下拉列表
FIISForm.CheckboxDroplistConv = function (style) {
    window.forms.CheckboxlistViewConv.apply(this, [null, style]);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
};
//可过滤多选下拉列表
FIISForm.FilterableCheckboxDroplistConv = function (style) {
    function filter(d, test) {
        test = test ? test.toLowerCase() : "";
        var display = d[style.displayMember];
        if (display && display.toLowerCase().indexOf(test) > -1) return true;
        var value = d[style.valueMember];
        if (value && value.toLowerCase().indexOf(test) > -1) return true;
        return false;
    }
    window.forms.CheckboxlistViewConv.apply(this, [filter, style]);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
};
//右键菜单
FIISForm.FloatListConv = function () {
    window.forms.FloatListConv.apply(this,arguments);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
};
//单选框
FIISForm.RadioListConv = function () {
    window.forms.RadioListConv.apply(this,arguments);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
};
//多选框
FIISForm.CheckboxListConv = function () {
    window.forms.CheckboxListConv.apply(this,arguments);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
};
//表格（单选行）
FIISForm.TableViewConv = function () {
    window.forms.TableViewConv.apply(this,arguments);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
};
//表格（多选行）
FIISForm.CheckboxTableConv = function () {
    window.forms.CheckboxTableConv.apply(this,arguments);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
};