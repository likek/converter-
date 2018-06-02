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
};

components.ImageTransform = function (config) {
    var self = this;
    self.status = {};
    self.transform = function () {
        //目标元素的事件函数集合:
        var targetElement = config.targetElement;
        function transform(ele, conf) {
            ele.style.transform = 'rotate(' + (conf.deg || self.status.deg) + "deg)" + ' scale(' + (conf.scale || self.status.scale) + ')';
            if (conf.x && conf.y) {
                ele.style.transformOrigin = conf.x + ' ' + conf.y;
            }else {
                ele.style.transformOrigin = "center";
            }
            if (conf.left||conf.left === 0) {
                ele.style.left = conf.left + 'px';
            }
            if (conf.top||conf.top === 0) {
                ele.style.top = conf.top + 'px';
            }
        }
        return {
            scale: function (style) {
                var x = self.scaleDetail; //缩放比例
                switch (style) {
                    case '1':
                        if (self.status.scale >= (config.maxScale||5)) {
                            //已到最大级别
                            return;
                        }
                        self.status.scale += x;
                        transform(targetElement, {});
                        break;
                    case '-1':
                        if (self.status.scale <= (config.minScale||0.1)) {
                            //已到最小级别
                            return;
                        }
                        self.status.scale -= x;
                        transform(targetElement, {});
                        break;
                    default:
                        console.error("参数类型错误:ImageTransform.transform().scale要求参数为字符串1或-1");
                        break;
                }
            },
            rotate: function (deg,relativePos) {
                relativePos = typeof relativePos === "number"? relativePos : self.status.deg;
                self.status.deg = +relativePos + (+deg);
                transform(targetElement, {});
            },
            reset: function () {
                //还原:
                transform(targetElement, { deg: "0", scale: 1, left: self.status.initLeft, top: self.status.initTop});
                self.status.scale = 1;
                self.status.deg = 0;
            },
            move: function (e, endMoveEvent) {
                //移动:
                var ev = e || window.event;
                var startX = ev.pageX;
                var startY = ev.pageY;
                var imgStartX = targetElement.offsetLeft;
                var imgStartY = targetElement.offsetTop;
                targetElement.style.cursor = 'move';
                targetElement.removeEventListener('mousemove',mouseMoveFunc);
                targetElement.addEventListener('mousemove',mouseMoveFunc);
                targetElement.removeEventListener(endMoveEvent,endMoveHandle);
                targetElement.addEventListener(endMoveEvent,endMoveHandle);
                function mouseMoveFunc(e) {
                    var ev = e || window.event;
                    ev.preventDefault();
                    var endX = ev.pageX;
                    var endY = ev.pageY;
                    var CX = endX - startX;
                    var CY = endY - startY;
                    targetElement.style.left = imgStartX + CX + "px";
                    targetElement.style.top = imgStartY + CY + "px";
                }
                function endMoveHandle(e) {
                    targetElement.style.cursor = 'default';
                    targetElement.removeEventListener('mousemove', mouseMoveFunc);
                }
            }
        }
    };
    var targetElement = config.targetElement;
    if (!(targetElement instanceof HTMLElement)) {
        console.error('参数类型错误:targetElement必须为HTMLElement类型');
        return;
    }
    targetElement.removeEventListener('load',init);
    targetElement.addEventListener('load',init);
    if(targetElement.complete)init();//解决有缓存时load事件不执行的问题
    function init() {
        if(targetElement.__initCompleted)return;//防止src变化时和刷新页面时的多次初始化
        dataInit();
        eventInit();
        if (config.menuList) menuListInit();
        targetElement.style.position = 'absolute';
        targetElement.style.left = self.status.initLeft + "px";
        targetElement.style.top = self.status.initTop + "px";
        targetElement.__initCompleted = true;
    }
    function menuListInit() {
        if(config.menuList instanceof HTMLElement){
            config.menuList.style.position = 'fixed';
            config.menuList.style.display = 'none';
            var targetElement = config.targetElement;
            config.menuList.removeEventListener('mouseout',mouseout);
            config.menuList.addEventListener('mouseout',mouseout);
            config.menuList.removeEventListener('mouseover',mouseover);
            config.menuList.addEventListener('mouseover',mouseover);
            targetElement.removeEventListener('contextmenu',contextmenu);
            targetElement.addEventListener('contextmenu',contextmenu);
            function mouseout(e) {config.menuList.style.display = 'none';}
            function mouseover(e) {config.menuList.style.display = 'block';}
            function contextmenu(e) {
                var e = e || window.event;
                e.preventDefault();
                var Px = e.clientX;
                var Py = e.clientY;
                config.menuList.style.display = 'block';
                config.menuList.style.top = Py - 20 + 'px';
                config.menuList.style.left = Px -20 + 'px';
            }
        }
    }
    function eventInit() {
        //事件绑定:
        var transform = self.transform(); //变换方法集合
        var targetElement = config.targetElement; //被操作的目标元素
        targetElement.removeEventListener('mousedown',mousedown);
        targetElement.addEventListener('mousedown',mousedown);
        targetElement.removeEventListener('mousewheel',mousewheel);
        targetElement.addEventListener('mousewheel',mousewheel);
        function mousedown(e) {var ev = e || window.event;transform.move(ev, 'mouseup');}
        function mousewheel(e) {
            var ev = e || window.event;
            ev.preventDefault(); //防止有滚动条时缩小时跳动
            if (ev.wheelDelta > 0) {
                transform.scale('1');
            } else {
                transform.scale('-1');
            }
        }
    }
    function dataInit() {
        self.scaleDetail = config.scaleDetail || 0.05; //缩放比
        self.status = {
            initWidth: config.initWidth||config.targetElement.clientWidth,
            initHeight: config.initHeight||config.targetElement.clientHeight,
            initLeft:config.initLeft||config.targetElement.offsetLeft,
            initTop:config.initTop||config.targetElement.offsetTop,
            deg: 0,
            scale: 1
        };
    }
};
components.cookies = {
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
components.windowModal = function(url,args,winName,style){
    var win = window.top;
    components.windowModal.__hasOpendWin = components.windowModal.__hasOpendWin||{};
    winName = winName || "components.windowModal";//如果不指定name则始终打开名为components.windowModal的窗口
    style = style || {};
    if(components.windowModal.__hasOpendWin[winName] && !components.windowModal.__hasOpendWin[winName].closed){
        components.windowModal.__hasOpendWin[winName].postMessage({msg:"data",data:args},'*');
    }else {
        var width = style.width || win.screen.availWidth * 0.4;
        var height = style.height || Math.min(width,win.screen.availHeight * 0.9);
        var left = style.left || (win.screen.availWidth - width)/2;
        var top = style.top || (win.screen.height - height)/2;
        var conf = "height="+height + ",width="+width +",left="+left + ",top=" + top + ",toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no ,alwaysRaised=on, dependent=on";
        if(!!window.ActiveXObject||"ActiveXObject" in window){//ie不能有缓存,否则部分内容(如图片)会加载失败
            var l = url.match(/\?/) ? '&':"?";
            url += l + "windowModalBirthTime=" + new Date().getTime();
        }
        var winModal = win.open (url, winName, conf);
        window.forms.Event.Register(winModal,'load',function (ev) {//如果重复打开同一个窗口则创建时才会执行load事件，不会重复执行
            var wm = this;
            wm.postMessage({msg:"ready"},'*');
        });
        components.windowModal.__hasOpendWin[winName] = winModal;
        window.forms.Event.Register(window,'message',function (ev) {
            var data = ev.data;
            switch (data.msg){
                case "ready":
                    winModal.postMessage({msg:"data",data:args},"*");
                    break;
            }
        });
    }
}
components.exportAsExcel = function (tabledata,columns,fileName) {//tabledata.length <= 65535
    if(!tabledata||!columns) return;
    fileName = fileName||'export';
    function StringBuffer() {
        this.content = new Array;
    }
    StringBuffer.prototype.append = function(str) {
        this.content.push(str);
    };
    StringBuffer.prototype.prepend = function(str) {
        this.content.unshift(str);
    };
    StringBuffer.prototype.toString = function() {
        return this.content.join("");
    };
    var MSDocType = 'excel';
    var MSDocExt = 'xls';
    var MSDocSchema = 'xmlns:x="urn:schemas-microsoft-com:office:excel"';
    var docData = new StringBuffer();
    //thead
    docData.append('<table>');
    docData.append('<thead><tr>');
    for(var c= 0;c < columns.length;c++){
        docData.append('<th>'+ columns[c].Description +'</th>');
    }
    docData.append('</tr></thead>');
    //tbody
    docData.append('<tbody>');
    if(tabledata instanceof Array){
        for(var i=0;i<tabledata.length;i++){
            docData.append('<tr style="'+ tabledata[i].RowStyle+'">');
            for(var c= 0;c < columns.length;c++){
                docData.append('<td>'+ getPathData(tabledata[i],columns[c].Name) +'</td>')
            }
            docData.append('</tr>');
        }
    }
    docData.append('</tbody></table>');

    var docFile = new StringBuffer();

    docFile.append('<html xmlns:o="urn:schemas-microsoft-com:office:office" ' + MSDocSchema + ' xmlns="http://www.w3.org/TR/REC-html40">');
    docFile.append('<meta http-equiv="content-type" content="application/vnd.ms-' + MSDocType + '; charset=UTF-8">');
    docFile.append("<head>");
    if (MSDocType === 'excel') {
        docFile.append("<!--[if gte mso 9]>" );
        docFile.append("<xml>"                 );
        docFile.append("<x:ExcelWorkbook>"     );
        docFile.append("<x:ExcelWorksheets>" );
        docFile.append("<x:ExcelWorksheet>"    );
        docFile.append("<x:Name>"              );
        docFile.append('sheet' + new Date().getTime());
        docFile.append("</x:Name>"             );
        docFile.append("<x:WorksheetOptions>"  );
        docFile.append("<x:DisplayGridlines/>" );
        docFile.append("</x:WorksheetOptions>" );
        docFile.append("</x:ExcelWorksheet>" );
        docFile.append("</x:ExcelWorksheets>"  );
        docFile.append("</x:ExcelWorkbook>"    );
        docFile.append("</xml>"                );
        docFile.append("<![endif]-->"        );
    }
    docFile.append( "</head>");
    docFile.append( "<body>");
    for(var i =0; i<docData.content.length ; i++){
        docFile.append(docData.content[i].toString());
    }
    docFile.append( "</body>");
    docFile.append( "</html>");

    try {
        var blob = new Blob(docFile.content,{type: 'application/vnd.ms-excel'});
        saveAs(blob, (fileName) + '.' + MSDocExt+"x");
    }
    catch (e) {
        //...
        console.warn('export error:' + e)
    }
    function saveAs(blob, filename) {
        var type = blob.type;
        var force_saveable_type = 'application/octet-stream';
        if (type && type !== force_saveable_type) { // 强制下载
            var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
            blob = slice.call(blob, 0, blob.size, force_saveable_type);
        }
        if('msSaveOrOpenBlob' in navigator){ //IE
            window.navigator.msSaveOrOpenBlob(blob, filename);
        }else{ //标准
            var url = URL.createObjectURL(blob);
            var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = url;
            save_link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
            URL.revokeObjectURL(url);
        }
    }
    function getPathData(data, path) {
        if(!data||!path||!path.length)return data;
        var ps = path.split('.');
        for(var i = 0;i<ps.length;i++){
            data = data[ps[i]];
            if(!data)break;
        }
        return data;
    }
}
components.ageConverter = { //假设1年365天，一个月30天
    ageToDate:function (age,unit) {
        if(!age||!(age - 0))return null;
        if(age<0)age = 0;
        var now = new Date();
        var birth = new Date();
        switch (unit){
            case "H":
                var y = Math.floor(age/(365*24));//年
                var m = Math.floor(age/(30*24));//月
                var d = Math.floor(age/24);//天
                birth.setFullYear(now.getFullYear() - y);
                birth.setMonth(now.getMonth() - m);
                birth.setMonth(now.getDate() - d);
                break;
            case "D":
                var y = Math.floor(age/365);//年
                var m = Math.floor(age/30);//月
                birth.setFullYear(now.getFullYear() - y);
                birth.setMonth(now.getMonth() - m);
                birth.setDate(now.getDate() - age%7);
                break;
            case "W":
                var y = Math.floor(age/52);//年
                var m = Math.floor(age/4.29);//月
                birth.setFullYear(now.getFullYear() - y);
                birth.setMonth(now.getMonth() - m);
                birth.setDate(now.getDate() - 7*age);
                break;
            case 'M':
                var y =Math.floor(age/12);//年
                birth.setFullYear(now.getFullYear() - y);
                birth.setMonth(now.getMonth() - age%12);
                break;
            case 'Y':
            default:
                birth.setFullYear(now.getFullYear() - age);
                break;
        }
        return birth;
    },
    dateToAge:function (date) {
        if(date instanceof Date){
            var now = new Date();
            var age = now - date;
            if(age>0){
                var y = Math.floor(age/(365*24*60*60*1000));//年
                if(y!==0)return {age:y,unit:"Y"};

                var m = Math.floor(age/(30*24*60*60*1000)%12);//月
                if(m!==0)return {age:m, unit:"M"};

                // var w = Math.floor((age/(7*24*60*60*1000))%4.29);//周
                // if(w!==0)return {age:w, unit:"W"};

                var d = Math.floor((age/(24*60*60*1000))%30);//天
                if(d!==0)return {age:d, unit:"D"};

                var h = Math.floor((age/(60*60*1000))%24);//小时
                if(h!==0)return {age:h,unit:"H"};

                return {age:0,unit:"Y"}
            }else {
                return {age:0,unit:"Y"};
            }
        }else {
            return {age:0,unit:"Y"};
        }
    }
}