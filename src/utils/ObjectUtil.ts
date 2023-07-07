export default class ObjectUtil {

    static deepCopy(obj?: any) {
        if (!obj) return obj
        return JSON.parse(JSON.stringify(obj))
    }

    static isEmpty(obj?: any) {
        if(obj === null) return true
        if (typeof obj === 'undefined' || obj === '') return true;
        if (typeof obj !== 'object') return false;
        return Object.keys(obj).length === 0 && obj.constructor === Object
    }
}