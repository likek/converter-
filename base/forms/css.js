//css操作
window.forms.css = function (ele) {
    this.Add = function (cls) {
        if (!cls || cls == "") return;

        var result = cls;

        var className = ele.className + "";
        var end = className.length;

        for (var i = className.length - 1; i > -1; i--) {
            switch (className.charAt(i)) {
                case ' ':
                    if (end < className.length) {
                        var tmp = className.substr(i + 1, end - i);
                        if (tmp != cls) result = tmp + ' ' + result;
                        end = className.length;
                    }
                    break;
                default:
                    if (end == className.length) end = i;
                    break;
            }
        }
        if (end < className.length) {
            var tmp = className.substr(0, end + 1);
            if (tmp != cls) result = tmp + ' ' + result;
            end = className.length;
        }

        ele.className = result;
    }
    this.Remove = function (cls) {
        if (!cls || cls == "") return;

        var result = "";

        var className = ele.className + "";
        var end = className.length;

        for (var i = className.length - 1; i > -1; i--) {
            switch (className.charAt(i)) {
                case ' ':
                    if (end < className.length) {
                        var tmp = className.substr(i + 1, end - i);
                        if (tmp != cls) result = tmp + ' ' + result;
                        end = className.length;
                    }
                    break;
                default:
                    if (end == className.length) end = i;
                    break;
            }
        }
        if (end < className.length) {
            var tmp = className.substr(0, end + 1);
            if (tmp != cls) result = tmp + ' ' + result;
            end = className.length;
        }

        if (result.length > 0) ele.className = result.substr(0, result.length - 1);
        ele.className = result;
    }
    this.Contains = function (cls) {
        if (!cls || cls == "") return false;

        var className = ele.className + "";
        var end = className.length;

        for (var i = className.length - 1; i > -1; i--) {
            switch (className.charAt(i)) {
                case ' ':
                    if (end < className.length) {
                        var tmp = className.substr(i + 1, end - i);
                        if (tmp == cls) return true;
                        end = className.length;
                    }
                    break;
                default:
                    if (end == className.length) end = i;
                    break;
            }
        }
        if (end < className.length) {
            var tmp = className.substr(0, end + 1);
            if (tmp == cls) return true;
            end = className.length;
        }

        return false;
    }
    this.Count = function () {
        var className = ele.className + "";
        var end = className.length;

        var cnt = 0;
        for (var i = className.length - 1; i > -1; i--) {
            switch (className.charAt(i)) {
                case ' ':
                    if (end < className.length) {
                        cnt++;
                        end = className.length;
                    }
                    break;
                default:
                    if (end == className.length) end = i;
                    break;
            }
        }
        if (end < className.length) {
            cnt++;
            end = className.length;
        }

        return cnt;
    }
    this.Apply = function (cls) {
        ele.className = cls;
    }
    this.Clear = function () {
        ele.className = null;
    }
    return this;
}