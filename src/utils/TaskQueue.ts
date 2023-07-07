

export default class TaskQueue {
    private data: Function[] = []
    private is_processing: boolean = false;
    constructor(src?: any[]) {
        if (src) this.data = src
    }

    add(task: Function) {
        if (!task) return
        this.data.push(task)

        if (!this.is_processing) {
            this.is_processing = true
            this.process()
        }
    }

    async process() {
        while (this.data.length > 0) {
            try {
                let task: Function | undefined = this.data.shift()
                if (!task) throw '任务不存在'
                let result = await task()
                if (!result) {
                    this.data.length = 0
                    throw '任务中断'
                }
            } catch (error) {
                //console.log(error);
                break
            }
        }
        this.is_processing = false
    }
}