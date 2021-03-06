﻿function ListView(root, style, updateCall) {
    var listView = manageElement(root, "listView");
    impl = listView.impl;
    if (!impl) {
        if (!style) {
            style = { "displayMember": "Description" };
        }
        else {
            if (!style.displayMember) style.displayMember = "Description";
        }
        impl = listView.impl = new function (root) {
            var eleContent = null;
            var derived;
            var data = [];
            function init() {
                if (root.lvInit) return;

                root.innerHTML = "";
                var e = window.forms.Element(root);
                var doc = e.GetDocument();

                var container = doc.createElement("DIV");
                container.style.overflow = "hidden";
                container.style.width = "100%";
                eleContent = doc.createElement("DIV");
                eleContent.style.overflow = "auto";
                eleContent.style.whiteSpace = "nowrap";
                eleContent.style.width = "100%";

                var tab = doc.createElement("DIV");
                var tb = doc.createElement("DIV");
                tab.style.overflow = "hidden";
                tb.style.overflow = "hidden";
                tab.appendChild(tb);
                eleContent.appendChild(tab);
                container.appendChild(eleContent);
                root.appendChild(container);

                root.lvTable = tab;
                tab.lvTBody = tb;
                tb.lvChildren = tb.children;

                root.lvInit = true;
            }
            init();
            var refreshTimeout = 0;
            var interval = 120;
            function refresh(pos) {
                if (typeof (pos) == "undefined") {
                    refreshImpl(function () { return false; });
                }
                else {
                    if (eleContent.style.display != "") return;
                    if (!refreshTimeout) refreshTimeout = setTimeout(function () { return function () { refreshImpl(function () { return false; }) } } (), interval);
                }
            }
            this.preLayout = function (root) {
                eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.offsetHeight + "px";
            }
            this.sufLayout = function (root) {
                return false;
            }
            function refreshImpl(ctn) {
                refreshTimeout = 0;
                if (eleContent.style.display != "") return;
                var d1 = new Date();
                var diff = function (e, t) {
                    var top = window.forms.Element(e).GetOffset(eleContent).y;
                    var c = 0;
                    if (top > eleContent.offsetHeight) {
                        c = 1;
                    }
                    else if (top < 0) {
                        c = -1;
                    }
                    return c;
                }

                var tb = root.lvTable.lvTBody;
                for (var i = tb.lvChildren.length; i > data.length; ) {
                    tb.removeChild(tb.lvChildren[--i]);
                }

                derived.preLayout(root);

                var e = window.forms.Element(root);
                var doc = e.GetDocument();
                var cnt = tb.lvChildren.length;
                if (cnt > 0) {
                    derived.drawRow(doc, tb.lvChildren[0], 0, data[0], style);
                    delete data[0].__refresh__;
                }
                var need = true;
                var force = true;
                while (need) {
                    need = false;

                    while (cnt < data.length && force) {
                        var range = derived.viewRange(tb.lvChildren, null, 0, tb.lvChildren.length - 1, diff);
                        var start = range.Start;
                        var end = range.End + 1;
                        if (end >= cnt) { //页尾
                            force = true;
                            end = cnt + 10;
                            if (end > data.length) end = data.length;
                        }
                        else {
                            force = ctn();
                            if (cnt - end >= end - start) end = start + 1;
                        }
                        for (var i = start; i < end; i++) {
                            var tr = derived.createRow(doc, cnt, data[cnt]);
                            tb.appendChild(tr);
                            derived.drawRow(doc, tr, cnt, data[cnt], style);
                            need = true;
                            delete data[cnt].__refresh__;
                            cnt++;
                            if (cnt >= data.length) break;
                        }
                    }

                    while (true) {
                        //绘制可能导致布局改变，需要重新计算
                        var range = derived.viewRange(tb.lvChildren, null, 0, tb.lvChildren.length - 1, diff);
                        var start = range.Start;
                        if (start > 0) start--;
                        var end = range.End + 1;
                        if (end < cnt) end++;
                        var flag = false;
                        for (var i = start; i < end; i++) {
                            if (i == 0) continue;
                            if (data[i].__refresh__) {
                                derived.drawRow(doc, tb.lvChildren[i], i, data[i], style);
                                need = true;
                                delete data[i].__refresh__;
                                flag = true;
                            }
                        }
                        if (!flag) break;
                    }
                    if (!need) need = force = derived.sufLayout(root);
                }
                if (typeof (updateCall) == "function") updateCall();
                interval = parseInt((new Date() - d1) * 1.1 + 10, 10);
            }

            this.viewRange = function (list, test, start, end, diff) {
                if (start > end) {
                    var tmp = start;
                    start = end;
                    end = tmp;
                }
                if (!list || list.length < 1) return { "Start": start < 0 ? 0 : start, "End": start < 0 ? -1 : start - 1 };
                if (start < 0) start = 0;
                if (end >= list.length) end = list.length - 1;

                var s = start;
                var s1 = start;
                var s2 = end;
                var e1 = start;
                var e2 = end;

                var n1 = 0;

                while (s1 <= s2) {
                    var mid = parseInt((s1 + s2) / 2, 10);
                    var c = diff(list[mid], test);
                    n1++;
                    if (c > 0) {
                        s2 = mid - 1;
                        e2 = s2;
                    }
                    else if (c < 0) {
                        s1 = mid + 1;
                        e1 = s1;
                    }
                    else {
                        e1 = mid;
                        if (mid == s1) {
                            s = mid;
                            break;
                        }
                        s2 = mid;
                    }
                }

                var e = s - 1;
                var n2 = 0;
                while (e1 <= e2) {
                    var mid = parseInt((e1 + e2) / 2, 10);
                    var c = diff(list[mid], test);
                    n2++;
                    if (c > 0) {
                        e2 = mid - 1;
                    }
                    else if (c < 0) {
                        e1 = mid + 1;
                    }
                    else {
                        if (mid == e1) {
                            if (mid == e2) {
                                e = mid;
                            }
                            else {
                                e = diff(list[e2], test) == 0 ? e2 : mid;
                            }
                            break;
                        }
                        e1 = mid;
                    }
                }
                return { "Start": s, "End": e };
            }
            this.setDerived = function (d) {
                derived = d;
            }
            this.Refresh = function () {
                refresh();
            }
            this.Insert = function (index, row) {
                if (!(index >= 0 && index <= data.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                for (var i = data.length; i > index; i--) {
                    data[i] = data[i - 1];
                }
                data[index] = row;
                var tb = root.lvTable.lvTBody;
                if (index < tb.lvChildren.length) {
                    var e = window.forms.Element(root);
                    var doc = e.GetDocument();
                    var tr = derived.createRow(doc, index, data[index]);
                    tb.appendChild(tr);
                    derived.drawRow(doc, tr, index, data[index], style);
                    delete data[index].__refresh__;
                }
                refresh(index);
            }
            this.Add = function (self) {
                return function (row) {
                    self.Insert(data.length, row);
                }
            } (this);
            this.RemoveAt = function (index) {
                if (!(index >= 0 && index < data.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                for (var i = index + 1; i < data.length; i++) {
                    data[i - 1] = data[i];
                }
                data.length--;
                var tb = root.lvTable.lvTBody;
                if (index < tb.lvChildren.length) tb.removeChild(tb.lvChildren[index]);
                refresh(index);
            }
            this.Remove = function (self) {
                return function (row, filter) {
                    var index = self.IndexOf(row, filter);
                    if (index > -1) self.RemoveAt(index);
                }
            } (this);
            this.IndexOf = function (row, filter) {
                if (typeof (filter) != "function") filter = function (r1, r2) {
                    return window.forms.object.Compare(r1, r2) == 0;
                };
                for (var i = 0; i < data.length; i++) {
                    if (filter(data[i], row)) return i;
                }
                return -1;
            }
            this.ItemAt = function (index, d) {
                if (!(index >= 0 && index < data.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                if (typeof (d) == "undefined") {
                    return data[index];
                }
                else {
                    data[index] = d;
                    data[index].__refresh__ = true;
                    refresh(index);
                }
            }
            this.Contains = function (self) {
                return function (row, filter) {
                    return self.IndexOf(row, filter) > -1;
                }
            } (this);
            this.Clear = function () {
                data.length = 0;
                var tb = root.lvTable.lvTBody;
                tb.innerHTML = "";
            }
            this.Count = function () {
                return data.length;
            }
            this.Refresh = function () {
                refresh();
            }
            this.GetElement = function () {
                return root;
            }
            var events = manageElement(eleContent, "events");
            window.forms.Event.Unregister(eleContent, "scroll", events["scroll"]);
            events["scroll"] = function () { refresh(0); }
            window.forms.Event.Register(eleContent, "scroll", events["scroll"]);
        } (root, this);
    }
    impl.setDerived(this);
    this.preLayout = impl.preLayout;
    this.sufLayout = impl.sufLayout;
    this.viewRange = impl.viewRange;
    this.Refresh = impl.Refresh;
    this.GetElement = impl.GetElement;
    this.Insert = impl.Insert;
    this.Add = impl.Add;
    this.RemoveAt = impl.RemoveAt;
    this.Remove = impl.Remove;
    this.IndexOf = impl.IndexOf;
    this.ItemAt = impl.ItemAt;
    this.Contains = impl.Contains;
    this.Clear = impl.Clear;
    this.Count = impl.Count;
    this.createRow = function (doc, index, d) {
        var tr = doc.createElement("DIV");
        var td = doc.createElement("DIV");
        tr.appendChild(td);
        return tr;
    }
    this.drawRow = function (doc, e, ri, d, style) {
        window.forms.Element(e.children[0]).SetText(d[style.displayMember]);
        if (ri % 2 == 0) {
            e.style.backgroundColor = 'red';
        }
        else {
            e.style.backgroundColor = 'green';
        }
    }
}

function TableView(root, style, updateCall) {
    if (!style) {
        style = { "nameMember": "Name", "widthMember": "Width" };
    }
    else {
        if (!style.nameMember) style.nameMember = "Name";
        if (!style.widthMember) style.widthMember = "Width";
    }
    ListView.call(this, root, style, updateCall);
    var impl = manageElement(root, "listView").impl;

    this.preLayout = function (root) {
        var eleContent = root.lvTable.parentNode;
        eleContent.parentNode.style.height = eleContent.parentNode.parentNode.offsetHeight + "px";
        eleContent.style.height = (eleContent.parentNode.offsetHeight - window.forms.Element(eleContent).GetOffset(eleContent.parentNode).y) + "px";
    }
    this.createRow = function (self) {
        return function (doc, index, d) {
            if (index == 0) {
                var eleContent = root.lvTable.parentNode;
                var p = eleContent.parentNode;
                if (p.children.length == 1) {
                    var eleHeader = doc.createElement("DIV");
                    eleHeader.style.overflow = "hidden";
                    eleHeader.style.width = "100%";
                    eleHeader.style.whiteSpace = "nowrap";
                    var tabHeader = doc.createElement("DIV");
                    tabHeader.style.overflow = "hidden";
                    var tbHeader = doc.createElement("DIV");
                    tbHeader.style.overflow = "hidden";
                    var trHeader = self.createHeaderRow(doc, d);
                    tbHeader.appendChild(trHeader);
                    tabHeader.appendChild(tbHeader);
                    eleHeader.appendChild(tabHeader);
                    p.insertBefore(eleHeader, p.children[0]);

                    root.tvHeader = trHeader;
                }
                return self.createHeaderRow(doc, d);
            }
            else {
                return self.createContentRow(doc, index - 1, d);
            }
        }
    } (this);
    this.createHeaderRow = function (doc, d) {
        var tr = doc.createElement("DIV");
        tr.style.overflow = "hidden";
        return tr;
    }
    this.createContentRow = function (doc, index, d) {
        var tr = doc.createElement("DIV");
        tr.style.overflow = "hidden";
        return tr;
    }
    if (!impl._tvColumns) {
        impl._tvColumns = new function (lv) {
            var columns = [];
            this.Add = function (self) {
                return function (item) {
                    self.Insert(columns.length, item);
                }
            } (this);
            this.Insert = function (index, item) {
                if (!item) throw new Error("NullColumn");
                if (!(index >= 0 && index <= columns.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                for (var i = columns.length; i > index; i--) {
                    columns[i] = columns[i - 1];
                }
                columns[index] = item;
                refresh();
            }
            this.Remove = function (self) {
                return function (item, filter) {
                    var index = self.IndexOf(item, filter);
                    if (index > -1) self.RemoveAt(index);
                }
            } (this);
            this.RemoveAt = function (self) {
                return function (index) {
                    if (!(index >= 0 && index < columns.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                    for (var i = index + 1; i < columns.length; i++) {
                        columns[i - 1] = columns[i];
                    }
                    columns.length--;
                    refresh();
                }
            } (this);
            this.ItemAt = function (index, item) {
                if (!(index >= 0 && index < columns.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                if (typeof (item) == "undefined") {
                    return columns[index];
                }
                else {
                    if (!item) throw new Error("NullColumn");
                    columns[index] = item;
                    refresh();
                }
            }
            this.Clear = function () {
                columns.length = 0;
                refresh();
            }
            this.Count = function () {
                return columns.length;
            }
            this.IndexOf = function (item, filter) {
                if (!item) return -1;
                if (typeof (filter) != "function") filter = function (c1, c2) {
                    return window.forms.object.Compare(c1, c2) == 0;
                };
                for (var i = 0; i < columns.length; i++) {
                    if (filter(columns[i].Name, item.Name)) return i;
                }
                return -1;
            }
            this.Contains = function (self) {
                return function (item, filter) {
                    return self.IndexOf(item, filter) > -1;
                }
            } (this);
            function refresh() {
                var cnt = lv.Count();
                for (var i = 0; i < cnt; i++) {
                    lv.ItemAt(i, lv.ItemAt(i));
                }
            }
            lv.Add(columns);
        } (this);
    }
    this.Columns = function () { return impl._tvColumns; }
    if (!impl._tvRows) {
        impl._tvRows = new function (lv) {
            this.Add = function (self) {
                return function (item) {
                    var cnt = lv.Count() - 1;
                    self.Insert(cnt, item);
                }
            } (this);
            this.Insert = function (self) {
                return function (index, item) {
                    var cnt = lv.Count() - 1;
                    if (!(index >= 0 && index <= cnt && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                    lv.Insert(index + 1, item);
                }
            } (this);
            this.Remove = function (self) {
                return function (item, filter) {
                    var index = lv.IndexOf(item, filter) - 1;
                    if (index > -1) self.RemoveAt(index);
                }
            } (this);
            this.RemoveAt = function (self) {
                return function (index) {
                    var cnt = lv.Count() - 1;
                    if (!(index >= 0 && index < cnt && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                    lv.RemoveAt(index + 1);
                }
            } (this);
            this.ItemAt = function (index, item) {
                var cnt = lv.Count() - 1;
                if (!(index >= 0 && index < cnt && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                return lv.ItemAt(index + 1, item);
            }
            this.Clear = function () {
                var columns = lv.ItemAt(0);
                lv.Clear();
                lv.Add(columns);
            }
            this.Count = function () {
                return lv.Count() - 1;
            }
            this.IndexOf = function (item, filter) {
                var index = lv.IndexOf(item, filter);
                if (index <= 0) return -1;
                return index - 1;
            }
            this.Contains = function (item, filter) {
                return lv.IndexOf(item, filter) > 0;
            }
        } (this);
    }
    this.Rows = function () { return impl._tvRows; }
    this.drawRow = function (lv) {
        return function (doc, e, ri, d, style) {
            if (ri == 0) {
                lv.drawHeaderRow(doc, e, d, style);
            }
            else {
                lv.drawContentRow(doc, e, lv.ItemAt(0), ri - 1, d, style);
            }
        }
    } (this);
    this.drawHeaderRow = function (lv) {
        return function (doc, e, columns, style) {
            var header = root.tvHeader;
            var tds = header.children;
            for (var i = tds.length; i > columns.length; i--) {
                header.removeChild(tds[i - 1]);
            }
            for (var i = tds.length; i < columns.length; i++) {
                var td = doc.createElement("DIV");
                header.appendChild(td);
            }
            var left = 0;
            for (var i = 0; i < columns.length; i++) {
                lv.drawHeaderCell(doc, tds[i], i, columns[i], style);
                tds[i].style.display = "inline-block";
                tds[i].style.width = columns[i][style.widthMember] + "px";
                left += columns[i][style.widthMember];
            }
            header.className = style.classHeader;
            header.style.width = header.parentNode.style.width = header.parentNode.parentNode.style.width = left + "px";

            var eleHeader = header.parentNode.parentNode.parentNode;
            var eleContent = root.lvTable.parentNode;
            if (eleHeader.offsetWidth != eleContent.offsetWidth) eleHeader.style.width = eleContent.offsetWidth + "px";
            if (eleHeader.scrollLeft != eleContent.scrollLeft) eleHeader.scrollLeft = eleContent.scrollLeft;


            var tds = e.children;
            for (var i = tds.length; i > columns.length; i--) {
                e.removeChild(tds[i - 1]);
            }
            for (var i = tds.length; i < columns.length; i++) {
                var td = doc.createElement("DIV");
                e.appendChild(td);
            }
            for (var i = 0; i < columns.length; i++) {
                lv.drawHeaderCell(doc, tds[i], i, columns[i], style);
                tds[i].style.display = "inline-block";
                tds[i].style.width = columns[i][style.widthMember] + "px";
            }
            e.className = style.classHeader;
            e.style.height = e.parentNode.children.length < 2 ? "1px" : "0px";
            e.style.width = e.parentNode.style.width = e.parentNode.parentNode.style.width = left + "px";
        }
    } (this);
    this.drawContentRow = function (lv) {
        return function (doc, e, columns, ri, row, style) {
            var tds = e.children;
            for (var i = tds.length; i > columns.length; i--) {
                e.removeChild(tds[i - 1]);
            }
            for (var i = tds.length; i < columns.length; i++) {
                var td = doc.createElement("DIV");
                e.appendChild(td);
            }

            var tds = e.children;
            var left = 0;
            for (var i = 0; i < columns.length; i++) {
                lv.drawContentCell(doc, tds[i], ri, row, i, columns[i], style);
                tds[i].style.display = "inline-block";
                tds[i].style.width = columns[i][style.widthMember] + "px";
                left += columns[i][style.widthMember];
            }
            e.className = style.classRow;
            e.style.width = left + "px";
        }
    } (this);
    this.drawHeaderCell = function (doc, e, ci, c, style) {
        var desc = null == c ? "" : c[style.displayMember];
        window.forms.Element(e).SetText(desc);
        e.title = desc;
        e.className = style.classColumnCell;
    }
    this.drawContentCell = function (doc, e, ri, r, ci, c, style) {
        var desc = r[c.Name];
        window.forms.Element(e).SetText(desc);
        e.title = desc;
        e.className = style.classRowCell;
    }
    this.viewRange = function (lv, impl) {
        return function (list, test, start, end, diff) {
            var columns = lv.ItemAt(0);
            return columns.length > 0 ? impl(list, test, start, end, diff) : impl(list, test, start, start, diff);
        }
    } (this, this.viewRange);
}
function Menu(mnuRoot, style, updateCall) {
    var menu = manageElement(mnuRoot, "menu");
    var impl = menu.impl;
    if (!impl) {
        function menuImpl(root, style, updateCall) {
            if (!style) style = {};
            var lv = new ListView(root, style, updateCall);
            var self = this;
            this.Visible = function () {
                return root.style.display == "";
            }
            this.Show = function () {
                root.style.display = "";
                lv.Refresh();
            }
            this.Hide = function () {
                root.style.display = "none";
            }
            var refresh = lv.Refresh;
            this.Refresh = lv.Refresh = function () {
                layout();
                refresh();
            }
            this.GetElement = lv.GetElement;
            function layout() {
                root.className = style.classMenu;
                root.style.position = "absolute";
                root.style.zIndex = 99999999;

                root.style.minWidth = mnuRoot.offsetWidth + "px";
            }
            this.Insert = lv.Insert;
            this.Add = lv.Add;
            this.RemoveAt = lv.RemoveAt;
            this.Remove = lv.Remove;
            this.IndexOf = lv.IndexOf;
            this.ItemAt = lv.ItemAt;
            this.Contains = lv.Contains;
            this.Clear = lv.Clear;
            this.Count = lv.Count;
            lv.createRow = function (doc, index, d) {
                return doc.createElement("DIV");
            }
            var derived;
            this.setDerived = function (d) {
                derived = d;
            }
            lv.drawRow = function (doc, e, ri, d, style) {
                return derived.drawRow(doc, e, ri, d, style);
            }
            lv.sufLayout = function (root) {
                return derived.sufLayout(root);
            }
        }
        var root = mnuRoot.ownerDocument.createElement("div");
        root.style.position = "absolute";
        root.style.display = "none";
        var body = window.forms.Element(mnuRoot).GetBody();
        body.appendChild(root);
        impl = menu.impl = new menuImpl(root, style, updateCall);
    }
    this.Visible = impl.Visible;
    this.Show = impl.Show;
    this.Hide = impl.Hide;

    this.Refresh = impl.Refresh;
    this.GetElement = impl.GetElement;
    this.Insert = impl.Insert;
    this.Add = impl.Add;
    this.RemoveAt = impl.RemoveAt;
    this.Remove = impl.Remove;
    this.IndexOf = impl.IndexOf;
    this.ItemAt = impl.ItemAt;
    this.Contains = impl.Contains;
    this.Clear = impl.Clear;
    this.Count = impl.Count;
    this.drawRow = function (doc, e, ri, d, style) {
        window.forms.Element(e).SetText(d[style.displayMember]);
        if (ri % 2 == 0) {
            e.style.backgroundColor = 'red';
        }
        else {
            e.style.backgroundColor = 'green';
        }
    }
    this.sufLayout = function (self) {
        return function (root) {
            var tab = root.lvTable;
            tb = tab ? tab.lvTBody : null;

            var eleContent = tab.parentNode;

            var mnuBounds = window.forms.Element(mnuRoot).GetBounds();
            var body = window.forms.Element(mnuRoot).GetBody();
            var bodyBounds = window.forms.Element(body).GetBounds();

            var h1 = mnuBounds.y - bodyBounds.y;
            var h2 = bodyBounds.height - (mnuBounds.y + mnuBounds.height);

            var result = true;
            var down = true;
            var tb = tab ? tab.lvTBody : null;
            var cnt = tb ? tb.lvChildren.length : 0;
            if (cnt < self.Count()) {
                if (h1 <= h2) {
                    if (tab.offsetHeight > h2) {
                        eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = h2 + "px";
                        //往下走，不继续
                        down = true;
                        result = false;
                    }
                    else {
                        eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = tab.offsetHeight + "px";
                        //往下走，应继续
                        down = true;
                        result = true;
                    }
                }
                else {
                    if (tab.offsetHeight > h2) {
                        if (tab.offsetHeight > h1) {
                            eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = h1 + "px";
                            //往上走，不继续
                            down = false;
                            result = false;
                        }
                        else {
                            eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = tab.offsetHeight + "px";
                            //往上走，应继续
                            down = false;
                            result = true;
                        }
                    }
                    else {
                        eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = tab.offsetHeight + "px";
                        //往下走，应继续
                        down = true;
                        result = true;
                    }
                }
            }
            else {
                if (h1 <= h2) {
                    if (tab.offsetHeight > h2) {
                        eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = h2 + "px";
                        //往下走，不继续
                        down = true;
                        result = false;
                    }
                    else {
                        eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = tab.offsetHeight + "px";
                        //往下走，不继续
                        down = true;
                        result = false;
                    }
                }
                else {
                    if (tab.offsetHeight > h2) {
                        if (tab.offsetHeight > h1) {
                            eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = h1 + "px";
                            //往上走，不继续
                            down = false;
                            result = false;
                        }
                        else {
                            eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = tab.offsetHeight + "px";
                            //往上走，不继续
                            down = false;
                            result = false;
                        }
                    }
                    else {
                        eleContent.style.height = eleContent.parentNode.style.height = eleContent.parentNode.parentNode.style.height = tab.offsetHeight + "px";
                        //往下走，不继续
                        down = true;
                        result = false;
                    }
                }
            }

            mnuBounds = window.forms.Element(mnuRoot).GetBounds();
            bodyBounds = window.forms.Element(body).GetBounds();

            root.style.left = (mnuBounds.x - bodyBounds.x) + "px";
            if (!down) {
                root.style.top = (mnuBounds.y - bodyBounds.y - root.offsetHeight) + "px";
            }
            else {
                root.style.top = (mnuBounds.y - bodyBounds.y + mnuBounds.height) + "px";
            }
            return result;
        }
    } (this);
    impl.setDerived(this);
}

function TreeView(root, data, style) {
    function TreeNode(parent, root, data, drawNode, style) {
        var treeNode = manageElement(root, "treeNode");
        impl = treeNode.impl;
        if (!impl) {
            if (!style) {
                style = { "displayMember": "name", "childrenMember": "children" };
            }
            else {
                if (!style.displayMember) style.displayMember = "name";
                if (!style.childrenMember) style.childrenMember = "children";
            }
            impl = treeNode.impl = new function (parent, self, root, data, style) {
                var offset = self.constructor == TreeNode ? 1 : 0;
                var ele = null;
                var nodes = [];
                var ns = null;
                function init(self) {
                    if (root.lvInit) return;

                    ns = new function (self) {
                        this.Insert = function (index, data) {
                            if (!(index >= 0 && index <= nodes.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");

                            var e = window.forms.Element(root);
                            var doc = e.GetDocument();
                            var tr = doc.createElement("tr");
                            var td = doc.createElement("td");
                            tr.appendChild(td);
                            td = doc.createElement("td");
                            tr.appendChild(td);
                            var node = new TreeNode(self, td, data, offset ? drawNode : self.drawNode, style);
                            for (var i = nodes.length; i > index; i--) {
                                nodes[i] = nodes[i - 1];
                            }
                            nodes[index] = node;

                            var tbody = ele.children[0];
                            if (index == ele.children.length - 1 - offset) {
                                tbody.appendChild(tr);
                            }
                            else {
                                tbody.insertBefore(tr, ele.children[index + offset]);
                            }
                            if (self.Refresh) self.Refresh();
                            return node;
                        }
                        this.Add = function (self) {
                            return function (data) {
                                return self.Insert(nodes.length, data);
                            }
                        } (this);
                        this.RemoveAt = function (index) {
                            if (!(index >= 0 && index < nodes.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                            var node = nodes[index];
                            for (var i = index + 1; i < nodes.length; i++) {
                                nodes[i - 1] = nodes[i];
                            }
                            nodes.length--;
                            node.Nodes().Clear();
                            node.Release();
                            var tbody = ele.children[0];
                            tbody.removeChild(tbody.children[index + offset]);
                            if (self.Refresh) self.Refresh();
                        }
                        this.Remove = function (self) {
                            return function (dataOrNode, dataFilter) {
                                var index = self.IndexOf(dataOrNode, dataFilter);
                                if (index > -1) self.RemoveAt(index);
                            }
                        } (this);
                        this.IndexOf = function (dataOrNode, dataFilter) {
                            if (typeof (dataFilter) != "function") dataFilter = function (r1, r2) {
                                return window.forms.object.Compare(r1, r2) == 0;
                            };
                            if (dataOrNode && typeof (dataOrNode.GetData) == "function") dataOrNode = dataOrNode.GetData();
                            for (var i = 0; i < nodes.length; i++) {
                                if (dataFilter(nodes[i].GetData(), dataOrNode)) return i;
                            }
                            return -1;
                        }
                        this.ItemAt = function (index) {
                            if (!(index >= 0 && index < nodes.length && parseInt(index, 10) == index)) throw new Error("IndexOutOfRange");
                            return nodes[index];
                        }
                        this.Contains = function (self) {
                            return function (dataOrNode, dataFilter) {
                                return self.IndexOf(dataOrNode, dataFilter) > -1;
                            }
                        } (this);
                        this.Clear = function () {
                            var ns = [];
                            for (var i = 0; i < nodes.length; i++) {
                                ns[i] = nodes[i];
                            }
                            nodes.length = 0;
                            for (var i = 0; i < ns.length; i++) {
                                ns[i].Nodes().Clear();
                                ns[i].Release();
                            }
                            var tbody = ele.children[0];
                            for (var i = tbody.children.length - 1; i >= offset; i--) {
                                tbody.removeChild(tbody.children[i]);
                            }
                            if (self.Refresh) self.Refresh();
                        }
                        this.Count = function () {
                            return nodes.length;
                        }
                    } (self);

                    root.innerHTML = "";
                    var e = window.forms.Element(root);
                    var doc = e.GetDocument();
                    ele = doc.createElement("table");

                    var tbody = doc.createElement("tbody");
                    ele.appendChild(tbody);
                    root.appendChild(ele);

                    if (offset == 1) {
                        var unfolded = false;
                        var refreshTimeout = 0;
                        var interval = 120;
                        var tr = doc.createElement("tr");
                        var td = doc.createElement("td");
                        tr.appendChild(td);
                        td = doc.createElement("td");
                        tr.appendChild(td);
                        tbody.appendChild(tr);
                        self.IsLeaf = function () {
                            return (!data || !data[style.childrenMember]) && ns.Count() < 1;
                        }
                        self.Unfolded = function () { return unfolded; }
                        self.Fold = function () {
                            unfolded = false;
                            if (self.Refresh) self.Refresh();
                        }
                        self.Unfold = function () {
                            unfolded = true;
                            if (self.Refresh) self.Refresh();
                        }
                        self.Refresh = function () {
                            if (!parent) return;
                            if (!refreshTimeout) refreshTimeout = setTimeout(refreshImpl, interval);
                        }
                        function refreshImpl() {
                            refreshTimeout = 0;
                            if (!parent) return;
                            drawNode(tr.children[0], tr.children[1], self);
                            if (typeof (style.drawNode) == "function") style.drawNode(tr.children[0], tr.children[1], self);
                            for (var i = offset; i < tr.parentNode.children.length; i++) {
                                tr.parentNode.children[i].style.display = unfolded ? "" : "none";
                            }
                        }
                        self.Release = function () {
                            if (!parent) return;
                            var brothers = parent.Nodes();
                            var cnt = brothers.Count();
                            for (var i = 0; i < cnt; i++) {
                                if (brothers.ItemAt(i) == self) throw new Error("Node can not be removed");
                            }
                            parent = null;
                        }
                        self.GetElement = function () {
                            return tr;
                        }
                    }
                    else {
                        self.IsLeaf = function () {
                            return false;
                        }
                        self.Unfolded = function () { return true; }
                        self.Fold = function () {
                        }
                        self.Unfold = function () {
                        }
                        self.Refresh = function () {
                        }
                        self.drawNode = drawNode;
                        self.GetElement = function () {
                            return ele;
                        }
                    }
                    self.Refresh();
                    root.lvInit = true;
                }
                this.GetParent = function () {
                    return parent;
                }
                this.GetData = function () {
                    return data;
                }
                this.Nodes = function () {
                    return ns;
                }
                this.FindNode = function (self) {
                    return function (find) {
                        if (typeof (find) != "function") return null;
                        if (offset && find(self)) return self;
                        var cnt = ns.Count();
                        for (var i = 0; i < cnt; i++) {
                            var n = ns.ItemAt(i);
                            n = n.FindNode(find);
                            if (n) return n;
                        }
                        return null;
                    }
                } (this);
                init(this);
            } (parent, this, root, data, style);
        }
        return impl;
    }
    var treeView = manageElement(root, "treeView");
    var impl = treeView.impl;
    if (!impl) {
        var drawNode = function (header, content, node) {
            var data = node.GetData();
            var text = data ? data[style.displayMember] : "";
            header.style.width = "12px";
            if (node.IsLeaf()) {
                window.forms.Element(header).SetText("*");
                header.title = text;
            }
            else {
                header.style.cursor = "pointer";
                if (node.Unfolded()) {
                    window.forms.Element(header).SetText("-");
                    header.title = "收起：" + text;
                }
                else {
                    window.forms.Element(header).SetText("+");
                    header.title = "展开：" + text;
                }
                header.onclick = function () {
                    if (node.Unfolded()) {
                        node.Fold();
                    }
                    else {
                        node.Unfold();
                    }
                }
            }
            content.title = text;
            window.forms.Element(content).SetText(text);
        }
        impl = treeView.impl = TreeNode.apply(this, [null, root, data, drawNode, style]);
    }
    return impl;
}