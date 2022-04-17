'use strict';
type StringObject = { [key:string]: any ,environment:string};
export default function environment ():StringObject {
    const overallGlobal =
    typeof globalThis !== 'undefined' &&  typeof globalThis.window === 'undefined' ? 
        {   
            environment:'node',
            ...globalThis
        }
    : 
    typeof window !== 'undefined' ? 
        {
            environment:'web',
            ...window
        } 
    : 
    typeof global !== 'undefined' ? 
        {
            environment:'node',
            ...global
        } 
    : 
    typeof self !== 'undefined' ? 
        {
            environment:'web',
            ...self
        } 
    : 
        {
            environment:'null',
        }
    ;
    return overallGlobal
}
