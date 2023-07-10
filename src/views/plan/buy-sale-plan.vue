<script setup lang="ts">
import { NButton, NCard, useMessage } from 'naive-ui';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Service from '@/utils/Service';
let route = useRoute()
let router = useRouter()
let message = useMessage()

let id = route.params.id
let data: any = ref({})
onMounted(async () => {
    let resp: any = await Service.get(`/pay-plans/${id}`)
    data.value = resp
    selected_item.value = resp['plan_periods'][0]
    resp['plan_periods'][0]._selected = true
})

let selected_item: any = ref({})
function handleSelect(peroid: any) {
    let periods: any[] = data.value['plan_periods']
    periods.forEach(e => e._selected = false)
    selected_item.value = peroid
    peroid._selected = true
}

async function handlePayOrder() {
    let resp: any = await Service.post(`/orders`, { plan_period_id: selected_item.value.id })
    if (!resp.return_code) {
        if (route.path.startsWith('/mobile')) {
            router.push(`/mobile/orders/${resp.order_no}`)
        } else {
            router.push(`/orders/${resp.order_no}`)
        }

    } else {
        // message.error('下单失败')
    }
}
</script>

<template>
    <div class="buy-plan container" style="flex-direction: row;">
        <div class="left">
            <n-card class="plan-detail">
                <template #header>
                    <h3 class="card-header">{{ data['name'] }}</h3>
                </template>
                <template #default>
                    <div class="card-body" v-html="data['content']"></div>
                </template>
            </n-card>
            <n-card class="plan-periods">
                <template #header>
                    <h3 class="card-header">付款周期</h3>
                </template>
                <template #default>
                    <template v-for="peroid in data['plan_periods']">
                        <div :class="{ row: true, active: peroid._selected }" @click="handleSelect(peroid)">
                            <div style="flex: 1 1 0%;">{{ peroid['period_name'] }}</div>
                            <div style="lex: 1 1 0%;text-align: right;">¥ {{
                                peroid['price'] ? (parseFloat(peroid['price']) / 100).toFixed(2) : '0.00' }}</div>
                        </div>
                    </template>
                </template>
            </n-card>
        </div>
        <div class="right">

            <n-card class="plan-coupon">

                <template #default>

                </template>
            </n-card>

            <n-card class="plan-order">
                <template #header>
                    <h3 class="card-header">订单总额</h3>
                </template>
                <template #default>
                    <div style=" padding: 20px;">
                        <div class="row">
                            <div style="flex: 1 1 0%;"> {{ data['name'] + ' x ' + selected_item['period_name'] }}
                            </div>
                            <div style="lex: 1 1 0%;text-align: right;">¥ {{
                                selected_item['price'] ? (parseFloat(selected_item['price']) / 100).toFixed(2) : '0.00' }}
                            </div>
                        </div>
                        <div style="color: rgb(100, 102, 105);    padding-top: 1rem!important;">总计</div>
                        <h1 style="font-size: 2.25rem;">¥ {{ selected_item['price'] ?
                            (parseFloat(selected_item['price']) / 100).toFixed(2) : '0.00' }} CNY</h1>
                        <n-button @click="handlePayOrder">下单</n-button>
                    </div>
                </template>
            </n-card>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.buy-plan {
    max-width: 1200px;
    display: flex;

    .left {
        flex: 2;
    }

    .right {
        flex: 1;
        margin-left: 20px;

    }
}

:deep(.n-card) {

    .n-card-header {
        padding: 1rem;
        padding-bottom: 0;
    }

    .n-card__content {
        padding: 0;
    }
}

.card-header {
    min-height: 1.75rem;
    margin: 0;
    font-size: 1.125rem;
    font-weight: 400;
    line-height: 1.75;
}

.plan-detail {
    .card-body {
        p {
            margin: 0;
        }

        p:not(:first) {
            margin-top: 10px;
        }
    }

    .card-body {
        margin: 0 auto;
        padding: 1rem;
    }

    .card-header {
        font-size: 1.25rem;
        font-weight: 600;
    }

}

.plan-periods {
    margin-top: 20px;

    :deep(.n-card-header) {
        background-color: #fafafa;
        padding: 1rem;
    }

    .row {
        padding: 20px;
        display: flex;
        font-size: 16px;
        border-bottom: 1px solid #eee;
    }

}

.active {
    //border-bottom: unset !important;
    border-radius: 5px;
    border: 2px solid #18a058 !important;
    margin: -2px -2px -1px;
}

.plan-order {
    background: rgb(53, 56, 61);
    color: #f8f9fa !important;

    .card-header {
        color: #f8f9fa !important;
        font-weight: bold;
    }

    .row {
        padding-bottom: 1rem !important;
        display: flex;
        border-bottom: 1px solid rgb(100, 102, 105);
    }

    :deep(.n-button) {
        color: #fff;
        background-color: #18a058;
        border: none;
        width: 100%;
        --n-border: none !important;
    }
}

@media (max-width: 768px) {
    .buy-plan {

        flex-direction: column !important;

        .left {
            flex: 0;
        }

        .right {
            margin-top: 10px;
            flex: 0;
            margin-left: 0;
        }
    }

}
</style>