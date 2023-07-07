<script setup lang="ts">
import { NForm, NFormItem, NButton, NDataTable, useMessage, NText, NDrawer, NDrawerContent, NTag, NInput, NAlert, useDialog } from 'naive-ui';
import { reactive, ref, h, onMounted } from 'vue';
import Service from '@/utils/Service';

import UserPlan from './user-plan.vue';
const message = useMessage()
const dialog = useDialog()
let data = ref([])

let columns: any = ref([
    {
        key: 'username', title: '账号'
    },
    {
        key: 'is_admin', title: '管理员',
        render(row: any) {
            return h(NTag, { type: row.is_admin ? 'success' : 'error' }, { default: () => row.is_admin ? '是' : '否' })
        }
    },
    {
        key: 'remark', title: '备注'
    },

    {
        title: '操作', width: 160,
        key: 'actions',
        render(row: any) {
            let buttons = [
                h(NButton, {
                    size: 'small', text: true, type: 'info',
                    onClick: async () => {
                        form.value = row
                        show_edit.value = true
                        title.value = '编辑账号'
                    }
                }, { default: () => '编辑' }),
                h(NButton, {
                    size: 'small', text: true, style: 'margin-left:10px', type: 'info',
                    onClick: async () => {
                        form.value = row
                        show_edit.value = true
                        title.value = '套餐管理'
                    }
                }, { default: () => '套餐' }),
                h(NButton,
                    {
                        size: 'small', text: true, style: 'margin-left:10px', type: 'info',
                        onClick: async () => {
                            dialog.warning({
                                title: '警告', content: '确定删除当前用户数据吗？', positiveText: '确定', negativeText: '取消',
                                onPositiveClick: async () => {
                                    let resp: any = await Service.delete(`/users/${row.id}`)
                                    typeof resp === 'boolean' && message.success("删除成功")
                                    query()
                                },
                            })

                        }
                    },
                    { default: () => '删除' }),
            ]

            return h('div', {}, buttons)
        }
    }
])

let pagination: any = reactive({
    page: 1,
    itemCount: 0,
    pageCount: 0,
    pageSize: 10,
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
    let resp: any = await Service.post('/users/page', {
        order_by: "id asc",
        page: pagination.page,
        per_page: pagination.pageSize,
        ...query_form.value
    })

    pagination['pageCount'] = resp['total_pages']
    pagination['itemCount'] = resp['total']
    data.value = resp['data']
}

let show_edit = ref(false)



let form_ref: any = ref()
let form: any = ref({})
let rules: any = []
let title: any = ref('')
let result: any = ref('')

async function handleSave() {
    let error = await form_ref.value?.validate().catch((e: any) => Promise.resolve(e))
    if (error) return
    let resp: any
    if (form.value.id) {
        resp = await Service.put(`/users/${form.value.id}`, { ...form.value })
    } else {
        resp = await Service.post(`/users`, { ...form.value })
    }
    if (resp && typeof resp === 'string') {
        result.value = resp
    }
    message.success('操作成功')
    query()
}
async function handleReset() {
    form.value = {}
    result.value = ''
}

function handleCreate() {
    show_edit.value = true
    title.value = '新建账号'
    handleReset()
}

</script>

<template>
    <div class="container">
        <div class="query">
            <n-form label-placement="left" inline style="margin-top: 10px;">

                <n-form-item path="username">
                    <n-input v-model:value="query_form['username']" style="width: 200px;" clearable>
                        <template #prefix>
                            <n-text style="font-size: 12px;">账号</n-text>
                        </template>
                    </n-input>
                </n-form-item>

                <div style="display: flex; justify-content: flex-end">
                    <n-button type="primary" style="width:80px" @click="query">
                        查询
                    </n-button>
                    <n-button type="primary" style="width:80px;margin-left: 10px;" @click="handleCreate">
                        新建
                    </n-button>
                </div>
            </n-form>
        </div>
        <n-data-table class="table" remote :columns="columns" :data="data" :pagination="pagination" :single-line="false"
            size="small" />

    </div>

    <n-drawer width="40%" v-model:show="show_edit">
        <n-drawer-content :title="title">
            <div v-if="title.indexOf('账号') >= 0">
                <n-form ref="ref_form" :model="form" label-placement="top" style="margin-top: 10px;" :rules="rules">
                    <n-form-item label="账号" path="username">
                        <n-input v-model:value="form['username']" placeholder="账号" clearable :disabled="title === '编辑账号'" />
                    </n-form-item>
                    <n-form-item label="备注" path="remark">
                        <n-input v-model:value="form['remark']" placeholder="备注" clearable type="textarea" :autosize="{
                            minRows: 2
                        }" />
                    </n-form-item>

                    <n-button type="success" style="margin-right: 20px;" @click="handleSave">保存 </n-button>
                    <n-button @click="handleReset">重置</n-button>
                </n-form>

                <n-alert :show-icon="false" v-if="result" style="margin-top: 20px;" type="success">
                    {{ result }}
                </n-alert>
            </div>
            <user-plan v-if="title === '套餐管理'" :user-id="form.id"></user-plan>

        </n-drawer-content>
    </n-drawer>
</template>

<style lang="scss" scoped></style>