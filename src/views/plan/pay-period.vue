<script setup lang="ts">
import { NDataTable, NButton, NDrawer, NDrawerContent, NForm, NFormItem, FormRules ,NInput,useMessage} from 'naive-ui';
import { h, reactive, ref, onMounted } from 'vue';
import CodeEditor from '@/components/code-editor'
import Service from '@/utils/Service';
const message = useMessage()
onMounted(() => {
    query()
})
let data = ref([])
let columns = reactive([
    { title: '名称', key: 'name',width:200 },
    {
        title: '操作', key: 'actions', width: 160,
        render(row: any) {
            return h(
                'div', {}, [
                h(NButton,
                    {
                        size: 'small', text: true, type: 'info',
                        onClick: async () => {
                            show_form.value = true
                            handleReset()
                            let keys  = Object.keys(row)
                            keys.forEach(key => form[key] = row[key])
                        }
                    },
                    { default: () => '编辑' }),
                h(NButton,
                    {
                        size: 'small', text: true, style: 'margin-left:10px', type: 'info',
                        onClick: async () => {
                            query()
                        }
                    },
                    { default: () => '删除' }),
            ]
            )
        }
    }
])

let pagination: any = reactive({
    page: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 50,
    showSizePicker: true,
    showQuickJumper: true,
    pageSizes: [10, 50, 100],
    onChange: (page: number) => {
        pagination.page = page
        query()
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize
        pagination.page = 1
        query()
    },
    prefix({ itemCount }: any) {
        return `总共 ${itemCount} 条数据`
    }
})
async function query() {

    let resp: any =  await Service.get('/pay-periods')
    if(! ('return_code' in resp)) {
        data.value = resp
    }
}

let show_form = ref(false)
let form:any = reactive({})
let rules: FormRules = {
    'name': [{  type:'string', required: true, message: '请输入名称', trigger: 'blur' }],
}
async function handleSave() {

    await Service.post(`/pay-periods`, form)
    message.success('保存成功')
    show_form.value = false
    query()


}

function handleReset() {
    let keys = Object.keys(form)
    if(keys) {
        keys.forEach(key => form[key] = null)
    }
}
</script>

<template>
    <div class="container">
        <div class="operator">
            <n-button type="primary" @click="show_form = true;handleReset()">新&nbsp;&nbsp;&nbsp;增</n-button>
        </div>

        <n-data-table remote :columns="columns" :data="data" :pagination="false" :single-line="false" size="small"
            :max-height="600" />
    </div>
    <n-drawer v-model:show="show_form" width="40%" placement="right">
        <n-drawer-content title="支付周期">
            <n-form ref="ref_form" :model="form" label-placement="top" style="margin-top: 10px;" :rules="rules">
                <n-form-item label="名称" path="name">
                    <n-input v-model:value="form['name']" placeholder="名称" clearable />
                </n-form-item>

                <n-form-item label="规则" path="rules">
                    <code-editor v-model="form.rule" style="min-height: 300px;"></code-editor>
                </n-form-item>

            </n-form>
            <template #footer>
                <div style="display: flex; justify-content: flex-end">
                    <n-button type="primary" style="width:80px" @click="handleSave">
                        保存
                    </n-button>
                    <n-button type="default" style="width:80px;margin-left: 10px;" @click="show_form = false">
                        取消
                    </n-button>
                </div>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<style lang="scss" scoped>
.operator {
    display: flex;
    justify-content: end;
    margin-bottom: 10px;
}
</style>