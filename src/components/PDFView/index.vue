<script setup lang="ts">
import { NInput } from 'naive-ui';
import * as PDFJS from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { onMounted, reactive, ref, watch } from 'vue';
import { debounce } from '@/utils/FunctionUtil';
import {FileManager, LocalFileManager, RemoteFileManager} from './FileManager';

PDFJS.GlobalWorkerOptions.workerSrc = 'pdf/pdf.worker.js'

const emit = defineEmits(['file-loaded', 'rect-finished'])

interface Point {
    x: number,
    y: number
}

interface PDFViewer {
    mode?: number, //0 : 文本 1：图片
    page?: number, //第几页
    rect?: Array<Point>, // 绘制矩形区域
    threshold?: number, //灰度值
    auto_rect?: boolean, //是否自动绘制矩形区域
    file?: File, //pdf文件
}

const props = withDefaults(defineProps<PDFViewer>(), {
    mode: 0,
    page: 1,
    auto_rect: false,
    threshold: -1
})


let file_manager:FileManager = new RemoteFileManager()
let _debounce = debounce(async () => {

}, 500, false)
watch(() => props.mode, (mode:any)=> {
    renderPdf(props.file,mode, props.threshold)
})
watch(() => [props.page, props.mode], async (page: any) => {
    text_content.value = await file_manager.getContent()
}, { deep: true })
watch(() => props.file, (file: any) => {
    renderPdf(file,props.mode, props.threshold)
})
watch(() => props.rect, (new_rect: any) => {
    if (!new_rect) rect.length = 0
    else {
        rect.length = 0
        rect.push(...new_rect)
        if (rect.length >= 2) {
            rect_finished = true
            draw()
        }
    }
}, { deep: true })
onMounted(() => {
    renderPdf(props.file, props.mode, props.threshold)
})

async function renderPdf(pdf: File|undefined, mode: number|undefined, threshold: number|undefined) {
    let resp = await file_manager.loadFile(pdf, mode, threshold)

    if(resp) {
        emit('file-loaded', file_manager.getPageNum())
        text_content.value = await file_manager.getContent()
    }
    // let resp = await loadFile(pdf).catch(e => console.log(e))
    // if (resp) {
    //     await render(props.page)
    // }
}


interface FileManager1 {
    data?: ImageData,
    ctx?: CanvasRenderingContext2D,
    doc?: PDFDocumentProxy
}
let manager: FileManager1 = {}

async function loadFile(pdf?: File) {
    if (!pdf || pdf.size === 0) {
        clear()
        return Promise.resolve(false)
    }
    // 更新任务状态
    let file: any = await readFile(pdf)

    const loading_task = PDFJS.getDocument({
        data: file,
        cMapUrl: "cmaps/",
        cMapPacked: true,
    })
    const pdf_doc = await loading_task.promise
    emit('file-loaded', pdf_doc.numPages)
    manager.doc = pdf_doc
    return Promise.resolve(true)
}
async function readFile(file: File) {
    let file_readerr = new FileReader()
    file_readerr.readAsArrayBuffer(file)
    return new Promise((resolve) => {
        file_readerr.onload = e => {
            resolve(e.target?.result)
        }
    })
}

let scale_canvas = ref()
let canvas = ref()
let text_content = ref('')

async function render(page: number) {
    if (!manager.doc) return
    const pdf = await manager.doc.getPage(page);
    if (props.mode === 1) {
        await renderCanvas(pdf, 1, canvas)
        manager.ctx = canvas.value.getContext('2d', { willReadFrequently: true })
        if (manager.ctx) {
            manager.data = manager.ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)
            await renderCanvas(pdf, 4, scale_canvas)
            pdf.cleanup()
        }
    } else {
        const tokenizedText = await pdf.getTextContent()
        let pageText = tokenizedText.items.map((token: any) => token.str || '\n').join('')
        //pageText = pageText.replaceAll(/\s+/g, '\n')
        pageText = pageText.replaceAll(/(\u00A0+)/g, '')
        text_content.value = pageText
    }
}

async function renderCanvas(page: any, scale: number, canvas: any) {
    let viewport = page.getViewport({ scale: scale });
    let _canvas = canvas.value
    let context = _canvas.getContext('2d', { willReadFrequently: true })
    context.clearRect(0, 0, _canvas.width, _canvas.height)
    _canvas.height = _canvas.height
    let CSS_UNITS = 96.0 / 72.0;
    _canvas.width = Math.floor(viewport.width * CSS_UNITS);
    _canvas.height = Math.floor(viewport.height * CSS_UNITS);
    _canvas.style.width = Math.floor(viewport.width * CSS_UNITS) + "px";
    _canvas.style.height = Math.floor(viewport.height * CSS_UNITS) + "px";

    let renderContext = {
        transform: [CSS_UNITS, 0, 0, CSS_UNITS, 0, 0],
        canvasContext: context,
        viewport
    }

    const renderTask = page.render(renderContext);
    await renderTask.promise;
}

let magnifier: any = ref()
let magnifier_style: any = reactive({
    display: false,
    top: 0,
    left: 0,
    size: 400
})

let rect: Array<Point> = [], rect_finished = false

function handleMouseDown(e: any) {
    if (!manager.ctx) return
    rect.length = 0, rect_finished = false
    if (props.auto_rect) {
        rect.push({ x: 0, y: 0 })
    } else {
        rect.push({ x: e.offsetX, y: e.offsetY })
    }
}
async function handleMouseMove(e: MouseEvent) {
    let ctx: CanvasRenderingContext2D | undefined = manager.ctx, width = canvas.value.width, height = canvas.value.height
    if (!ctx || !manager.data) return

    magnifier_style.display = true
    magnifier_style.left = e.offsetX - magnifier_style.size - 5
    magnifier_style.top = e.offsetY + 5

    ctx.clearRect(0, 0, width, height)
    ctx.putImageData(manager.data, 0, 0)


    let scale_ctx = scale_canvas.value.getContext('2d', { willReadFrequently: true })

    let imageData = scale_ctx.getImageData(e.offsetX * 4 - 10 * 20, e.offsetY * 4 - 10 * 20, 400, 400)
    if (props.threshold >= 0) {
        imageData = binarizeImage(imageData, props.threshold)
    }
    //绘制放大镜
    let magnifier_ctx: CanvasRenderingContext2D = magnifier.value.getContext('2d', { willReadFrequently: true })
    magnifier.value.width = magnifier_style.size
    magnifier.value.height = magnifier_style.size
    magnifier.value.style.width = magnifier_style.size
    magnifier.value.style.height = magnifier_style.size
    magnifier_ctx.putImageData(imageData, 0, 0)
    magnifier_ctx.strokeStyle = 'red'
    magnifier_ctx.lineWidth = 1
    magnifier_ctx.beginPath()
    magnifier_ctx.moveTo(0, magnifier_style.size / 2)
    magnifier_ctx.lineTo(magnifier_style.size, magnifier_style.size / 2)
    magnifier_ctx.moveTo(magnifier_style.size / 2, 0)
    magnifier_ctx.lineTo(magnifier_style.size / 2, magnifier_style.size)
    magnifier_ctx.stroke()
    magnifier_ctx.closePath()

    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1
    //  绘制矩形
    if (rect.length > 0) {
        let start: Point = rect[0]
        let end: Point = rect_finished ? rect[1] : { x: e.offsetX, y: e.offsetY }
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
    }

    // 绘制十字坐标
    ctx.beginPath()
    ctx.moveTo(0, e.offsetY)
    ctx.lineTo(width, e.offsetY)
    ctx.moveTo(e.offsetX, 0)
    ctx.lineTo(e.offsetX, height)
    ctx.stroke()
    ctx.closePath()
}
// 定义一个函数，用于将图片转换为二值图像
function binarizeImage(imageData: ImageData, threshold: Number = 175) {
    // 获取图像的像素数据
    let data = imageData.data;
    // 遍历每个像素，将其转换为二值图像
    for (let i = 0; i < data.length; i += 4) {
        // 获取当前像素的灰度值
        let gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        // 将灰度值转换为二值值
        let binary = gray > threshold ? 255 : 0;
        // 将二值值赋值给当前像素
        data[i] = binary;
        data[i + 1] = binary;
        data[i + 2] = binary;
    }
    // 返回转换后的图像数据
    return imageData;
}
async function handleMouseUp(e: MouseEvent) {
    rect_finished = true
    if (props.auto_rect) {
        rect.push({ x: canvas.value.width, y: e.offsetY })
    } else {
        rect.push({ x: e.offsetX, y: e.offsetY })
    }
    emit('rect-finished', rect)
}

function handleMouseLeave(e: MouseEvent) {
    let width = canvas.value.width, height = canvas.value.height

    if ((e.offsetX >= 0 && e.offsetX <= width) && e.offsetY >= 0 && e.offsetY <= height) {
        magnifier_style.display = false
    }
    draw()

    magnifier_style.display = false
}

function draw() {
    let ctx: CanvasRenderingContext2D | undefined = manager.ctx, width = canvas.value.width, height = canvas.value.height
    if (!ctx || !manager.data) return
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1
    ctx.clearRect(0, 0, width, height)
    ctx.putImageData(manager.data, 0, 0)
    if (rect.length === 2) {
        let start: Point = rect[0]
        let end: Point = rect[1]
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
    }
}

function clear() {
    if (props.mode === 1) {
        let ctx: CanvasRenderingContext2D | undefined = manager.ctx, width = canvas.value.width, height = canvas.value.height
        if (!ctx || !manager.data) return
        ctx.clearRect(0, 0, width, height)

        manager.ctx = undefined
        manager.data = undefined
    } else {
        text_content.value = ''
    }
    manager.doc = undefined
}
</script>

<template>
    <div class="canvas">
        <!-- <canvas ref='canvas' @mousemove="handleMouseMove" @mousedown="handleMouseDown" @mouseup="handleMouseUp"
            v-show="props.mode === 1" @mouseleave="handleMouseLeave"></canvas> -->
        <n-input v-model:value="text_content" type="textarea" disabled :autosize="{
            minRows: 30,
            maxRows: 60
        }" style="width: 100%;" placeholder="" />

        <canvas ref="scale_canvas" style="display:none"></canvas>
        <div class="magnifier"
            :style="{ display: magnifier_style.display ? 'block' : 'none', top: magnifier_style.top + 'px', left: magnifier_style.left + 'px' }">
            <canvas ref="magnifier"></canvas>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.canvas {
    min-width: 793px;

    border: 1px solid black;
    cursor: pointer;
    position: relative;

    :deep(.n-input.n-input--disabled .n-input__textarea-el) {
        color: #666;
        font-weight: bold;
    }

    & .magnifier {
        position: absolute;
        z-index: 100;
        border: 1px solid black;
    }
}
</style>