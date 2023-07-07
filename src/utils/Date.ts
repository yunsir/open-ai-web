/**
 * Created by ye on 2017/9/1.
 *
 * Fun: dateUtil
 */
export function parseTime(time: any, cFormat?: any) {
    if (arguments.length === 0) {
        return null
    }
    if (!time) return null;
    const format: any = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
    let date: any;
    if (typeof time === 'object') {
        date = time
    } else {
        if (('' + time).length === 10) time = parseInt(time) * 1000;
        date = new Date(time)
    }
    const formatObj: any = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    };
    return format.replace(/{([ymdhisa])+}/g, (result, key) => {
        let value: any = formatObj[key];
        if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1];
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
}

export function convertDate(dateStr: any) {
    let date: any = new Date(1970, 0, 1, 0, 0, 0);
    date.setFullYear(parseInt(dateStr.substr(0, 4)));
    date.setMonth(parseInt(dateStr.substr(4, 2)) - 1);
    date.setDate(parseInt(dateStr.substr(6, 2)));
    return date;
}

export function formatDate(date: any) {
    let month: any = "" + (date.getMonth() + 1);
    let day: any = "" + date.getDate();
    if (month.length === 1) month = '0' + month;
    if (day.length === 1) day = '0' + day;
    return "" + date.getFullYear() + month + day;
}

export function interval(src: any, tar: any) {
    let date1: any = convertDate(src);
    let date2: any = convertDate(tar);
    let timeDiff: any = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function analyzeDateRange(str: any, has_time:boolean = true, has_format:boolean = false) {
    str = str.toLowerCase();
    let _start: any = new Date(), _start_format = has_time ? '{y}-{m}-{d} 00:00:00' : '{y}-{m}-{d}';
    let _end: any = new Date(), _end_format = has_time ? '{y}-{m}-{d} 23:59:59' : '{y}-{m}-{d}';
    if (str === 'today') {
        _start = new Date();
    } else if (str.startsWith('last')) {
        let day: any = resolver(/(\d+)\s+day\s*/gi, str);
        if (day) _start.setDate(_start.getDate() - day);
        let week: any = resolver(/(\d+)\s+week\s*/gi, str)
        if (week) {
            let _week: any = _start.getDay() === 0 ? 7 : _start.getDay()
            _start.setDate(_start.getDate() - (week * 7 - 1 + _week))
            _end.setDate(_end.getDate() - _week)
        }
        let month: any = resolver(/(\d+)\s+month\s*/gi, str)
        if (month) {
            _start.setMonth(_start.getMonth() - month)
            _start.setDate(1) // 上x月1号
            _end.setDate(1)
            _end.setDate(_end.getDate() - 1) //上X月最后一天
        }
        let quarter: any = resolver(/(\d+)\s+quarter\s*/gi, str)
        if (quarter) {
            let month: any = _start.getMonth() + 1
            let remain: any = month % 3
            remain = remain === 0 ? 2 : remain - 1
            _start.setMonth(_start.getMonth() - (quarter * 3 + remain))
            _start.setDate(1)
            _end.setMonth(_end.getMonth() - remain)
            _end.setDate(1)
            _end.setDate(_end.getDate() - 1)
        }
    } else if (str.startsWith('this')) {
        if (str.endsWith('week')) {
            let week: any = _start.getDay()
            _start.setDate(_start.getDate() - (week === 0 ? 6 : (week - 1)))
        }
        if (str.endsWith('month')) {
            _start.setDate(1)
        }
        if (str.endsWith('quarter')) {
            let month: any = _start.getMonth() + 1
            let remain: any = month % 3
            remain = remain === 0 ? 2 : remain - 1
            _start.setMonth(_start.getMonth() - remain)
            _start.setDate(1)
        }
    }
    if(has_format) {
        let start: any = parseTime(_start, _start_format)
        let end: any = parseTime(_end, _end_format)
        return [start, end]
    } else {
        return [_start, _end]
    }


    function resolver(reg: any, str: any, _default?: any) {
        let result: any = reg.exec(str);
        if (result && typeof result[1] !== 'undefined') {
            let val = parseInt(result[1])
            if (val < 1) val = 1;
            if (_default) val = _default;
            return val
        }
    }
}
