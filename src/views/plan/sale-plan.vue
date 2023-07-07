<script setup lang="ts">
import { NButton, NCard } from 'naive-ui';
import { ref, onMounted } from 'vue';
import Service from '@/utils/Service';
import { useRouter,useRoute } from 'vue-router';
let router = useRouter()
let route = useRoute()
onMounted(() => {
    query()
})
let data: any = ref([])


async function query() {
    let resp: any = await Service.get('/pay-plans')
    if (!resp['return_code']) {
        data.value = resp
    }

}
function handleBuy(item: any) {
    if(route.path.startsWith('/mobile')) {
        router.push(`/mobile/sale-plans/${item.id}`)
    } else {
        router.push(`/sale-plans/${item.id}`)
    }
}
</script>

<template>
    <div class="container" style="display: block;">
        <div class="plan-header">选择最适合您的套餐 </div>
        <div class="plan-list">

            <template v-for="item in data">
                <div class="card">
                    <n-card @click="handleBuy(item)">
                        <template #header>
                            <h3 class="card-header">{{ item['name'] }}</h3>
                        </template>
                        <template #default>
                            <div>
                                <div class="card-price" v-if="item?.plan_periods">
                                    <p class="card-price-main">¥ {{
                                        (parseFloat(item?.plan_periods[0]?.price) / 100).toFixed(2) }}</p>
                                    <p class="card-price-desc">{{ item?.plan_periods[0]?.period_name }}</p>
                                </div>
                                <div class="card-body" v-html="item['content']"></div>
                            </div>
                        </template>
                        <template #footer>
                            <n-button> 立即购买</n-button>
                        </template>

                    </n-card>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.plan-header {
    font-weight: 400 !important;
    color: #212529;
    font-size: 1.875rem;
    max-width: 1200px;
    padding-left: 14px;
}

.plan-list {
    margin: 10px auto;

    :deep(.n-button) {
        color: #287a79;
        background-color: #caeeed;
        border-color: #caeeed;
        --n-border: none !important;

        .n-button__content {
            font-size: .875rem;
            font-weight: 600;
        }
    }

    :deep(.n-card) {
        cursor: pointer;
    }
}
</style>