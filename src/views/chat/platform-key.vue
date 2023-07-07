<script setup lang="ts">
import { NDataTable, NButton, NDrawer, NDrawerContent, NForm, NFormItem, FormRules, NInput, useMessage, NInputNumber, NSelect } from 'naive-ui';
import { h, reactive, ref, onMounted } from 'vue';
import Service from '@/utils/Service';
const message = useMessage()

let data = ref([])
let columns = reactive([
    {
        title: '平台', key: 'platform', width: 200, render(row: any) {
            let option = platform_options.find(e => e.value === row['platform'])
            return option?.label
        }
    },
    {
        title: '权重', key: 'weight', width: 200
    },
    {
        title: '请求上限', key: 'rpm', width: 200
    },
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
                            let keys = Object.keys(row)
                            keys.forEach(key => form[key] = row[key])
                        }
                    },
                    { default: () => '编辑' }),
                h(NButton,
                    {
                        size: 'small', text: true, style: 'margin-left:10px', type: 'info',
                        onClick: async () => {
                            let resp: any = await Service.delete(`/platform-keys/${row.id}`, form)
                            typeof resp === 'boolean' && message.success("删除成功")
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
onMounted(() => {
    query()
})
let query_form: any = ref({})
async function query() {
    let resp: any = await Service.post('/platform-keys/page', {
        order_by: "id asc",
        page: pagination.page,
        per_page: pagination.pageSize,
        ...query_form.value
    })

    pagination['pageCount'] = resp['total_pages']
    pagination['itemCount'] = resp['total']
    data.value = resp['data']
}


let show_form = ref(false)
let form: any = reactive({})
let rules: FormRules = {
    'api-key': [{ type: 'string', required: true, message: '请输入api-key', trigger: 'blur' }],
}
async function handleSave() {

    await Service.post(`/platform-keys`, form)
    message.success('保存成功')
    show_form.value = false
    query()

}

function handleReset() {
    let keys = Object.keys(form)
    if (keys) {
        keys.forEach(key => form[key] = null)
    }
}

let platform_options = [
    { label: 'OpenAI', value: 'open-ai' }
]
</script>

<template>
    <div class="container">
        <div class="operator">
            <n-button type="primary" @click="show_form = true; handleReset()">新&nbsp;&nbsp;&nbsp;增</n-button>
        </div>

        <n-data-table remote :columns="columns" :data="data" :pagination="false" :single-line="false" size="small"
            :max-height="600" />
    </div>
    <n-drawer v-model:show="show_form" width="40%" placement="right">
        <n-drawer-content title="平台key">
            <n-form ref="ref_form" :model="form" label-placement="top" style="margin-top: 10px;" :rules="rules">
                <n-form-item label="平台" path="platform">
                    <n-select class="select" :options="platform_options" v-model:value="form['platform']" placeholder="平台"
                        clearable></n-select>
                </n-form-item>

                <n-form-item label="ApiKey" path="api_key">
                    <n-input v-model:value="form['api_key']" placeholder="ApiKey" clearable />
                </n-form-item>

                <n-form-item label="权重" path="weight">
                    <n-input-number v-model:value="form['weight']" placeholder="权重" clearable />
                </n-form-item>
                <n-form-item label="请求上限" path="limit">
                    <n-input-number v-model:value="form['limit']" placeholder="请求上限" clearable />
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