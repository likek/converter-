function NavigateModule(ele, module) {
    var p0 = { "field": "arg_NavigateModule_" + module,
        "command": "NotifyTitle",
        "conv": "window.forms.StaticValueConv('" + module + "')",
        "condFields": "cmd_NavigateModule,f_NotifyDataType,arg_NavigateModule_" + module,
        "requester": "navigateRequester"
    };
    var p1 = { "field": "f_NotifyDataType",
        "conv": "window.forms.StaticValueConv('object')"
    }
    var p2 = { "field": "cmd_NavigateModule",
        "conv": "window.forms.StaticValueConv('NavigateModule')"
    }
    usercommit(ele, p0, p1, p2);
}

window.forms.IdentifiedForm.DEBUG = 1;
function navigateRequester() {
    this.Request = function (form, args, callback) {
        var module = args[1];
        var url = module;
        callback(url);
    }
}
function navigateHandler() {
    window.forms.SingleValueConv.apply(this, null);
    this.DetermineApply = function (ele, value) {
        return true;
    }
    this.ApplyValue = function (ele, value) {
        window.forms.Element(ele).GetWindow().parent.location.href = value;
    }
}
