/* eslint-disable */
import * as XLSX from 'xlsx'

function generateArray(table: any) {
    let out:any = [];
    let rows:any = table.querySelectorAll('tr');
    let ranges:any = [];
    for (let R = 0; R < rows.length; ++R) {
        let outRow:any = [];
        let row = rows[R];
        let columns = row.querySelectorAll('td');
        for (let C = 0; C < columns.length; ++C) {
            let cell = columns[C];
            let colspan = cell.getAttribute('colspan');
            let rowspan = cell.getAttribute('rowspan');
            let cellValue = cell.innerText;
            if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

            //Skip ranges
            ranges.forEach(function (range) {
                if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
                    for (let i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
                }
            });

            //Handle Row Span
            if (rowspan || colspan) {
                rowspan = rowspan || 1;
                colspan = colspan || 1;
                ranges.push({ s: { r: R, c: outRow.length }, e: { r: R + rowspan - 1, c: outRow.length + colspan - 1 } });
            };

            //Handle Value
            outRow.push(cellValue !== "" ? cellValue : null);

            //Handle Colspan
            if (colspan)
                for (let k = 0; k < colspan - 1; ++k) outRow.push(null);
        }
        out.push(outRow);
    }
    return [out, ranges];
};

function datenum(v: any, date1904?: any) {
    if (date1904) v += 1462;
    let epoch = Date.parse(v);
    let r: any = new Date(Date.UTC(1899, 11, 30))
    return (epoch - r) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data: any, opts?: any) {
    let ws: any = {};
    let range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
    for (let R = 0; R != data.length; ++R) {
        for (let C = 0; C != data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R;
            if (range.s.c > C) range.s.c = C;
            if (range.e.r < R) range.e.r = R;
            if (range.e.c < C) range.e.c = C;
            let cell: any = { v: data[R][C] };
            if (cell.v == null) continue;
            let cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            } else cell.t = 's';

            ws[cell_ref] = cell;
        }
    }
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

class Workbook {
    SheetNames: any[] = []
    Sheets: any = {}
    constructor() {
    }
}

function s2ab(s: any) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

export function export_table_to_excel(id: any) {
    let theTable = document.getElementById(id);
    let oo = generateArray(theTable);
    let ranges = oo[1];

    /* original data */
    let data = oo[0];
    let ws_name = "SheetJS";

    let wb = new Workbook(),
        ws: any = sheet_from_array_of_arrays(data);

    /* add ranges to worksheet */
    // ws['!cols'] = ['apple', 'banan'];
    ws['!merges'] = ranges;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

    let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });

    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), "test.xlsx")
}

export function export_json_to_excel({ header, data, filename = 'excel-list', autoWidth = true }:
            {header?:any, data?:any, filename?:any, autoWidth?:any} = {}) {
    /* original data */
    data = [...data]
    data.unshift(header);
    let ws_name = "SheetJS";
    let wb = new Workbook(),
        ws = sheet_from_array_of_arrays(data);

    if (autoWidth) {
        /*设置worksheet每列的最大宽度*/
        const colWidth = data.map((row:any) => row.map((val:any) => {
            /*先判断是否为null/undefined*/
            if (val == null) {
                return { 'wch': 10 };
            }
            /*再判断是否为中文*/
            else if (val.toString().charCodeAt(0) > 255) {
                return { 'wch': val.toString().length * 2 };
            } else {
                return { 'wch': val.toString().length };
            }
        }))
        /*以第一行为初始值*/
        let result = colWidth[0];
        for (let i = 1; i < colWidth.length; i++) {
            for (let j = 0; j < colWidth[i].length; j++) {
                if (result[j]['wch'] < colWidth[i][j]['wch']) {
                    result[j]['wch'] = colWidth[i][j]['wch'];
                }
            }
        }
        ws['!cols'] = result;
    }

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), filename + ".xlsx");
}


function saveAs(url: any, saveName: any) {
    if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if (window.MouseEvent) event = new MouseEvent('click');
    else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}