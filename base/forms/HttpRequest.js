function HttpRequest(method, async) {
    method = "POST";
    if (typeof (async) == "undefined") async = false;
    var Async = async;
    var xmlReq = NewXmlReq();
    var self = this;
    function NewXmlReq() {
        var req = null;
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
            if (req.overrideMimeType) req.overrideMimeType('text/xml');
        }
        else if (window.ActiveXObject) {
            var arrSignatures = ["Microsoft.XMLHTTP",
                               "MSXML2.XMLHTTP.5.0",
                               "MSXML2.XMLHTTP.4.0",
                               "MSXML2.XMLHTTP.3.0",
                               "MSXML2.XMLHTTP.1.0"];
            for (var i = 0; i < arrSignatures.length; i++) {
                try {
                    req = new ActiveXObject(arrSignatures[i]);
                    req.setRequestHeader("Content-Type", "text/xml;charset=utf-8");
                    break;
                }
                catch (err)
                { }
            }
        }
        if (!req)
            throw new Error("Fail to create xml messenger,perhaps the browser is unsupported");
        return req;
    }
    this.Query = function (url, params, callBack) {
        try {
            if (typeof (callBack) == "function") {
                if (Async) {
                    xmlReq.onreadystatechange = function () { callBack(self); }
                    xmlReq.open(method, url, true);
                    xmlReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xmlReq.send(params);
                }
                else {
                    xmlReq.open(method, url, false);
                    xmlReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xmlReq.send(params);
                    callBack(self);
                }
            }
            else {
                xmlReq.open(method, url, Async);
                xmlReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xmlReq.send(params);
            }
        }
        catch (err) {
            throw new Error("The service is unavailable");
        }
    }
    this.GetValue = function () {
        try {
            if (xmlReq.responseXML && xmlReq.responseXML.documentElement) {
                return (xmlReq.responseXML.documentElement.text || xmlReq.responseXML.documentElement.textContent);
            }
            else {
                return xmlReq.responseText;
            }
        }
        catch (err) {
            throw new Error("Service is unavailable");
        }
    }
    this.Release = function () {
        if (xmlReq) {
            if (xmlReq.onreadystatechange) xmlReq.onreadystatechange = null;
            xmlReq = null;
        }
    }
}
function loadXML(xmlString) {
    var xmlDoc = null;
    //判断浏览器的类型
    //支持IE浏览器 
    if (!window.DOMParser && window.ActiveXObject) {   //window.DOMParser 判断是否是非ie浏览器
        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
        for (var i = 0; i < xmlDomVersions.length; i++) {
            try {
                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
                break;
            } catch (e) {
            }
        }
    }
    //支持Mozilla浏览器
    else if (window.DOMParser && document.implementation && document.implementation.createDocument) {
        try {
            /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
            * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
            * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
            * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
            */
            domParser = new DOMParser();
            xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
        } catch (e) {
        }
    }
    else {
        return null;
    }

    return xmlDoc;
}