window.forms.Map = function (compare) {
    var compare = compare ? compare : function (x, y) {
        if (!x) {
            return y ? -1 : 0;
        }
        else {
            if (!y) return 1;
            if (x.localeCompare) return x.localeCompare(y);
            if (x == y) return 0;
            return x - y;
        }
    }; 
    var self = this;
    var keys = [];
    var values = [];
    this.Count = function () {
        return keys.length;
    }
    this.IndexOfKey = function (key) {
        var start = 0;
        var end = self.Count() - 1;
        while (true) {
            if (start > end) return -1;

            var mid = (start + end) >> 1;
            if (compare(keys[mid], key) > 0) {
                end = mid - 1;
            }
            else if (compare(keys[mid], key) < 0) {
                start = mid + 1;
            }
            else {
                return mid;
            }
        } 
    }
    this.IndexOfValue = function (value) {
        for (var i = 0; i < values.length; i++) {
            if (values[i] == value) return i;
        }
        return -1;
    }
    this.Add = function (key, value) {
        var index = self.IndexOfKey(key);
        if (index > -1) throw new Error("Key exists:" + key);
        index = InsertIndexFor(key);
        for (var i = keys.length; i > index; i--) {
            keys[i] = keys[i - 1];
        }
        keys[index] = key;
        for (var i = values.length; i > index; i--) {
            values[i] = values[i - 1];
        }
        values[index] = value;
    }
    function InsertIndexFor(key) {
        var start = 0;
        var end = self.Count() - 1;
        while (true) {
            if (start > end) return start;
            var mid = (start + end) >> 1;
            if (compare(keys[mid], key) > 0) {
                end = mid - 1;
            }
            else if (compare(keys[mid], key) < 0) {
                start = mid + 1;
            }
            else {
                return mid + 1;
            }
        }
    }
    this.RemoveAt = function (index) {
        if (index < 0 || index >= self.Count()) throw new Error("Index out of range");
        for (var i = index + 1; i < keys.length; i++) {
            keys[i - 1] = keys[i];
        }
        keys.length--;
        for (var i = index + 1; i < values.length; i++) {
            values[i - 1] = values[i];
        }
        values.length--;
    }
    this.Clear = function () {
        keys.length = 0;
        values.length = 0;
    }
    this.ValueForKey = function (key) {
        var index = self.IndexOfKey(key);
        return values[index];
    }
    this.KeyAt = function (index) {
        return keys[index];
    }
}