function TreeView(ele, style) {
    var _t = this;
    var currData;
    var currNode;
    this.InsertNodes = function (p, d) {
        if(d instanceof Array){
            var oldD = getNodeData(p);
            if(!oldD){
                addTree(p,d);
            }else {
                var parent = getParentNode(p);
                if(parent){
                    var c = oldD[style.childNodesMember]||[];
                    var v= {};
                    v[style.displayMember] = oldD[style.displayMember];
                    v[style.childNodesMember] = c.concat(d);
                    var b = p.parentElement;
                    addTree(b,[v]);
                    _t.Remove(p);
                    refreshTrunkData(parent);
                }else {
                    var box;
                    if(oldD[style.childNodesMember]){
                        box = p.nextSibling;
                        addTree(box,d);
                        refreshTrunkData(p);
                        if(_t.CurrNode() === p){
                            currData = getNodeData(p);
                        }
                    }else {
                        var idx = getIndex(p);
                        box = p.parentElement;
                        box.removeChild(p);
                        var t = {};
                        t[style.displayMember] = oldD[style.displayMember];
                        t[style.childNodesMember] = d;
                        addTree(box,[t]);
                        function getIndex(ele) {
                            var ns = ele.parentElement.children;
                            for(var i=0;i<ns.length;i++){
                                if(ns[i] === ele){
                                    return i;
                                }
                            }
                            return -1;
                        }


                    }
                }
            }


        }
    };
    this.CurrData = function () {
        return currData;
    };
    this.CurrNode = function () {
        return currNode;
    };
    this.Remove = function (node) {
        if(currNode === node){currNode = void 0;currData = void 0;}
        var childNodes = getChildNodes(node);
        var nodeBox = node.parentElement;
        var parent = getParentNode(node);
        if(childNodes){nodeBox.removeChild(childNodes[0].parentElement)}
        nodeBox.removeChild(node);
        if(nodeBox.children.length===0){nodeBox.parentElement.removeChild(nodeBox);parent.__nodeIcon.innerHTML = '';}
        if(parent){
            refreshTrunkData(parent);
        }
    };
    this.Update = function (node, txt) {
        var old = getNodeData(node);
        var newData = {};
        newData[style.displayMember] = txt;
        if(old[style.childNodesMember]){
            newData[style.childNodesMember] = old[style.childNodesMember];
        }
        setDisplayText(node,txt);
        setNodeData(node,newData);
        var parent = getParentNode(node);
        if(parent){
            refreshTrunkData(parent);
        }
        if(_t.CurrNode() === node){
            currData = getNodeData(node);
        }
    };

    this.ondrawnode = function (nodeText, data) {};

    function setNodeData(node,d) {
        node.__nodeData = d;
    }
    function getParentNode(node) {
        return node.__parentNode;
    }
    function getNodeData(node) {
        return node.__nodeData;
    }
    function getChildNodes(node) {
        return node.__childNodes;
    }
    function setDisplayText(node,txt) {
        node.__displayEle.innerHTML = txt;
    }
    function refreshTrunkData(startNode) {
        var d=[];
        var childNodes = getChildNodes(startNode);
        if(childNodes){
            for (var i= 0;i<childNodes.length;i++){
                var value = getNodeData(childNodes[i]);
                if(value){
                    d.push(value);
                }
            }
        }
        var newData = {};
        newData[style.displayMember] = getNodeData(startNode)[style.displayMember];
        if(d.length>0)newData[style.childNodesMember] = d;
        if(startNode){
            setNodeData(startNode,newData);
        }
        if(getParentNode(startNode)){
            arguments.callee(getParentNode(startNode));
        }
    }

    function addTree(box, data) {
        var doc = box.ownerDocument;
        var displayMember = style.displayMember||"text",
            childNodesMember = style.childNodesMember || 'nodes';
        for (var i = 0, l = data.length; i < l; i++) {
            var nodeData = data[i];
            var nodeEle = doc.createElement('div');
            nodeEle.__nodeData = nodeData;
            nodeEle.__parentNode = box.previousSibling;
            nodeEle.style.cursor = 'pointer';
            nodeEle.className = style.classUnselectdNode;
            //icon
            var setIconStyle = function (nodeEle) {
                return function (nodeIcon,mode) {
                    setTimeout(function () {
                        nodeIcon.style.width = nodeIcon.style.height = nodeEle.offsetHeight*3/4 + "px";
                        nodeIcon.style.position = 'relative';
                        nodeIcon.style.display = 'inline-block';
                        nodeIcon.style.fontSize = nodeIcon.offsetHeight - 2 + 'px';
                        nodeIcon.style.fontWeight = '600';
                        nodeIcon.style.verticalAlign = 'center';
                        switch (mode){
                            case 'open':
                                nodeIcon.innerHTML = '&minus;';
                                break;
                            case 'close':
                                nodeIcon.innerHTML = '+';
                                break;
                        }
                    },0);
                };
            }(nodeEle);
            if (nodeEle.__nodeData[childNodesMember]) {
                var nodeIcon = doc.createElement('div');
                nodeIcon.className = style.classOpenIcon;
                nodeEle.appendChild(nodeIcon);
                setIconStyle(nodeIcon,'open');
                nodeEle.__nodeIcon = nodeIcon;
                var nodeIconClick = function (nodeEle, nodeIcon,setIconStyle) {
                    return function () {
                        if (window.forms.Event.Source() === this) {
                            if (nodeEle.__nodeData[childNodesMember]) {
                                var childNodesBox = nodeEle.nextSibling;
                                var status = childNodesBox.__closed ? 'block' : 'none';
                                setIconStyle(nodeIcon,childNodesBox.__closed ? 'open':'close');
                                var iconClass = childNodesBox.__closed ? style.classOpenIcon : style.classCloseIcon;
                                childNodesBox.style.display = status;
                                nodeIcon.className = iconClass;
                                childNodesBox.__closed = !childNodesBox.__closed;
                            }
                        }
                    };
                }(nodeEle, nodeIcon,setIconStyle);
                window.forms.Event.Unregister(nodeIcon, 'click', nodeIconClick);
                window.forms.Event.Register(nodeIcon, 'click', nodeIconClick);
            }else {
                var nodeIconForTip = doc.createElement('div');
                nodeEle.appendChild(nodeIconForTip);
                setIconStyle(nodeIconForTip);
            }
            //text
            var nodeText = doc.createElement('div');
            nodeText.innerHTML = nodeEle.__nodeData[displayMember];
            nodeText.style.display = 'inline-block';
            nodeText.style.verticalAlign = 'center';
            nodeEle.appendChild(nodeText);
            nodeEle.__displayEle = nodeText;
            nodeText.className = style.classNodeText;

            var nodeTextClick = function (nodeEle) {
                return function () {
                    if (ele.__selected) {
                        ele.__selected.className = style.classUnselectdNode;
                    }
                    if(ele.__selected===nodeEle){
                        if(nodeEle.__hasSelected){
                            ele.__selected.className = style.classUnselectdNode;
                            ele.__selected = void 0;
                            currData = currNode = void 0;
                        }else {
                            ele.__selected.className = style.classSelectdNode;
                            ele.__selected = nodeEle;
                            currData = nodeEle.__nodeData;currNode = nodeEle;
                        }
                        nodeEle.__hasSelected = !nodeEle.__hasSelected;
                    }else {
                        nodeEle.className = style.classSelectdNode;
                        ele.__selected = nodeEle;
                        nodeEle.__hasSelected = true;
                        currData = nodeEle.__nodeData;currNode = nodeEle;
                    }
                }
            }(nodeEle);
            window.forms.Event.Unregister(nodeText, 'mousedown', nodeTextClick);
            window.forms.Event.Register(nodeText, 'mousedown', nodeTextClick);
            box.appendChild(nodeEle);
            box.style.position = 'relative';
            box.style.left = (style.offset||'12px');

            if (nodeEle.__nodeData[childNodesMember] instanceof Array) {
                var childNodesBox = doc.createElement('div');
                box.appendChild(childNodesBox);
                arguments.callee(childNodesBox, nodeEle.__nodeData[childNodesMember]);
                nodeEle.__childNodes = nodeEle.nextSibling.childNodes;
            }
            _t.ondrawnode(nodeEle, nodeEle.__nodeData);
        }
    }
}