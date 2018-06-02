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
//不同报告状态对应样式
var reportStatusStyle = {
    "Arrived":{color:'#000'},
    "Calling":{color:'#000'},
    "Exam":{color:'#44f5ff'},
    "Leave":{color:'#000'},
    "Printed":{color:'#e30cff'},
    "Registered":{color:'#000'},
    "Rejected":{color:'#ff4232'},
    "Reported":{color:'#0000ff'},
    "Reviewed":{color:'#00ff00'},
    "Scheduled":{color:'#ffc61d'},
};