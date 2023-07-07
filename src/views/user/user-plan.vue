<script setup lang="ts">
  import {NButton, NDataTable, useMessage, NTag, NDropdown,  useDialog } from 'naive-ui';
import { reactive, ref, h, onMounted, watch } from 'vue';
import Service from '@/utils/Service';
const message = useMessage()
const dialog = useDialog()
let data = ref([])

const props = defineProps({
    userId: Number
})

let columns: any = ref([
    {
        key: 'plan_name', title: '套餐名称'
    },
    {
        key: 'plan_capacity', title: '套餐容量'
    },
    {
        key: 'period_name', title: '周期'
    },
    {
        key: 'used', title: '剩余量'
    },
    {
        key: 'enable', title: '启用', render(row: any) {
            return h(NTag, { type: row.enable == 1 ? 'success' : 'error' }, { default: () => row.enable == 1 ? '是' : '否' })
        }
    },

    {
        title: '操作', width: 100,
        key: 'actions',
        render(row: any) {
            let buttons = [
                h(NButton, {
                    size: 'small', text: true, type: 'info', disabled: row.enable === 1,
                    onClick: async () => {
                        dialog.warning({
                                title: '警告', content: '确定启用当前套餐吗？', positiveText: '确定', negativeText: '取消',
                                onPositiveClick: async () => {
                                    let resp: any = await Service.post(`/user-plans/${row.id}/enable-plan?user_id=${props.userId}`, )
                                    typeof resp === 'boolean' && message.success("删除成功")
                                    query()
                                },
                            })
                    }
                }, { default: () => '启用' }),
                h(NButton, {
                    size: 'small', text: true, style: 'margin-left:10px', type: 'info', disabled: row.enable === 0,
                    onClick: async () => {
                        dialog.warning({
                                title: '警告', content: '确定停用当前套餐吗？', positiveText: '确定', negativeText: '取消',
                                onPositiveClick: async () => {
                                    let resp: any = await Service.post(`/user-plans/${row.id}/stop-plan?user_id=${props.userId}`)
                                    typeof resp === 'boolean' && message.success("删除成功")
                                    query()
                                },
                            })
                    }
                }, { default: () => '停用' }),

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
let plan_table:any = {}
onMounted(async () => {
    let resp:any = await Service.get(`pay-plans`)
    if(resp.return_code) return
    let index = 1
    plan_table = {}
    options.value = resp.map((e:any) => {
        let r:any = {
            label: e.name,
            key: e.id,
            children: []
        }
        if(e.plan_periods)  {
            e.plan_periods.forEach((period:any) => {
                r.children.push({label: period.period_name, key: index})
                plan_table[index] = {plan_id: e.id, period_id: period.period_id, user_id: props.userId}
                index ++
            })
        }
        return r
    })
})

watch(() => props.userId, (userId) => {
    query()
}, {immediate:true})

async function query() {
    let resp: any = await Service.post('/user-plans/page', {
        order_by: "op.id desc",
        page: pagination.page,
        per_page: pagination.pageSize,
        owner_id: props.userId
    })

    pagination['pageCount'] = resp['total_pages']
    pagination['itemCount'] = resp['total']
    data.value = resp['data']
}

let options: any = ref([])
async function handleSelect(value: any) {
    let plan = plan_table[value]
    let resp:any = await Service.post(`/user-plans/open-plan`, plan)
    typeof resp === 'boolean' && message.success('开通成功')
    query()
}
</script>

<template>
    <n-dropdown  :options="options"
    placement="bottom-start"
    trigger="click"
    @select="handleSelect">
        <n-button type="primary" style="margin-bottom: 10px;">开通</n-button>
    </n-dropdown>

  <n-data-table class="table" remote :columns="columns" :data="data" :pagination="pagination" :single-line="false"
        size="small" />


</template>

<style lang="scss" scoped>
</style>