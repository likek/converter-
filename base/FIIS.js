window.forms.Form.CopyFormAttributes = function (impl) {
    return function (source, destination) {
        var copy = impl(source, destination);
        var fields = ["requester", "itemRequester"];
        for (var i = 0; i < fields.length; i++) {
            copy(source, destination, fields[i]);
        }
        return copy;
    }
} (window.forms.Form.CopyFormAttributes);
window.forms.Form.InheritAttributes = function (impl) {
    return function (parent, child) {
        var inherit = impl(parent, child);
        inherit(parent, child, "itemRequester", "requester", false);
        return inherit;
    }
} (window.forms.Form.InheritAttributes);

function FIISForm(form) {
    window.forms.IdentifiedForm.apply(this, arguments);
    this.GetConverter = function (ele) {
        return window.forms.Element(ele).GetObject("conv", window.forms.CacheValueConv);
    }
    this.Report = function (self) {
        return function (title, value) {
            switch (title) {
                default:
                    self.Response(title, [value]);
                    break;
            }
        }
    } (this);
    this.Request = function (self) {
        return function (srcEle, itemTitle, title, args) {
            var _ele = window.forms.Element(srcEle);
            var requester = itemTitle ? _ele.GetObject("itemRequester") : _ele.GetObject("requester");
            if (requester) {
                if (!requester.Item) requester.Item = title;
                if (typeof (requester.Request) != "function") requester = new FIISForm.WSVCRequester(requester.ServiceUrl, requester.Catalog, requester.Item);
            }
            if (itemTitle && !requester) return;
            switch (title) {
                case "NotifyTitle":
                    {
                        title = args[0];
                        args = [args[1], args[2]];
                    }
                    break;
            }
            if (!requester) throw new Error("Requester for '" + title + "' not found");
            requester.Request(self, args, function (result) {
                self.Response(title, [result]);
            });
        }
    } (this);
}
FIISForm.WSVCRequester = function (serviceUrl, catalog, item) {
    this.Request = function (form, args, callback) {
        var req = new HttpRequest("POST", false);
        var response = function (req) {
            var result = eval("(" + req.GetValue() + ")");
            switch (result.ErrorCode) {
                case "0000":
                    result = eval("(" + result.Message + ")");
                    break;
                default:
                    result.ErrorCode = "FFFF";
                    result.Result = null;
                    break;
            }
            callback(result);
        }
        req.Query(serviceUrl, "catalog=" + encodeURIComponent(catalog) + "&action=" + encodeURIComponent(item) + "&input=" + encodeURIComponent(args[0].getJsonRaw()), response);
    }
}
FIISForm.JSVarRequester = function (varName) {
    this.Request = function (form, args, callback) {
        callback(eval(varName));
    }
}
FIISForm.JSObjectRequester = function (obj) {
    this.Request = function (form, args, callback) {
        callback(obj);
    }
}
FIISForm.JSFuncRequester = function (func) {
    this.Request = function (form, args, callback) {
        callback(func.apply(null, args));
    }
}
FIISForm.FIISValueDecoder = function (decode) {
    var decode = typeof (decode) != "function" ? function (ele, args) {
        if (!args[0].ErrorCode) return args[0];
        switch (args[0].ErrorCode) {
            case "0000":
                return args[0].Result;
            default:
                return null;
        }
    } : decode;
    this.decode = decode;
    this.DecodeArguments = function (ele, args) {
        return decode(ele, args);
    }
}
FIISForm.SingleValueConv = function (decode) {
    window.forms.SingleValueConv.apply(this);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
}
FIISForm.ListValueConv = function (decode) {
    window.forms.ListValueConv.apply(this);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
    var inherit = this.InheritProperties;
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "FIISForm.ListValueConv.ListItemValueConv", true);
        return inherit(srcElement, desElement);
    }
    FIISForm.ListValueConv.ListItemValueConv = function () {
        window.forms.SingleValueConv.apply(this);
        this.GetUIValue = function (self) {
            return function (ele) { return self.GetValue(ele); }
        } (this);
        this.ApplyValue = function (ele, value) {
            var valueMember = ele.getAttribute("valueMember");
            var select = window.forms.Element(ele).GetParent();
            var selectedIndex = -1;
            var options = select.options;
            for (var i = 0; i < options.length; i++) {
                if (options[i].value == value[valueMember]) {
                    selectedIndex = i;
                    break;
                }
            }
            select.selectedIndex = selectedIndex;
        }
    }
}
FIISForm.ListViewConv = function (userInput, filter, style, decode) {
    window.forms.ListViewConv.apply(this, [userInput, filter, style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
}
FIISForm.DropDownListConv = function (style, decode) {
    window.forms.DropDownListConv.apply(this, [style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
}
FIISForm.FilterableListConv = function (userInput, style, decode) {
    window.forms.FilterableListConv.apply(this, [userInput, style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
}
FIISForm.TileListConv = function (style, decode) {
    window.forms.TileListConv.apply(this, [style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
}
FIISForm.RadioButtonListConv = function (style, decode) {
    window.forms.RadioButtonListConv.apply(this, arguments);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};

FIISForm.TableViewConv = function (style, decode) {
    window.forms.TableViewConv.apply(this, arguments);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};


FIISForm.CheckboxListConv = function (style, decode) {
    window.forms.CheckboxListConv.apply(this, [null, style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};

FIISForm.FilterableCheckboxListConv = function (style, decode) {
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
    window.forms.CheckboxListConv.apply(this, [filter, style]);
    FIISForm.FIISValueDecoder.apply(this, [decode]);
};


FIISForm.GroupValueConv = function () {
    window.forms.SingleValueConv.apply(this);
    this.GetUIValue = function (ele) {
        var members = findMembers(ele);
        var val = {};
        var form = formCallCenter.DetectFormByElement(ele);
        for (var i = 0; i < members.length; i++) {
            val[members[i].field] = window.forms.Element(members[i]["element"]).GetText();
        }
        return val;
    }
    this.ApplyValue = function (ele, value) {
        var members = findMembers(ele);
        var form = formCallCenter.DetectFormByElement(ele);
        for (var i = 0; i < members.length; i++) {
            form.SetField(members[i].field, [value ? value[members[i]["field"]] : null], true);
        }
    }
    function findMembers(ele, members) {
        if (!members) members = { 'items': {}, 'indices': [] };
        for (var i = 0; i < ele.children.length; i++) {
            findMembers(ele.children[i], members);
            var ignoreMember = ele.children[i].getAttribute("ignoreMember");
            if(ignoreMember)continue;
            var f = ele.children[i].getAttribute("field");
            if (!f || f == "") continue;
            if (!members.items[f]) {
                members.items[f] = 1;
                members.indices[members.indices.length] = { 'field': f, 'element': ele.children[i] };
            }
        }
        return members.indices;
    }
}
FIISForm.FastListCacheConv = function (valueMember, displayMember) {
    FIISForm.SingleValueConv.apply(this);
    var decode = this.DecodeArguments;
    this.DecodeArguments = function (ele, value) {
        value = decode(ele, value);
        if (!value) value = [];
        value.keyValues = {};
        for (var i = 0; i < value.length; i++) {
            value.keyValues[value[i][valueMember]] = value[i];
        }
        value.getItem = function (pkValue) {
            var item = value.keyValues[pkValue];
            if (!item) {
                item = {};
                item[valueMember] = pkValue;
                item[displayMember] = pkValue;
            }
            return item;
        }
        return value;
    }
};
FIISForm.FastListCacheConv.findItem = function (form, row, listFieldName, valueMember, displayMember) {
    var list = form.GetField(listFieldName);
    var code = row[valueMember];
    var getItem = list && typeof (list.getItem) == "function" ? list.getItem : function (code) {
        return {
            valueMember: code,
            displayMember: code
        };
    }
    return getItem(code);
};