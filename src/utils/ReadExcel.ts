/**
 * Created by Administrator on 2020/5/6.
 *
 * Fun: ReadExcel
 */
import XLSX from 'xlsx'

export function read_excel_to_json(file:any) {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = (ev:any) => {
      try {
        const data = ev.target.result;
        const workbook = XLSX.read(data, {
          type: 'binary'
        });
        let result:any = [];
        for (let sheet in workbook.Sheets) {
          //循环读取每个文件
          const sheetArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
          result = result.concat(sheetArray)
        }
        resolve(result);
      } catch (e) {
        reject('文件类型不正确！');
      }
    };
    fileReader.readAsBinaryString(file);
  });
}
