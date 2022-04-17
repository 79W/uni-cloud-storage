import { MD5 } from 'crypto-js';
declare type StringObject = {
    [key: string]: string | number | boolean;
};
declare function ksort(obj: StringObject): StringObject;
declare function sign(value: StringObject, key: string): string;
export { sign, ksort, StringObject, MD5 };
//# sourceMappingURL=encryption.d.ts.map