<script setup lang="ts">
import { NForm, NFormItem, NInput, NButton, NDataTable, NSelect, NTag, useMessage, NText } from 'naive-ui';
import { reactive, ref, h, onMounted } from 'vue';
import Service from '@/utils/Service';
import { useRouter } from 'vue-router';
import store from '@/store';
const router = useRouter()
const message = useMessage()

let data = ref([])
let order_statues: any = [
    { label: '待支付', value: 0, type: 'warning', color: '#f0a06c' },
    { label: '已支付', value: 1, type: 'success', color: '#60a058' },
    { label: '失败', value: 2, type: 'error', color: '#d03050' },
    { label: '已取消', value: 3, type: 'default', color: '#d9d9d9' },
]
let columns: any = ref([
    {
        key: 'order_no', title: '订单号'
    },
    {
        key: 'plan.period_name', title: '周期',
        render(row: any) {
            if (row?.plan?.period_name) {
                return h(NTag, {}, { default: () => row?.plan?.period_name })
            }
            return ''
        }
    },
    {
        key: 'order_status', title: '订单状态',
        render(row: any): any {
            let status = order_statues.find((e: any) => e.value === row.order_status)

            return h('div', { style: 'display:flex;align-items:center' }, [
                h('span', { style: `background-color: ${status.color};width: 6px;height: 6px;border-radius: 50%;display:inline-block;margin-right:5px` }),
                h(NText, { style: `color: ${status.color}` }, { default: () => status.label })
            ])
        }
    },
    {
        key: 'amount', title: '订单金额', render(row: any) {
            return h('span', { style: 'color: red' }, { default: () => (parseFloat(row.amount) / 100).toFixed(2) })
        }
    },
    {
        key: 'create_time', title: '创建时间'
    },
    {
        key: 'owner_name', title: '拥有者'
    },
    {
        title: '操作', width: 160,
        key: 'actions',
        render(row: any) {
            let buttons = [
                h(NButton, {
                    size: 'small', text: true, type: 'info', disabled: (row.order_status != 0 && row.order_status != 1),
                    onClick: async () => {
                        router.push(`/orders/${row.order_no}`)
                    }
                }, { default: () => '详情' }),
                h(NButton,
                    {
                        size: 'small', text: true, style: 'margin-left:10px', type: 'info', disabled: (row.order_status != 0),
                        onClick: async () => {
                            await Service.post(`/orders/${row.order_no}/cancel`)
                            message.success("取消成功")
                            query()
                        }
                    },
                    { default: () => '取消' }),
            ]
            let user_info = store.state.user_info
            if (user_info.is_admin) {
                buttons.push(h(NButton,
                    {
                        size: 'small', text: true, type: 'info', style: 'margin-left:10px', disabled: (row.order_status != 0),
                        onClick: async () => {
                            await Service.post(`/orders/${row.order_no}/pay`)
                            message.success("操作成功")
                            query()
                        }
                    },
                    { default: () => '完成' }))
            }

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
let form: any = ref({})
async function query() {
    let resp: any = await Service.post('/orders/page', {
        order_by: "o.create_time desc",
        page: pagination.page,
        per_page: pagination.pageSize,
        ...form.value
    })

    pagination['pageCount'] = resp['total_pages']
    pagination['itemCount'] = resp['total']
    data.value = resp['data']
}


</script>

<template>
    <div class="container">
        <n-form label-placement="left" inline style="margin-top: 10px;">
            <n-form-item path="order_no">
                <n-input v-model:value="form['order_no']" style="width: 240px;" clearable>
                    <template #prefix>
                        <n-text style="font-size: 12px;">订单号</n-text>
                    </template>
                </n-input>
            </n-form-item>

            <n-form-item path="order_status">
                <div class="select" style="height: 32px;width: 200px;">
                    <div class="prefix"><n-text style="font-size: 12px;">订单状态</n-text></div>
                    <n-select v-model:value="form['order_status']" :options="order_statues"
                        style="width: 100%;height: 32px;" clearable>
                    </n-select>
                </div>
            </n-form-item>

            <div style="display: flex; justify-content: flex-end">
                <n-button type="primary" style="width:80px" @click="query">
                    查询
                </n-button>
            </div>
        </n-form>
        <n-data-table class="table" remote :columns="columns" :data="data" :pagination="pagination" :single-line="false"
            size="small" />
    </div>
</template>

<style lang="scss" scoped></style>