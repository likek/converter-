window.forms.TreeViewConv = function (style) {
    window.forms.SingleValueConv.apply(this, [style]);
    this.DecodeArguments = function (ele, args) {
        return args[0].Result;
    };
    this.GetUIValue = this.GetValue;
    this.ApplyValue = function (self) {
        return function (ele, value) {
            var root, tv = ele.__treeView;
            if (!tv) {
                root = ele.ownerDocument.createElement("div");
                ele.appendChild(root);
                tv = ele.__treeView = root.__treeView = new TreeView(root, style);
                var drawNode = tv.ondrawnode;
                tv.ondrawnode = function () {

                }
            }
            else {
                root = ele.children[0];
            }
            tv.InsertNodes(root, value);

            self.InheritProperties(ele, root);
        };
    }(this);
    this.ondrawnode = function (node,data,parentNode,parentData) {};
    this.onaddnode = function (node,data,parentNode,parentData) {};
    this.onupdatenode = function (node,data,parentNode,parentData) {};
    this.onremovenode = function (node,data,parentNode,parentData) {};
    this.InheritProperties = function (srcElement, desElement) {
        window.forms.Form.SetAttribute(desElement, "conv", "window.forms.TreeViewConv.TreeViewItemValueConv(" + (style ? style.getJsonRaw() : null) + ")", true);
        window.forms.Form.InheritAttributes(srcElement, desElement);
    };
    window.forms.TreeViewConv.TreeViewItemValueConv = function (style) {
        window.forms.SingleValueConv.apply(this);
        this.ApplyValue = function (ele, value) {};
        this.GetUIValue = this.GetValue = function (ele) {
            return ele.__treeView.CurrData();
        }
    }
};