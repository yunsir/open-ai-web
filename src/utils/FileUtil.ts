
export default class FileUtil {

    static async read(file: File) {
        let file_readerr: any = new FileReader()
        file_readerr.readAsArrayBuffer(file)
        return new Promise((resolve) => {
            file_readerr.onload = (e:any) => {
                file_readerr = undefined
                resolve(e.target?.result)
            }
        })
    }

    static down(file_name: any, data: any) {
        const blob = new Blob([data]) // 创建一个 blob 对象
        const link = document.createElement('a') // 创建一个 a 标签
        link.href = window.URL.createObjectURL(blob) // 生成一个 blob url
        link.download = file_name || 'temp' // 设置下载文件名
        document.body.appendChild(link) // 将 a 标签添加到 body 中
        link.click() // 模拟点击下载
        document.body.removeChild(link) // 移除 a 标签
    }
}