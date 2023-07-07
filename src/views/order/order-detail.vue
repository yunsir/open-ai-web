<script setup lang="ts">
import { NButton, NCard,NAlert} from 'naive-ui';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Service from '@/utils/Service';
let route = useRoute()
let router = useRouter()

let order_no = route.params.order_no
let data: any = ref({})
onMounted(async () => {
    let resp: any = await Service.get(`/orders/${order_no}`)
    data.value = resp
})

async function handleCloseOrder() {
    await Service.post(`/orders/${order_no}/cancel`)
    router.push(`/orders`)
}
</script>

<template>
    <div class="buy-plan container" style="flex-direction: row;">
        <div class="left">
            <n-card v-if="data.order_status != 0">
                <template #default>
                    <div class="card-body" style="display: flex;align-items: center;flex-direction: column;">
                        <template v-if="data.order_status == 1">
                            <div style="margin-bottom: 20px;">
                                <icon name="chenggong" style="font-size: 72px;"></icon>
                            </div>
                            <div class="result-title">
                                已完成
                            </div>
                            <div class="result-subtitle">
                                {{ data.description }}
                            </div>
                        </template>

                        <template v-if="data.order_status == 3">
                            <div style="margin-bottom: 20px;">
                                <icon name="jinggao" style="font-size: 72px;"></icon>
                            </div>
                            <div class="result-title">
                                已取消
                            </div>
                            <div class="result-subtitle">
                                {{ data.description }}
                            </div>
                        </template>
                    </div>
                </template>
            </n-card>

            <n-card>
                <template #header>
                    <h3 class="card-header"> 商品信息 </h3>
                </template>
                <template #default>
                    <div class="card-body card-desc">
                        <div><span>产品名称：</span><span>{{ data.plan?.plan_name }}</span></div>
                        <div><span>类型/周期：</span><span>{{ data.plan?.period_name }}</span></div>
                        <div><span>产品可用量：</span><span>{{ data.plan?.plan_capacity }}条</span></div>
                    </div>
                </template>
            </n-card>

            <n-card>
                <template #header>
                    <div style="display: flex;justify-content: space-between;">
                        <h3 class="card-header"> 订单信息 </h3>
                        <n-button type="primary" v-if="data.order_status == 0" @click="handleCloseOrder">关闭订单</n-button>
                    </div>

                </template>
                <template #default>
                    <div class="card-body card-desc">
                        <div><span>订单号：</span><span>{{ data.order_no }}</span></div>
                        <div><span>创建时间：</span><span>{{ data.create_time }}</span></div>
                    </div>
                </template>
            </n-card>

            <n-card style="margin-top: 20px;" v-if="data.order_status == 0">
                <template #header>
                    <h3 class="card-header"> 支付方式</h3>
                </template>
                <template #default>
                    <div class="card-body card-pay">
                        <n-alert type="warning" > 支付完成请联系管理员进行开通</n-alert>
                        <img style="max-width: 240px;margin-top: 10px;" src="/pay.jpg"/>
                    </div>
                </template>
            </n-card>
        </div>
        <div class="right" v-if="data.order_status == 0">
            <n-card class="plan-order">
                <template #header>
                    <h3 class="card-header">订单总额</h3>
                </template>
                <template #default>
                    <div style=" padding: 20px;">
                        <div class="row">
                            <div style="flex: 1 1 0%;"> {{ data.plan?.plan_name + ' x ' + data.plan?.period_name }}
                            </div>
                            <div style="lex: 1 1 0%;text-align: right;">¥ {{
                                data['amount'] ? (parseFloat(data['amount']) / 100).toFixed(2) : '0.00' }}</div>
                        </div>
                        <div style="color: rgb(100, 102, 105);    padding-top: 1rem!important;">总计</div>
                        <h1 style="font-size: 2.25rem;">¥ {{ data['amount'] ? (parseFloat(data['amount']) / 100).toFixed(2)
                            :
                            '0.00' }} CNY</h1>
                        <!-- <n-button @click="handlePayOrder">结账</n-button> -->
                    </div>
                </template>
            </n-card>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.buy-plan {
    max-width: 1200px;
    margin: auto;
    display: flex;

    .left {
        flex: 2;
    }

    .right {
        flex: 1;
        margin-left: 20px;
    }

    :deep(.n-card-header) {
        background-color: #fafafa;
        padding: 1rem;
    }

}

:deep(.n-card) {
    &:not(:first-child) {
        margin-top: 20px;
    }

    .n-card-header {
        padding: 1rem;
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

.card-body {
    padding: 1.25rem;
}

.card-desc {
    &>div {
        display: flex;
        font-size: 14px;
        margin-bottom: 5px;

        &>span:first-child {
            flex: 1 1;
            opacity: .5;
        }

        &>span:last-child {
            flex: 2 1;
            font-family: menlo;
        }
    }
}

.plan-order {
    background: rgb(53, 56, 61) !important;
    color: #f8f9fa !important;

    :deep(.n-card-header) {
        background: rgb(53, 56, 61) !important;
        padding: 1rem;
    }

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


.result-title {
    color: rgba(0, 0, 0, .85);
    font-size: 24px;
    line-height: 1.8;
    text-align: center;
}

.result-subtitle {
    color: rgba(0, 0, 0, .45);
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
}

@media (max-width: 768px) {
    .buy-plan {

        flex-direction: column !important;
        .left {
            flex: 0;
        }

        .right {
            margin-top: 10px;
            margin-left: 0;
            padding-bottom: 20px;
        }
    }

}
</style>