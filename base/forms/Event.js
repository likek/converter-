window.forms.Event = function () {
    var evt = event || window.event;
    if (!evt) {
        try {
            var func = window.forms.Event.caller;
            while (func != null) {
                evt = func.arguments[0];
                if (evt) {
                    if ((evt.constructor == window.forms.Event || evt.constructor == MouseEvent) || (typeof (evt) == "object" && evt.preventDefault && evt.stopPropagation)) {
                        break;
                    } else {
                        evt = null;
                    }
                }
                func = func.caller;
            }
        } catch (err) {
        }
    }
    if (!evt) evt = {};
    if (evt) {
        evt.KeyCode = function () {
            return evt.which || evt.keyCode;
        }
        evt.Source = function () { return evt.target || evt.srcElement };
        evt.Destination = function () {
            var dest = evt.toElement || evt.relatedTarget;
            //            if (!dest) dest = evt.target || evt.srcElement;
            return dest;
        };
        if (!evt.stopPropagation) {
            evt.stopPropagation = function () {
                evt.cancelBubble = true;
            }
        }
        evt.Offset = function (ev) {
            return function () {
                return { 'x': ev.offsetX, 'y': ev.offsetY };
            }
        } (evt, evt.Source());
    }
    return evt;
}
window.forms.Event.KeyCode = function () { return new window.forms.Event().KeyCode(); }
window.forms.Event.Source = function () { return new window.forms.Event().Source(); }
window.forms.Event.Destination = function () { return new window.forms.Event().Destination(); }
window.forms.Event.stopPropagation = function () { return new window.forms.Event().stopPropagation(); }
window.forms.Event.Register = function (ele, eventName, eventHandler) {
    if (!eventHandler) return;
    if (ele.attachEvent) {
        if (eventName.indexOf("on") == 0) {
            ele.attachEvent(eventName, eventHandler);
        }
        else {
            ele.attachEvent("on" + eventName, eventHandler);
        }
    }
    else {
        if (eventName.indexOf("on") == 0) {
            ele.addEventListener(eventName.slice(2), eventHandler, true);
        }
        else {
            ele.addEventListener(eventName, eventHandler, true);
        }
    }
}
window.forms.Event.Unregister = function (ele, eventName, eventHandler) {
    if (!eventHandler) return;
    if (ele.detachEvent) {
        if (eventName.indexOf("on") == 0) {
            ele.detachEvent(eventName, eventHandler);
        }
        else {
            ele.detachEvent("on" + eventName, eventHandler);
        }
    }
    else {
        if (eventName.indexOf("on") == 0) {
            ele.removeEventListener(eventName.slice(2), eventHandler, true);
        }
        else {
            ele.removeEventListener(eventName, eventHandler, true);
        }
    }
}
window.forms.Event.HookMouseEvent = function (root, eventName, handler, mouseEventFilter) {
    if (!root || !root.ownerDocument || !eventName || !handler) return;
    var body = window.forms.Element(root).GetBody();
    if (!body) return;

    var events = manageElement(root, "events");

    root.__hook__body = body;
    if (!mouseEventFilter) {
        mouseEventFilter = function (refEle, currEle) {
            while (currEle) {
                if (currEle == refEle) return true;
                currEle = window.forms.Element(currEle).GetParent();
            }
            return false;
        }
    };
    window.forms.Event.Unregister(body, eventName, events[eventName]);
    events[eventName] = function () {
        if (!root.ownerDocument) {
            window.forms.Event.Unregister(body, eventName, root[eventName]);
        }
        else {
            var evt = window.forms.Event();
            var src = evt.Source();
            handler(mouseEventFilter(root, src));
        }
    }
    window.forms.Event.Register(body, eventName, events[eventName]);
}
window.forms.Event.UnhookMouseEvent = function (root, eventName) {
    if (!root || !root.ownerDocument || !eventName) return;
    var body = root.__hook__body;
    if (!body) return;
    var events = manageElement(root, "events");
    window.forms.Event.Unregister(body, eventName, events[eventName]);
    delete events[eventName];
    delete root.__hook__body;
}
window.forms.Event.ObserveOnce = function (ele, eventName, eventHandler) {
    var reg = function () {
        try {
            eventHandler.apply(null, arguments);
        }
        catch (err) {
            throw err;
        }
        finally {
            window.forms.Event.Unregister(ele, eventName, arguments.callee);
        }
    }
    window.forms.Event.Register(ele, eventName, reg);
}