<script setup lang="ts">
import { NUpload, NUploadDragger, NText, UploadCustomRequestOptions, UploadFileInfo, useMessage } from 'naive-ui';
import Service from '@/utils/Service';
import SparkMd5 from 'spark-md5';
import TaskPool from '@/utils/TaskPool';
import { ref } from 'vue';

const props = defineProps({
    manual: { default: false, type: Boolean },
})
const emits = defineEmits(['update:modelValue', 'finished'])
const message = useMessage()
let upload_table: any = {}
let task_pool = new TaskPool(3)
async function handleUpload({ file, onProgress, onFinish }: UploadCustomRequestOptions) {
    let _file = file.file
    if (!_file) {
        message.error('请上传文件')
        return
    }
    let index = file.name.lastIndexOf('.')
    let file_suffix = ''
    if (index >= 0) {
        file_suffix = file.name.substring(index + 1)
    }
    let upload_tasks: Array<FormData> = []
    let md5: any = await calcMd5(_file, async (chunk: Blob, chunk_index: number, chunk_num: number) => {
        let form_data = new FormData()
        form_data.append('file', chunk)
        form_data.append('file_name', file.name)
        form_data.append('file_suffix', file_suffix)
        form_data.append('chunk_index', chunk_index + '')
        form_data.append('chunk_num', chunk_num + '')
        upload_tasks.push(form_data)
    })

    let result = await task_pool.exec(upload_tasks, async (data: FormData, index: number, total: number) => {
        data.append('file_md5', md5)
        let tmp = await Service.post(`/Api.php?class=file-manager&method=upload`, data)
        onProgress({ percent: Math.floor((index / total) * 100) })
        return tmp
    })
    onFinish()
    // 上传完成
    if (!props.manual) message.success('上传完成')
    upload_table[file.id] = result
    emits('update:modelValue', result)
    emits('finished', result)
}

function calcMd5(file: File, callback?: Function) {
    let chunk_size = 2 * 1024 * 1024 // 以2m分片
    let chunk_num: number = Math.ceil(file.size / chunk_size)
    let chunk_index: number = 1
    let spark = new SparkMd5()
    let file_reader = new FileReader()

    function loadFile() {
        let start = (chunk_index - 1) * chunk_size
        let chunk = file.slice(start, chunk_size + start)
        file_reader.readAsBinaryString(chunk)
        if (callback) callback(chunk, chunk_index, chunk_num)
    }
    loadFile()

    return new Promise((resolve, reject) => {
        file_reader.onload = (e: any) => {
            try {
                spark.appendBinary(e.target.result)
                if (chunk_index < chunk_num) {
                    chunk_index += 1
                    loadFile()
                } else {
                    resolve(spark.end())
                    return
                }
            } catch (error) {
                console.log(error)
                reject()
            }
        }
    })
}
async function handleRemove(options: { file: UploadFileInfo, fileList: Array<UploadFileInfo> }) {
    let file: any = upload_table[options.file.id]
    delete upload_table[options.file.id]
    if (!props.manual && file) {
        let result = await Service.post(`/Api.php?class=file-manager&method=delete`, {
            id: file['id']
        })
        message.success('删除成功')
        emits('update:modelValue', result)
        emits('finished', result)
    }
}

const upload_ref: any = ref(null)

function submit() {
    upload_ref.value?.submit()
}
function handleBeforeUpload() {
    console.log('before upload')
}
defineExpose({
    submit
})
</script>

<template>
    <n-upload ref="upload_ref" multiple directory-dnd :max="1" :custom-request="handleUpload" @remove="handleRemove"
        @before-upload="handleBeforeUpload" :default-upload="!manual">
        <n-upload-dragger>
            <div style="margin-bottom: 12px">
                <icon name="shangchuan" style="font-size: 48px;"></icon>
            </div>
            <n-text style="font-size: 16px">
                点击或者拖动文件到该区域来上传
            </n-text>
            <!-- <n-p depth="3" style="margin: 8px 0 0 0">
                请上传语音文件
            </n-p> -->
        </n-upload-dragger>
    </n-upload>
</template>

<style lang="scss" scoped></style>