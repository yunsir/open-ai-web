export default class TaskPool {
    batch_size: number = 10
    constructor(batch_size?: number) {
        if (batch_size) this.batch_size = batch_size
    }
    async exec<T>(tasks: Array<T>, callback: Function) {
        if (!tasks || tasks.length === 0) return
        if (!callback) return

        let batches:any = [], index = 0, len = tasks.length - 1, count = 0
        if(len > 0) {
            while (true) {
                let last_index = index + this.batch_size
                if (last_index > len) {
                    last_index = len
                }

                let sub_tasks = tasks.slice(index, last_index)
                batches = sub_tasks.map(async (task) => {
                    try {
                        count ++
                        await callback(task, count, tasks.length)
                    } catch (e) {
                        console.log(e);
                    }
                })

                await Promise.all(batches)

                if (last_index >= len) {
                    break
                }
                index = last_index
                batches = []
            }
        }
        return await callback(tasks[len], count + 1, tasks.length) // 保证最后一个任务，最后执行
    }
}