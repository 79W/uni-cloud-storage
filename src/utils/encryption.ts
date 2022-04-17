'use strict';
import { HmacMD5,MD5 } from 'crypto-js'

type StringObject = {[key:string]:string | number | boolean};
function ksort(obj :StringObject):StringObject{
    let sorted: StringObject = {};
    const keys = Object.keys(obj);
    keys.sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
}

function sign(value : StringObject, key: string) :string {
    const paramsArray: string[] = [];
    const ksortValue = ksort(value);
    Object.keys(ksortValue).forEach(key => paramsArray.push(key + '=' + ksortValue[key]));
    const str = paramsArray.join('&');
    const md5Value = HmacMD5(str, key).toString();
    return md5Value;
}

export {
    sign,
    ksort,
    StringObject,
    MD5
}