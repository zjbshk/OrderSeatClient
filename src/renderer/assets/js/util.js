function clone(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}

function cloneValue(obj, copyObj) {
    if (obj && copyObj) {
        if (typeof obj == "object") {
            if (obj instanceof Array && copyObj instanceof Array) {
                for (var i = 0; i < obj.length; i++) {
                    copyObj.push(obj[i]);
                }
            } else if (obj instanceof Object && copyObj instanceof Object) {
                for (var j in obj) {
                    copyObj[j] = obj[j];
                }
            }
        }
    }
    return copyObj;
}

function getFormatDate(formatStr, date) {
    var date_Temp = (date ? date : new Date());

    var year = date_Temp.getFullYear();
    var month = date_Temp.getMonth() + 1;
    var day = date_Temp.getDate();

    var hours = date_Temp.getHours();
    var minutes = date_Temp.getMinutes();
    var seconds = date_Temp.getSeconds();
    // Y-M-D h:m:s
    var formatDate = formatStr.replace(/Y/g, year).replace(/M/g, month).replace(/D/g, day).replace(/h/g, hours).replace(/m/g, minutes).replace(/s/g, seconds)
    return formatDate;
}

function isInArrayObject(arrObj,field,value){
    var b = getArrayObject(arrObj,field,value);
    return b != -1;
}

function getArrayObject(arrObj,field,value){
    for (var i = 0, len = arrObj.length; i < len; i++) {
        var obj = arrObj[i];
        if(obj[field] == value){
            return i;
        }
    }
    return -1;
}

export default {
    clone,
    cloneValue,
    getFormatDate,
    isInArrayObject,
    getArrayObject,
}