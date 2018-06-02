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
                            if(window.forms.Event.Source() ===e)return;
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
/*分页*/
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
        var itemDataMember = root.__itemDataMember = style.itemDataMember||'itemData';//itemDataMember可能会变所以每次都重新获取
        for(var i = 0;i < val.length;i++){
            var container = root.children[i];
            var groupTitle = container.children[0];
            groupTitle.className = style.classTitle;
            var groupContent = container.children[1];
            groupContent.className = style.classContent;
            groupTitle.innerText = val[i][style.displayMember];
            groupTitle.__bindedData = val[i];
            var field = val[i][style.valueMember]+ itemDataMember + root.__BirthTime;//可能重复
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
                                    var newData = root.lastElementChild ? root.lastElementChild.__currData:null;
                                    form.SetField(field, [newData],true);
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
                if(typeof style.drawTitle == 'function') style.drawTitle(e,e.__currData,style);
            }
        }
    } (this);
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.CloseableTileListConv.TileListItemConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.CloseableTileListConv.TileListItemConv = function () {
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
                                        return;
                                    }
                                }
                                window.forms.Element(ele).SetText('');
                            }
                        }
                    }
                }
            }else {
                window.forms.Element(ele).SetText('');
            }
        }
    }
};

window.forms.CheckableTableViewConv = function (style) {
    window.forms.TableViewConv.apply(this,arguments);
    var checkAll;
    this.drawHeaderRow = (function(self){
        return function (doc, e, columns, style) {
            var ele = self.__itemFieldElement;
            var form = formCallCenter.DetectFormByElement(ele),field = ele.getAttribute('field');
            var header = ele.tvHeader;//真正的header
            if(checkAll)return;
            checkAll = doc.createElement('span');
            checkAll.className =  style.classUnselectedCheckAllBox;
            header.parentElement.insertBefore(checkAll,header);//不能插到header里
            header.style.display = 'inline-block';
            checkAll.onclick = function () {
                if(!this.__isCheck){
                    var allres = self.GetValue(ele.parentElement);
                    allres = JSON.parse(JSON.stringify(allres));
                    form.SetField(field,[allres]);
                    this.className = searchTableViewStyle.classSelectedCheckAllBox;
                    this.__isCheck = true;
                }else {
                    form.SetField(field,[[]]);
                    this.className = searchTableViewStyle.classUnselectedCheckAllBox;
                    this.__isCheck = false;
                }
            }
        };
    })(this);
    this.drawContentRow = function (self) {
        return function (doc, e, columns, ri, row, style) {
            var ele = self.__itemFieldElement;
            var valueMember = ele.getAttribute("valueMember");
            var conv = window.forms.Element(ele).GetObject("conv");
            var checkBox = e.ownerDocument.createElement('span');
            if(e.children[0]){
                e.insertBefore(checkBox,e.children[0]);
            }else {
                e.appendChild(checkBox);
            }
            if (row) {
                var selectedRows = conv.GetValue(ele)||[];
                var hasSelected = false;
                for(var i=0;i<selectedRows.length;i++){
                    if(selectedRows[i][valueMember] === row[valueMember]){
                        hasSelected = true;
                        break;
                    }
                }
                if (hasSelected) {
                    e.className = style.classSelectedRow;
                    e.children[0].className = style.classSelectedCheckBox;
                    e.__hasSelectedRow = true;
                }
                else {
                    e.className = style.classUnselectedRow;
                    e.children[0].className = style.classUnselectedCheckBox;
                    e.__hasSelectedRow = false;
                }
            } else {
                e.className = style.classUnselectedRow;
                e.children[0].className = style.classUnselectedCheckBox;
                e.__hasSelectedRow = false;
            }
            var events = manageElement(checkBox, "tableView", "events");
            window.forms.Event.Unregister(checkBox, "click", events.RowClick);
            if(ele.__currRow && ele.__currRow[valueMember] == row[valueMember]) e.className = style.classCurrentRow;
            events.RowClick = function () {
                var selectedRows = conv.GetValue(ele)||[];
                var field = ele.getAttribute("field");
                if (!field || field == "") return;
                var form = formCallCenter.DetectFormByElement(ele);
                if(e.__hasSelectedRow){
                    for(var i=0;i<selectedRows.length;i++){
                        if(selectedRows[i][valueMember] === row[valueMember]){
                            selectedRows.splice(i,1);
                            break;
                        }
                    }
                }else {
                    selectedRows[selectedRows.length] = row;
                }
                form.SetField(field, [selectedRows], true);
            }
            window.forms.Event.Register(checkBox, "click", events.RowClick);
            window.forms.Event.Unregister(e, "click", rowClick);
            window.forms.Event.Register(e, "click", rowClick);
            function rowClick() {
                if(window.forms.Event.Source()==checkBox)return;
                ele.__currRow = row;
                var field = ele.getAttribute("field");
                if (!field || field == "") return;
                var selectedRows = conv.GetValue(ele)||[];
                var form = formCallCenter.DetectFormByElement(ele);
                form.SetField(field, [selectedRows], true);
            }
        }
    } (this);
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.CheckableTableViewConv.TableViewItemValueConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        return inherit(srcElement, desElement);
    }
    window.forms.CheckableTableViewConv.TableViewItemValueConv = function (style) {
        window.forms.ListValueConv.apply(this);
        this.DetermineApply = function (ele, val) {
            return true;
        };
        this.DecodeArguments = function (ele, args) {
            if (!window.forms.object(args).InstanceOf(Array)) throw new Error("Array arguments needed for Set");
            return args[0];
        }
        this.GetUIValue = (function (self) {
            return function (ele) {
                return self.GetValue(ele);
            }
        })(this);
        this.ApplyValue = (function (self) {
            return function (ele, value) {
                value = value||[];
                var valueMember = ele.getAttribute("valueMember");
                var rows = ele.children[0].children[1].children[0].children[0].children;
                //valueMap，currSelectedMap，willBeDeletedMap：为降低主循环(所有行循环)时间复杂度
                var valueMap = {};
                for(var i =  0;i<value.length;i++){ //为降低主循环(所有行)时间复杂度
                    valueMap[value[i][valueMember]] = true;
                }
                var conv = window.forms.Element(ele).GetObject("conv");
                var selectedRows = conv.GetValue(ele)||[];
                var currSelectedMap = {};
                for(var i =  0;i<selectedRows.length;i++){
                    currSelectedMap[selectedRows[i][valueMember]] = true;
                }
                var willBeDeletedMap = {};
                for (var i = 1, l = rows.length; i < l; i++) {
                    var e = rows[i];
                    if (valueMember && e.__currData && valueMap[e.__currData[valueMember]]) {
                        e.className = style.classSelectedRow;
                        e.children[0].className = style.classSelectedCheckBox;
                        e.__hasSelectedRow = true;
                        if(!currSelectedMap[e.__currData[valueMember]]){
                            selectedRows[selectedRows.length] = e.__currData;
                        }
                    } else {
                        e.className = style.classUnselectedRow;
                        e.children[0].className = style.classUnselectedCheckBox;
                        e.__hasSelectedRow = false;
                        if(currSelectedMap[e.__currData[valueMember]]){
                            willBeDeletedMap[e.__currData[valueMember]] = true;
                        }
                    }
                    if(ele.__currRow && ele.__currRow[valueMember] == e.__currData[valueMember]){
                        e.className = style.classCurrentRow;
                    }
                }
                for(var i = 0;i<selectedRows.length;i++){
                    if(willBeDeletedMap[selectedRows[i][valueMember]]){
                        selectedRows.splice(i,1);
                        i--;
                    }
                }
                var allres = self.GetValue(ele.parentElement);
                if(value && value.length && allres.length === value.length){
                    checkAll.__isCheck = true;
                    checkAll.className =  style.classSelectedCheckAllBox;
                }else {
                    checkAll.__isCheck = false;
                    checkAll.className =  style.classUnselectedCheckAllBox;
                }
            }
        })(this);
    };
}
window.forms.SetUIFieldsConv = function (style) {
    window.forms.SingleValueConv.apply(this,arguments);
    this.ApplyValue = function (ele, val) {
        if(typeof val === 'object'){
            var allEle = ele.ownerDocument.all;
            var field = null;
            var form = formCallCenter.DetectFormByElement(ele);
            if(!form)return;
            for(var i = 0;i<allEle.length;i++){
                if(allEle[i] === ele||allEle[i].tagName=== "script" || allEle[i].tagName==="head" || allEle[i].tagName=== "meta" || allEle[i].tagName=== "title") continue;
                field = allEle[i].getAttribute('field')||allEle[i].getAttribute('itemField');
                if(!field) continue;
                form.SetField(field,[GetPathData(val,field)]);
            }
            function GetPathData(data,path){
                if(!data||!path||!path.length)return data;
                var ps = path.split('.');
                for(var i=0;i<ps.length;i++){
                    data=data[ps[i]];
                    if(!data)break;
                }
                return data;
            }
        }
    }
};
//多选表格
FIISForm.CheckableTableViewConv = function (style,decode) {
    window.forms.CheckableTableViewConv.apply(this,arguments);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
//多选框
FIISForm.CheckboxButtonListConv = function (style,decode) {
    window.forms.CheckboxButtonListConv.apply(this,[style]);
    FIISForm.FIISValueDecoder.apply(this,[decode]);
};
FIISForm.GroupListConv = function (style,decode) {
    window.forms.GroupListConv.apply(this,[style]);
    FIISForm.FIISValueDecoder.apply(this,[decode]);
};

FIISForm.CloseableTileListConv = function (style, decode) {
    window.forms.CloseableTileListConv.apply(this, [style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
}

FIISForm.CheckboxListConv = function (style, decode) {
    window.forms.CheckboxListConv.apply(this, [null, style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};
FIISForm.ReadonlyListValueConv = function (style, decode) {
    window.forms.ReadonlyListValueConv.apply(this,[style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};

FIISForm.TreeViewConv = function (style, decode) {
    window.forms.TreeViewConv.apply(this, [style]);
    this.DecodeArguments = decode||function (ele, args) {
        return args[0];
    }
};
FIISForm.PathValueTableViewConv = function (style, decode) {
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
        var display = GetPathData(r,c.Name);
        window.forms.Element(e).SetText(display);
        e.title = display||"";
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
FIISForm.PathValueCheckableTableViewConv = function (style, decode) {
    FIISForm.CheckableTableViewConv.apply(this,arguments);
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
        var display = GetPathData(r,c.Name);
        window.forms.Element(e).SetText(display);
        e.title = display||"";
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

//requester
FIISForm.PathValueJsonRequester = function (obj,field) {
    this.Request = function (form, args, callback) {
        callback(GetPathData(obj,field));
        function GetPathData(data,path){
            if(!data||!path||!path.length)return data;
            var ps = path.split('.');
            for(var i=0;i<ps.length;i++){
                data=data[ps[i]];
                if(!data)break;
            }
            return data;
        }
    }
}