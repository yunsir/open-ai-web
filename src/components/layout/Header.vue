<script setup lang="ts">
import { NAvatar, NDropdown, NProgress } from 'naive-ui';
import { onMounted, ref } from 'vue';
import store from '@/store';
import Service from '@/utils/Service';
import emitter from '@/utils/Emitter';
import { useRouter } from 'vue-router';
const router = useRouter()

onMounted(() => {
    queryPlanRemain()

    emitter.on('finished', () => {
        queryPlanRemain()
    })
})

let plan: any = ref({ capacity: 0, used: 0 })
let plan_progress: any = ref(null)
let plan_status: any = ref('success')
async function queryPlanRemain() {
    let user_plan: any = await Service.get(`/user-plans`)

    if (user_plan) {
        plan.value = user_plan

        plan_progress.value = Math.floor(user_plan.used / user_plan.capacity * 100)
        if (plan_progress.value > 50 && plan_progress.value < 80) {
            plan_status.value = 'warning'
        }
        if (plan_progress.value >= 80) {
            plan_status.value = 'error'
        }
    }
}

function showUsed(plan:any) {
    if( plan.capacity == null || plan.used == null) return 0
    return plan.used
}
</script>

<template>
    <div class="header">
        <div class="title">
            <div style="margin-left:20px;font-size: 20px;font-weight: bold; cursor: pointer;" @click="router.push(`/chat`)">AI助手</div>
        </div>
        <div class="right">
            <div class="info">
                <div>
                        <n-progress type="line" :status="plan_status" :percentage="plan_progress" style="max-width: 200px;"
                            :show-indicator="false" :height="5" :border-radius="4"></n-progress>
                        <div style="font-size: 12px;font-weight: bold; margin-top: 3px;">
                            已用 {{ showUsed(plan) }} 条 / 总计 {{ plan.capacity || 0 }} 条
                        </div>
                    </div>
            </div>

            <!-- <n-dropdown trigger="hover" :options="options">
                <n-avatar round :src="avatar"></n-avatar>
            </n-dropdown> -->


        </div>
    </div>
</template>

<style scoped lang="scss">
.header {
    height: 50px;
    background-color: white;
    display: flex;
    justify-content: space-between;

    .title {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .info {
        display: flex;
        justify-content: center;
        flex: 1;
        flex-direction: column;
        margin-right: 60px;
        width: 200px;
    }

    .right {
        display: flex;
        justify-content: center;
        align-items: center;


    }
}
</style>