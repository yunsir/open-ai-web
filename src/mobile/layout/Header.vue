<script setup lang="ts">
import { NAvatar, NProgress, NDrawer, NDrawerContent, NList, NListItem, NScrollbar, NPopover } from 'naive-ui';
import { h, onMounted, ref } from 'vue';
import store from '@/store';
import Service from '@/utils/Service';
import emitter from '@/utils/Emitter';
import { useRouter } from 'vue-router';
const router = useRouter()
let avatar = ref(`https://www.gravatar.com/avatar/${store.state.user_info.id}?d=identicon`)


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

function showUsed(plan: any) {
    if (plan.capacity == null || plan.used == null) return 0
    return plan.used
}


let show_menu = ref(false)
</script>

<template>
    <div class="header">
        <div class="menu">
            <icon name="caidan" style="font-size: 20px;" @click="show_menu = true"></icon>
        </div>
        <div class="title">
            <div style="font-size: 20px;font-weight: bold;" @click="router.push('/mobile/chat')">AI助手</div>
        </div>
        <div class="right">
            <n-progress type="circle" :status="plan_status" :percentage="plan_progress" style="max-width: 30px;" :show-indicator="false">
            </n-progress>
            <div style="font-size: 12px;font-weight: bold; margin-left: 3px;line-height: 14px;display: flex;flex-direction: column;justify-content: center;">
                <div>已用：{{ showUsed(plan) }} 条 </div>
                <div>总计：{{ plan.capacity || 0 }} 条</div>
            </div>
        </div>

    </div>
    <n-drawer class="left-menu" v-model:show="show_menu" width="80%" placement="left">
        <n-drawer-content>
            <div class="menu-container">
                <n-scrollbar class="history">

                </n-scrollbar>
                <n-list class="menu-list">
                    <n-list-item style="padding: 0;"></n-list-item>
                    <n-list-item>
                        <div class="menu-item" @click="router.replace(`/mobile/buy-plans`),show_menu=false">
                            <icon name="wenjian" />
                            <div class="desc">订阅套餐</div>
                        </div>
                    </n-list-item>
                    <n-list-item>
                        <n-popover class="sub-menu" trigger="click" :show-arrow="false">
                            <template #trigger>
                                <div class="menu-item"> <n-avatar :src="avatar"
                                        style="width: 20px;height: 20px;"></n-avatar>
                                    <div class="desc"> {{ store.state.user_info.username }}</div>
                                    <div style="display: flex;justify-content: center;align-items: center;;">
                                        <icon name="gengduo"></icon>
                                    </div>
                                </div>
                            </template>
                            <n-list class="menu-list">
                                <n-list-item>
                                    <div class="menu-item" @click=" router.push(`/mobile/orders`),show_menu=false">
                                        <icon name="dingdan" />
                                        <div class="desc">我的订单</div>
                                    </div>
                                </n-list-item>
                                <n-list-item>
                                    <div class="menu-item" @click=" router.push(`/mobile/user/passwd`),show_menu=false">
                                        <icon name="mima" />
                                        <div class="desc">修改密码</div>
                                    </div>
                                </n-list-item>
                                <n-list-item>
                                    <div class="menu-item" @click="store.dispatch('logout'),show_menu=false">
                                        <icon name="tuichu" />
                                        <div class="desc">退出登录</div>
                                    </div>
                                </n-list-item>
                            </n-list>
                        </n-popover>
                    </n-list-item>
                </n-list>
            </div>

        </n-drawer-content>
    </n-drawer>
</template>

<style scoped lang="scss">
.header {
    height: 50px;
    background-color: white;
    display: flex;
    justify-content: space-between;
    padding: 0 15px;

    .menu {
        flex: 1;
        display: flex;
        align-items: center;
    }

    .title {
        flex: 1;
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
        flex: 1;
        display: flex;
        justify-content: end;
        align-items: center;
    }
}
</style>
<style lang="scss">
.left-menu.n-drawer {
    .n-drawer-content .n-drawer-body-content-wrapper {
        padding: 0;
    }

    .n-list .n-list-item {
        padding-left: 10px;
        padding-right: 10px;
    }

    .menu-container {
        display: flex;
        flex-direction: column;
        height: 100%;

        .history-title {
            position: relative;
            padding: 14px 10px;
            box-sizing: border-box;
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            border-bottom: 1px solid rgba(239, 239, 245, 1);
            color: #555;
        }

        .history {
            flex: 1;
        }
    }

    .menu-list {
        margin-top: 10px;

        .menu-item {
            display: flex;
            width: 100%;
            cursor: pointer;
            .icon {
                font-size: 20px;
                color: #b39254;
            }

            .desc {
                margin-left: 10px;
                flex: 1;
            }
        }
    }

    .v-binder-follower-content {
        width: 95%;
    }

    .n-popover {
        --n-space: 20px !important;
        padding: 0 !important;
    }

}
</style>