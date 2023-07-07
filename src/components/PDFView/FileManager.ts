import { PDFDocumentProxy } from 'pdfjs-dist';
import * as PDFJS from 'pdfjs-dist';
import Service from '@/utils/Service';
import PDFUtil from '@/utils/PDFUtil';
export interface Point {
    x: number,
    y: number
};

export interface PDFViewer {
    mode?: number, //0 : 文本 1：图片
    page?: number, //第几页
    rect?: Array<Point>, // 绘制矩形区域
    threshold?: number, //灰度值
    auto_rect?: boolean, //是否自动绘制矩形区域
    file?: File, //pdf文件
};

export abstract class FileManager {
    page_num: number;

    getPageNum(): number {
        return this.page_num;
    }

    abstract loadFile(pdf: File | undefined, mode: number | undefined, threshold: number | undefined): Promise<boolean>;

    abstract getPage(page: number): Promise<string>;

    abstract getContent():any;
}

export class LocalFileManager extends FileManager {
    doc: PDFDocumentProxy | undefined;
    async loadFile(pdf: File | undefined, mode: number | undefined, threshold: number | undefined): Promise<boolean> {
        if (!pdf || pdf.size === 0) {
            return false;
        }
        try {
            this.doc = undefined
            this.page_num = 0
            // 更新任务状态
            let file: any = await this.readFile(pdf)

            const loading_task = PDFJS.getDocument({
                data: file,
                cMapUrl: "cmaps/",
                cMapPacked: true,
            })
            const pdf_doc = await loading_task.promise

            this.doc = pdf_doc
            this.page_num = pdf_doc.numPages;
            return true
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async readFile(file: File) {
        let file_readerr = new FileReader()
        file_readerr.readAsArrayBuffer(file)
        return new Promise((resolve) => {
            file_readerr.onload = e => {
                resolve(e.target?.result)
            }
        })
    }

    async getPage(page: number): Promise<string> {
        try {
            if (!this.doc) return ''
            const pdf = await this.doc.getPage(page);
            const tokenizedText = await pdf.getTextContent()
            let pageText = tokenizedText.items.map((token: any) => token.str || '\n').join('')
            //pageText = pageText.replaceAll(/\s+/g, '\n')
            return pageText.replaceAll(/(\u00A0+)/g, '')
        } catch (error) {
            console.log(error);
            return ''
        }
    }
    getContent()  {
        return ''
    }
}

export class RemoteFileManager extends FileManager {
    doc: string | undefined
    async loadFile(pdf: File | undefined, mode: number | undefined, threshold: number | undefined): Promise<boolean> {
        if (!pdf || pdf.size === 0) {
            return false;
        }
        try {
            this.page_num = 0
            this.doc = undefined
            // let form_data: FormData = new FormData()
            // form_data.append('file', pdf)
            // form_data.append('mode', `${typeof mode == 'undefined' ? 0 : mode}`)
            // form_data.append('threshold', `${typeof threshold == 'undefined' ? -1 : threshold}`)
            let pages =await PDFUtil.pages(pdf)
            let resp: any = await Service.post(`/templates/extract/text`, pages)
            this.doc = resp
            return true
        } catch (error) {
            console.log(error)
            return false;
        }

    }
    async getPage(page: number): Promise<string> {
        if (!this.doc) return ''
        page = page - 1
        return this.doc[page]
    }

    getContent() {
        return this.doc;
    }
}