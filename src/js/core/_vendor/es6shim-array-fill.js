var arrayFill = function (array, value, start, end) {

    if (!Array.isArray(array)) {
        throw new TypeError('array is not a Array');
    }

    var length = array.length;
    start = parseInt(start, 10) || 0;
    end = end === undefined ? length : (parseInt(end, 10) || 0);

    var i;
    var l;

    if (start < 0) {
        i = Math.max(length + start, 0);
    } else {
        i = Math.min(start, length);
    }

    if (end < 0) {
        l = Math.max(length + end, 0);
    } else {
        l = Math.min(end, length);
    }

    for (; i < l; i++) {
        array[i] = value;
    }

    return array;
};


if (!Array.prototype.fill) {
    Array.prototype.fill = function (value, start, end) {
        return arrayFill(this, value, start, end);
    };
}