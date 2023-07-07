<script setup lang="ts">
import { NScrollbar, useMessage, NText, NCard } from 'naive-ui';
import { reactive, ref, onMounted } from 'vue';
import Service from '@/utils/Service';
import { useRouter } from 'vue-router';
const router = useRouter()
const message = useMessage()

let data: any = ref([])
let order_statues: any = [
    { label: '待支付', value: 0, type: 'warning', color: '#f0a06c' },
    { label: '已支付', value: 1, type: 'success', color: '#60a058' },
    { label: '失败', value: 2, type: 'error', color: '#d03050' },
    { label: '已取消', value: 3, type: 'default', color: '#d9d9d9' },
]
function getOrderStatus(order_status: any) {
    let status = order_statues[order_status]
    if (status) return status;
    else return order_statues[0]
}

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
    data.value.push(...resp['data'])
}

function handleInfiniteScroll() {

    console.log('hello');

}
</script>

<template>
    <div class="container" style="display: flex;">
        <!-- <n-form label-placement="left" inline style="margin-top: 10px;">
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
        </n-form> -->
        <n-scrollbar >
            <div v-infinite-scroll="handleInfiniteScroll" class="scroll-body" infinite-scroll-immediate-check="false">
                <template v-for="item in data">
                    <n-card size="small" class="card" @click="router.push(`/mobile/orders/${item.order_no}`)">
                        <template #header>
                            <div class="order-header">
                                <div style="font-size: 14px;font-weight: bold;">{{ item?.plan?.period_name }}-{{
                                    item?.plan?.plan_name }}</div>

                                <n-text :style="{ color: getOrderStatus(item.order_status).color, fontSize: '12px' }">{{
                                    getOrderStatus(item.order_status).label }}</n-text>
                            </div>
                        </template>

                        <div class="order-body">
                            <div style="color: #aaa;font-size: 12px;">下单时间：{{ item.create_time }}</div>
                            <div style="font-size: 12px;">￥ <span style="color: red;font-size: 16px;">{{ (item.amount
                                / 100).toFixed(2) }}</span></div>
                        </div>
                    </n-card>
                </template>
            </div>
        </n-scrollbar>
    </div>
</template>

<style lang="scss" scoped>
.scroll-body {
    flex: 1;
}

.order-header,
.order-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-body {
    margin-top: 15px;
}

.card:not(:last-child) {
    margin-bottom: 10px;
}</style>