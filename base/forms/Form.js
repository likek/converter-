//__bindedData:前端元素绑定后台数据
//__currData:前端元素关联数据
//__form_states__:状态缓存
function manageElement(ele) {
    if (!ele.__form_states__) {
        var attributes = {};
        attributes.setAttr = ele.setAttribute;
        attributes.getAttr = ele.getAttribute;
        attributes.rmvAttr = ele.removeAttribute;
        attributes.flags = {};
        attributes.values = {};
        ele.setAttribute = function (attributes) {
            return function (name, value) {
                attributes.setAttr.apply(ele, [name, value]);
                attributes.values[name] = value;
                attributes.flags[name] = 1;
            }
        } (attributes);
        ele.getAttribute = function (attributes) {
            return function (name) {
                if (!attributes.flags[name]) {
                    attributes.values[name] = attributes.getAttr.apply(ele, [name]);
                    attributes.flags[name] = 1;
                }
                return attributes.values[name];
            }
        } (attributes);
        ele.removeAttribute = function (attributes) {
            return function (name) {
                delete attributes.values[name];
                delete attributes.flags[name];
                attributes.rmvAttr.apply(ele, [name]);
            }
        } (attributes);
        var objects = {};
        objects.names = {};
        objects.values = {};
        attributes.objects = objects;

        ele.__form_states__ = {};
        ele.__form_states__.formAttributes = attributes;
    }
    var result = ele.__form_states__;
    for (var i = 1; i < arguments.length; i++) {
        var p = arguments[i];
        if (typeof (p) != "string") break;
        if (!result[p]) result[p] = {};
        result = result[p];
    }
    return result;
}
//应考虑定期、递归清理（设计【内部对象】标记）
function unmanageElement(ele) {
    if (!ele.__form_states__ || !ele.__form_states__.formAttributes) return;
    var attributes = ele.__form_states__.formAttributes;
    ele.setAttribute = attributes.setAttr;
    ele.setAttribute = attributes.getAttr;
    ele.removeAttribute = attributes.rmvAttr;
    delete ele.__form_states__;
}
window.forms.SingleValueConv = function () {
    this.CompareValues = function (val1, val2) {
        return window.forms.object.Compare(val1, val2);
    }
    this.DetermineApply = function (self) {
        return function (ele, val) {
            return self.CompareValues(val, self.GetValue(ele)) != 0;
        }
    } (this);
    this.DecodeArguments = function (ele, args) {
        if (!window.forms.object(args).InstanceOf(Array)) throw new Error("Array arguments needed for Set");
        return args[0];
    }
    this.SetValue = function (self) {
        return function (ele, args) {
            var val = self.DecodeArguments(ele, args);
            if (!self.DetermineApply(ele, val)) return false;
            ele.__bindedData = val;
            self.ApplyValue(ele, val);
            var vc = ele.getAttribute("valueChanged");
            if (vc) {
                var vcEvt = eval(vc);
                if (typeof (vcEvt) == "function") vcEvt(ele);
            }
            return true;
        };
    } (this);
    this.GetValue = function (ele) {
        return ele.__bindedData;
    }
    this.GetUIValue = function (ele) {
        switch (ele.tagName) {
            case "SELECT":
                return ele.selectedIndex < 0 ? null : ele.options[ele.selectedIndex].value;
            default:
                return window.forms.Element(ele).GetText();
        }
    }
    this.ApplyValue = function (ele, val) {
        switch (ele.tagName) {
            case "OPTION":
                var select = window.forms.Element(ele).GetParent();
                var selectedIndex = -1;
                var options = select.options;
                for (var i = 0; i < options.length; i++) {
                    if (options[i].value == val) {
                        selectedIndex = i;
                        break;
                    }
                }
                select.selectedIndex = selectedIndex;
                break;
            default:
                window.forms.Element(ele).SetText(val);
                break;
        }
    }
}
window.forms.ListValueConv = function () {
    window.forms.SingleValueConv.apply(this);
    this.DecodeArguments = function (ele, args) {
        return args;
    }
    this.ApplyValue = function (self) {
        return function (ele, val) {
            self.ApplyItem(ele, val, -1);
            if (val && val.length > 0) {
                for (var i = 0; i < val.length; i++) {
                    self.ApplyItem(ele, val, i);
                }
            }
        };
    } (this);
    this.ApplyItem = function (self) {
        return function (ele, list, index) {
            var displayMember = ele.getAttribute("displayMember");
            var valueMember = ele.getAttribute("valueMember");
            switch (ele.tagName) {
                case "SELECT":
                    var options = ele.options;
                    if (index == -1) {
                        options.length = 0;
                        var events = manageElement(ele, "events");
                        window.forms.Event.Unregister(ele, events["onchange"]);
                        events["onchange"] = function () {
                            var itemField = ele.getAttribute("itemField");
                            if (!itemField || itemField == "") return;
                            var form = formCallCenter.DetectFormByElement(ele);
                            form.SetField(itemField, [ele.selectedIndex < 0 ? null : ele.options[ele.selectedIndex].__currData], true);
                        };
                        window.forms.Event.Register(ele, "onchange", events["onchange"]);
                    }
                    else {
                        var option = new Option(list[index][displayMember], list[index][valueMember]);
                        option.__currData = list[index];
                        options.add(option);
                        if (index == 0) self.InheritProperties(ele, option);
                    }
                    if (index == (list ? list.length - 1 : -1)) ele.selectedIndex = -1;
                    break;
            }
        }
    } (this);
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.ListValueConv.ListItemValueConv", true);
        return window.forms.Form.InheritAttributes(srcElement, desElement);
    }
    window.forms.ListValueConv.ListItemValueConv = function () {
        window.forms.SingleValueConv.apply(this);
        this.GetUIValue = function (ele) {
            var select = window.forms.Element(ele).GetParent();
            if (select.selectedIndex < 0) return undefined;
            var valueMember = select.getAttribute("valueMember");
            return select.options[select.selectedIndex].__currData[valueMember];
        }
    }
}
window.forms.Form = function (form) {
    var form = form;
    this.FormElement = function (self) {
        return function (ele) {
            var form = self.GetForm();
            return __formField(form, form.getAttribute("formID"), ele);
        }
    } (this);
    var __formField = function (self) {
        return function (form, form_ID, ele) {
            if (!ele) return false;
            if (form == ele) return true;
            if (ele.getAttribute) {
                var fFormID = ele.getAttribute("formID");
                if (fFormID) return form_ID == fFormID;
            }
            ele = window.forms.Element(ele).GetParent();
            return __formField(form, form_ID, ele);
        }
    } (this);
    var fieldFilter = function (self) {
        return function (ele) {
            var field = ele.getAttribute("field");
            return field && field.length > 0 && self.FormElement(ele);
        }
    } (this);
    var findElements = function (self) {
        return function (filter, result, owner) {
            if (arguments.length == 1) {
                result = [];
                findElements(filter, result);
                return result;
            }
            else {
                var wnd = owner ? owner.contentWindow : window.formRoot();
                var elements = wnd.document.all;
                for (var i = 0; i < elements.length; i++) {
                    var ele = elements[i];
                    manageElement(ele);
                    if (filter(ele)) result[result.length] = ele;
                }
                var iframes = wnd.document.getElementsByTagName("IFRAME");
                for (var i = 0; i < iframes.length; i++) {
                    findElements(filter, result, iframes[i]);
                }
            }
        }
    } (this);
    this.GetForm = function () {
        return form;
    }
    this.SetField = function (self) {
        return function (field, args, report) {
            if (!field || field == "") throw new Error("Null field");
            var e = null;
            var call = function (ele) {
                var init = manageElement(ele, "formInit");
                init.flag = true;
                self.GetConverter(ele).SetValue(ele, args);
                if (!e) {
                    var localField = ele.getAttribute("localField");
                    if (localField) {
                        try {
                            localField = eval(localField);
                        }
                        catch (err) {
                            localField = false;
                        }
                    }
                    if (!localField) e = ele;
                }
            }
            var filter = function (ele) {
                return ele.getAttribute("field") == field && self.FormElement(ele);
            };
            self.CallFields(call, filter);
            if (report && e) reportField(e);
        };
    } (this);
    this.GetField = function (self) {
        return function (field) {
            if (!field || field == "") throw new Error("Null field");
            var call = function (ele, out) {
                out.__return = true;
                return self.GetConverter(ele).GetValue(ele);
            }
            var filter = function (ele) {
                return ele.getAttribute("field") == field && self.FormElement(ele);
            };
            return self.CallFields(call, filter);
        };
    } (this);
    this.GetConverter = function (ele) {
        return window.forms.Element(ele).GetObject("conv", defConv);
    }
    function defConv() {
        this.SetValue = function (ele, args) {
            var conv = GetConvImpl(ele);
            return conv.SetValue(ele, args);
        }
        this.GetValue = function (ele) {
            var conv = GetConvImpl(ele);
            return conv.GetValue(ele);
        }
        this.GetUIValue = function (ele) {
            var conv = GetConvImpl(ele);
            return conv.GetUIValue(ele);
        }
        function GetConvImpl(ele) {
            if (!ele._defConv) {
                switch (ele.tagName) {
                    case "SELECT":
                        ele._defConv = new window.forms.ListValueConv();
                    default:
                        ele._defConv = new window.forms.SingleValueConv();
                }
            }
            return ele._defConv;
        }
    }
    this.CallFields = function (call, filter) {
        if (!filter) filter = fieldFilter;
        var eles = findElements(filter);
        var rt = undefined;
        var out = {};
        for (var i = 0; i < eles.length; i++) {
            rt = call(eles[i], out);
            if (out.__return) return rt;
        }
    }
}
window.forms.Form.SetAttribute = function (ele, attrName, attrValue, keepIfExists) {
    var oldVal = ele.getAttribute(attrName);
    var newVal;
    if (keepIfExists) {
        if (oldVal) {
            newVal = oldVal;
        }
        else {
            switch (typeof (oldVal)) {
                case 'object': //null
                case 'undefined': //undefined
                case 'string': //''
                    if (attrValue) {
                        newVal = attrValue;
                    }
                    else {
                        switch (typeof (attrValue)) {
                            case 'object': //null
                            case 'undefined': //undefined
                            case 'string': //''
                                newVal = null;
                                break;
                            case 'number': //0
                            case 'boolean': //false
                            default:
                                newVal = attrValue;
                                break;
                        }
                    }
                    break;
                case 'number': //0
                case 'boolean': //false
                default:
                    newVal = oldVal;
                    break;
            }
        }
    }
    else {
        if (attrValue) {
            newVal = attrValue;
        }
        else {
            switch (typeof (attrValue)) {
                case 'object': //null
                case 'undefined': //undefined
                case 'string': //''
                    if (oldVal) {
                        newVal = oldVal;
                    }
                    else {
                        switch (typeof (oldVal)) {
                            case 'object': //null
                            case 'undefined': //undefined
                            case 'string': //''
                                newVal = null;
                                break;
                            case 'number': //0
                            case 'boolean': //false
                            default:
                                newVal = oldVal;
                                break;
                        }
                    }
                    break;
                case 'number': //0
                case 'boolean': //false
                default:
                    newVal = attrValue;
                    break;
            }
        }
    }
    if (!newVal && typeof (newVal) == 'object') {
        ele.removeAttribute(attrName);
    }
    else {
        ele.setAttribute(attrName, newVal);
    }
}
window.forms.IdentifiedForm = function (form) {
    window.forms.Form.apply(this, arguments);
    var formID = null;
    this.FormElement = function (self) {
        return function (ele) {
            var form = self.GetForm();
            return __formField(form, form.getAttribute("formID"), ele);
        }
    } (this);
    var __formField = function (self) {
        return function (form, form_ID, ele) {
            if (!ele) return false;
            if (form == ele) return true;
            if (ele.getAttribute) {
                var fFormID = ele.getAttribute("formID");
                if (fFormID) return formID == fFormID || form_ID == fFormID;
            }
            ele = window.forms.Element(ele).GetParent();
            return __formField(form, form_ID, ele);
        }
    } (this);
    var CallCS_DEBUG = function (self) {
        return function (srcEle, itemTitle, args) {
            var title = args[0];
            var operation = args[2];
            switch (operation) {
                case window.FormOperations.Report:
                    self.Report.apply(null, [title, args[3]]);
                    break;
                case window.FormOperations.Request:
                default:
                    var ags = [];
                    for (var i = 3; i < args.length; i++) {
                        ags[ags.length] = args[i];
                    }
                    self.Request.apply(null, [srcEle, itemTitle, title, ags]);
                    break;
            }
        }
    } (this);
    this.Request = function (self) {
        return function (srcEle, itemTitle, title, args) {
            //            switch (title) {
            //                case "UserCode":
            //                    self.Response(title, ["UserCode"]);
            //                    break;
            //            }
        }
    } (this);
    this.Report = function (self) {
        return function (title, value) {
            //            switch (title) {
            //                case "UserCode":
            //                    self.Response("Password", [""]);
            //                    break;
            //            }
        }
    } (this);
    this.CallJS = function (self) {
        return function () {
            var title = arguments[0]; //#warning 应据此找到field
            var operation = arguments[1];
            var list = [];
            for (var i = 2; i < arguments.length; i++) {
                list[i - 2] = eval('(' + arguments[i] + ')');
            }
            switch (operation) {
                case window.FormOperations.Error:
                    if (typeof (self.MessageBox) != "function" || (!self.MessageBox())) messageBox(list);
                    break;
                default:
                    self.Response(title, list);
                    break;
            }
        }
    } (this);
    this.Response = function (self) {
        return function (title, args) {
            self.SetField(title, args, false);
        };
    } (this);
    this.SetFormID = function (self) {
        return function (id) {
            if (formID) throw new Error("window.forms.Form ID has been set");
            if (!id) throw new Error("Null ID");
            formID = id;
            var form = self.GetForm();
            window.forms.Form.SetAttribute(form, "formID", formID, false);
        }
    } (this);
    this.GetFormID = function () {
        return formID;
    }
    this.requestData = function (self) {
        return function (srcEle, itemTitle, title, args) {
            try {
                var ags = [title, formID, window.FormOperations.Request];
                if (args && args.length > 0) {
                    for (var i = 0; i < args.length; i++) {
                        ags[3 + i] = args[i];
                    }
                }
                if (window.forms.IdentifiedForm.DEBUG) {
                    CallCS_DEBUG(srcEle, itemTitle, ags);
                }
                else {
                    ags[0] = title;
                    window.CallCS(ags);
                }
            }
            catch (err) {
                alert("requestData failed:" + err.description + "(" + title + ")");
            }
        }
    } (this);
    this.reportField = function (self) {
        return function (ele) {			//元素数据改变，提交
            try {
                var localField = ele.getAttribute("localField");
                if (localField) {
                    try {
                        localField = eval(localField);
                    }
                    catch (err) {
                        localField = false;
                    }
                }
                if (localField) return;
                var fieldName = ele.getAttribute("field");
                if (!fieldName || fieldName == "") throw new Error("No field found");
                var val = self.GetConverter(ele).GetUIValue(ele);
                if (window.forms.IdentifiedForm.DEBUG) {
                    CallCS_DEBUG(ele, false, [fieldName, formID, window.FormOperations.Report, val]);
                }
                else {
                    window.CallCS([fieldName, formID, window.FormOperations.Report, val]);
                }
            }
            catch (err) {
                alert("reportField failed:" + err.description);
            }
        };
    } (this);
    this.valueChanged = function (self) {
        return function (ele) {				//元素值改变  
            var itemField = ele.getAttribute("itemField");
            if (itemField && itemField.length > 0) {
                var itemLocalField = ele.getAttribute("itemLocalField");
                if (itemLocalField) {
                    try {
                        itemLocalField = eval(itemLocalField);
                    }
                    catch (err) {
                        itemLocalField = false;
                    }
                }
                if (itemLocalField) return;
                var args = [];
                var condFields = ele.getAttribute("itemCondFields");
                if (condFields && condFields.length > 0) {
                    var fields = condFields.split(',');
                    for (var i = 0; i < fields.length; i++) {
                        args[i] = self.GetField(fields[i]);
                    }
                }
                self.requestData(ele, true, itemField, args);
            }
        };
    } (this);
    this.commit = function (self) {
        return function (ele) {
            try {
                var args = null;
                var condFields = ele.getAttribute("condFields");
                if (condFields) {
                    var fields = condFields.split(',');
                    if (fields.length > 0) {
                        args = [];
                        for (var i = 0; i < fields.length; i++) {
                            args[i] = self.GetField(fields[i]);
                        }
                    }
                }
                self.requestData(ele, false, ele.getAttribute("command"), args);
            }
            catch (err) {
                alert("commit failed:" + err.description);
            }
        };
    } (this);
    var initField = function (self) {
        return function (ele) {
            var args = null;
            var condFields = ele.getAttribute("condFields");
            if (condFields) {
                var fields = condFields.split(',');
                if (fields.length > 0) {
                    args = [];
                    for (var i = 0; i < fields.length; i++) {
                        args[i] = self.GetField(fields[i]);
                    }
                }
            }
            self.requestData(ele, false, ele.getAttribute("field"), args);
        };
    } (this);
    var initFieldFilter = function (self, list) {
        return function (ele) {
            var init = manageElement(ele, "formInit");
            if (init.flag) return false;
            init.flag = true;
            var field = ele.getAttribute("field");
            if (!field || field == "") return false;
            if (list[field]) return false; //避免重复请求同一字段。如果考虑给field增加子分类的概念，需结合子分类实现此功能
            if (ele.getAttribute("command") /* || ele.getAttribute("condFields")*/) return false;

            var localField = ele.getAttribute("localField");
            if (localField) {
                try {
                    localField = eval(localField);
                }
                catch (err) {
                    localField = false;
                }
            }
            if (localField) return false;
            if (!self.FormElement(ele)) return false;
            list[field] = true;
            return true;
        }
    };

    this.initAllFields = function (self) {
        return function () {
            self.CallFields(initField, initFieldFilter(self, {}));
        };
    } (this);
}
window.forms.IdentifiedForm.DEBUG = 0; //调试开关

var formCallCenter = function () {
    var wnd = window.formRoot();
    var impl = wnd._varFormCallCenter;
    if (!impl) {
        impl = wnd._varFormCallCenter = new function () {
            var forms = new window.forms.Map();
            var events = new window.forms.Map();
            this.RegisterEvent = function (eventName, eventHandler) {
                if (!eventHandler) return;
                var index = events.IndexOfKey(eventName);
                var list = null;
                if (index > -1) {
                    list = events.ValueForKey(eventName);
                }
                else {
                    list = [];
                    events.Add(eventName, list);
                }
                list[list.length] = eventHandler;
            }
            this.UnregisterEvent = function (eventName, eventHandler) {
                var index = events.IndexOfKey(eventName);
                if (index < 0) return;
                var list = events.ValueForKey(eventName);
                if (!eventHandler) {
                    list.length = 0;
                }
                else {
                    for (var i = list.length - 1; i > -1; i--) {
                        if (list[i] == eventHandler) {
                            for (var j = i; j < list.length - 1; j++) {
                                list[j] = list[j + 1];
                            }
                            list.length--;
                            break;
                        }
                    }
                }
                if (list.length < 1) events.RemoveAt(index);
            }
            this.RaiseEvent = function () {
                var eventName = arguments[0];
                var index = events.IndexOfKey(eventName);
                if (index < 0) return;
                var list = events.ValueForKey(eventName);
                var args = [];
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[args.length] = arguments[i];
                    }
                }
                var result = [];
                for (var i = 0; i < list.length; i++) {
                    result[result.length] = list[i].apply(null, args);
                }
                return result;
            }
            function innerIframe(parentWnd, childWnd) {
                if (!parentWnd) return false;
                var c = childWnd;
                while (c) {
                    if (c == c.parent) break;
                    c = c.parent;
                    if (c == parentWnd) return true;
                }
                return false;
            }
            this.RegisterForm = function (formID, form) {
                var ele = form.GetForm();
                formID = mapFormID(ele, formID);
                form.SetFormID(formID);

                var index = forms.IndexOfKey(formID);
                var exist = false;
                if (index > -1) {
                    var oldForm = forms.ValueForKey(formID);
                    var oldEle = oldForm.GetForm();
                    if (!innerIframe(ele.ownerDocument.parentWindow, oldEle.ownerDocument.parentWindow)) {
                        form = oldForm;
                        exist = true;
                    }
                    else {
                        oldForm.__unload__();
                    }
                }
                if (!exist) {
                    forms.Add(formID, form);
                    var eventHandler = function (fs, fID, e) {
                        return function () {
                            var index = fs.IndexOfKey(fID);
                            if (index > -1) fs.RemoveAt(index);
                            window.forms.Event.Unregister(formRoot(e), 'unload', arguments.callee);
                        }
                    } (forms, formID, ele);
                    form.__unload__ = eventHandler;
                    window.forms.Event.Register(formRoot(ele), 'unload', eventHandler);
                }
                form.initAllFields();
            }
            function mapFormID(form, formID) {
                var p = form;
                while (p) {
                    if (p.tagName == "IFRAME") {
                        var formMap = p.getAttribute("formMap");
                        if (formMap) formMap = eval("(" + formMap + ")");
                        if (formMap) {
                            var fID = formMap[formID];
                            if (fID) {
                                formID = mapFormID(window.forms.Element(p).GetParent(), fID);
                                break;
                            }
                        }
                    }
                    p = window.forms.Element(p).GetParent();
                }
                return formID;
            }
            this.GetFormByID = function (formID) {
                return forms.ValueForKey(formID);
            }
            this.CallJS = function () {
                var formID = arguments[1];
                var form = forms.ValueForKey(formID);
                if (!form) return;
                var array = [];
                if (arguments.length > 1) {
                    array[0] = arguments[0];
                    for (var i = 2; i < arguments.length; i++) {
                        array[array.length] = arguments[i];
                    }
                }
                form.CallJS.apply(null, array);
            }
            this.DetectFormByElement = function (ele) {
                for (var i = 0; i < forms.Count(); i++) {
                    var formID = forms.KeyAt(i);
                    var form = forms.ValueForKey(formID);
                    if (form.FormElement(ele)) return form;
                }
                return null;
            }
            this.FormOperations = { "Request": "Request", "Report": "Report", "Unkown": "Unkown", "Error": "Error" };
            this.CallCS = function () {
                var array = arguments[0];
                if (array && array.length > 0) {
                    var title = array[0];
                    var args = [];
                    for (var i = 1; i < array.length; i++) {
                        args[i - 1] = array[i];
                    }
                    return window.formRoot().external.CallCS(title, JSArray2ComArray(args));
                }
                else {
                    return window.formRoot().external.CallCS();
                }
            }
            function JSArray2ComArray(array) {
                var dictionary = new ActiveXObject("Scripting.Dictionary");
                for (var i = 0; i < array.length; i++) {
                    if (array[i] && window.forms.object(array[i]).InstanceOf(Array)) {
                        dictionary.add(i, JSArray2ComArray(array[i]));
                    }
                    else {
                        dictionary.add(i, array[i]);
                    }
                }
                return dictionary.Items();
            }
            this.reportField = function (self) {
                return function (ele) {
                    if (!ele) return;
                    var form = self.DetectFormByElement(ele);
                    if (!form) throw new Error("window.forms.Form for element not found:field=" + ele.getAttribute("field"));
                    return form.reportField(ele);
                }
            } (this);
            this.valueChanged = function (self) {
                return function (ele) {
                    if (!ele) return;
                    var form = self.DetectFormByElement(ele);
                    if (!form) throw new Error("window.forms.Form for element not found:field=" + ele.getAttribute("field"));
                    return form.valueChanged(ele);
                }
            } (this);
            this.commit = function (self) {
                return function (ele) {
                    if (!ele) return;
                    var form = self.DetectFormByElement(ele);
                    if (!form) throw new Error("window.forms.Form for element not found:field=" + ele.getAttribute("field"));
                    return form.commit(ele);
                }
            } (this);
        } ();
    }
    window.FormOperations = impl.FormOperations;
    window.CallCS = impl.CallCS;
    window.CallJS = impl.CallJS;
    window.reportField = impl.reportField;
    window.valueChanged = impl.valueChanged;
    window.commit = impl.commit;
    window.usercommit = function (refEle, param) {
        var args = [];
        args[0] = refEle;
        args[1] = commit;
        for (var i = 0; i < arguments.length - 1; i++) {
            args[2 + i] = arguments[1 + i];
        }
        window.useroperate.apply(null, args);
    }
    window.useroperate = function (refEle, action, param) {
        var form = impl.DetectFormByElement(refEle);
        var call = function () { wrapCall(form, action, param); };
        for (var i = 3; i < arguments.length; i++) {
            call = function (c, p) {
                return function () {
                    wrapCall(form, c, p);
                }
            } (call, arguments[i]);
        }
        call();
    }
    function wrapCall(form, call, param) {
        var root = form.GetForm();
        var doc = root.ownerDocument;
        var body = window.forms.Element(root).GetBody();
        var e = doc.createElement("div");
        try {
            e.style.display = "none";
            body.appendChild(e);
            window.forms.Form.CopyFormAttributes(param, e);
            if (form.GetFormID) window.forms.Form.SetAttribute(e, "formID", form.GetFormID(), true);
            call(e);
        }
        catch (err) {
            throw err;
        }
        finally {
            var p = window.forms.Element(e).GetParent();
            if (p) p.removeChild(e);
        }
    }
    return impl;
} ();

window.forms.Form.InheritAttributes = function (parent, child) {
    function ca(p, c, pn, cn, k) {
        window.forms.Form.SetAttribute(c, cn, p.getAttribute(pn), k);
    }
    ca(parent, child, "itemLocalField", "localField", false);
    ca(parent, child, "itemField", "field", false);
    ca(parent, child, "itemCondFields", "condFields", false);
    ca(parent, child, "itemCommand", "command", false);
    ca(parent, child, "itemFormID", "formID", false);
    ca(parent, child, "itemItemField", "itemField", false);
    ca(parent, child, "itemInputMember", "inputMember", false);
    ca(parent, child, "itemDisplayMember", "displayMember", false);
    ca(parent, child, "itemValueMember", "valueMember", false);
    ca(parent, child, "itemFormMap", "formMap", false);
    ca(parent, child, "itemValueChanged", "valueChanged", false);
    ca(parent, child, "itemConv", "conv", false);

    ca(parent, child, "formID", "formID", true);
    ca(parent, child, "inputMember", "inputMember", true);
    ca(parent, child, "displayMember", "displayMember", true);
    ca(parent, child, "valueMember", "valueMember", true);
    //    ca(parent, child, "formMap", "formMap", true);
    return ca;
}
window.forms.Form.CopyFormAttributes = function (source, destination) {
    function ca(s, d, n) {
        var val = s.getAttribute ? s.getAttribute(n) : s[n];
        if (d.setAttribute) {
            window.forms.Form.SetAttribute(d, n, val, false);
        }
        else {
            d[name] = val;
        }
    }
    var fields = [
    "command", "condFields", "field", "localField", "conv", "itemField", "itemLocalField", "formID", "inputMember", "displayMember", "valueMember", "formMap", "valueChanged",
    "itemCommand", "itemCondFields", "itemField", "itemConv", "itemField", "itemFormID", "itemInputMember", "itemDisplayMember", "itemValueMember", "itemFormMap", "itemValueChanged"
    ];
    for (var i = 0; i < fields.length; i++) {
        ca(source, destination, fields[i]);
    }
    return ca;
}