<script setup lang="ts">
import { NScrollbar, NList, NListItem, NPopover, NAvatar } from 'naive-ui';
import { useRouter } from 'vue-router';
import store from '@/store';
import { onMounted, ref } from 'vue';
import Service from '@/utils/Service';
const router = useRouter()

let avatar = ref(`https://www.gravatar.com/avatar/${store.state.user_info.id}?d=identicon`)

let show_menu = ref(false)
let show_setting = ref(false)

onMounted(() => {
    querySessions()
})

let data = ref([])
async function querySessions() {
    let resp: any = await Service.get(`/chat-sessions`)
    data.value = resp
}


</script>

<template>
    <div class="sidebar">
        <!-- <n-menu :options="menuOptions" accordion @update:value="clickItem" :default-expand-all="true"
            :default-value="defaut_key" /> -->

        <div class="menu-container">
            <n-scrollbar class="history">

            </n-scrollbar>
            <n-list class="menu-list">
                <n-list-item style="padding: 0;"></n-list-item>
                <n-list-item v-if="store.state.user_info.is_admin">

                    <n-popover class="sub-menu" trigger="click" :show-arrow="false" :show="show_setting">
                        <template #trigger>
                            <div class="menu-item" @click="show_setting = !show_setting">
                                <icon name="shezhi" />
                                <div class="desc">系统设置</div>
                            </div>
                        </template>
                        <n-list class="menu-list">
                            <n-list-item>
                                <div class="menu-item" @click=" router.push(`/plans`), show_setting = false">
                                    <icon name="taocan" />
                                    <div class="desc">套餐管理</div>
                                </div>
                            </n-list-item>
                            <n-list-item>
                                <div class="menu-item" @click=" router.push(`/periods`), show_setting = false">
                                    <icon name="zhouqi" />
                                    <div class="desc">周期管理</div>
                                </div>
                            </n-list-item>
                            <n-list-item>
                                <div class="menu-item" @click="router.push(`/settings/platform-key`), show_setting = false">
                                    <icon name="key" />
                                    <div class="desc">平台KEY</div>
                                </div>
                            </n-list-item>
                            <n-list-item>
                                <div class="menu-item" @click="router.push(`/users`), show_setting = false">
                                    <icon name="user" />
                                    <div class="desc">用户管理</div>
                                </div>
                            </n-list-item>
                        </n-list>
                    </n-popover>

                </n-list-item>
                <n-list-item>
                    <div class="menu-item" @click="router.replace(`/buy-plans`), show_menu = false">
                        <icon name="wenjian" />
                        <div class="desc">订阅套餐</div>
                    </div>
                </n-list-item>
                <n-list-item>
                    <n-popover class="sub-menu" trigger="click" :show-arrow="false" :show="show_menu">
                        <template #trigger>
                            <div class="menu-item" @click="show_menu = !show_menu"> <n-avatar :src="avatar"
                                    style="width: 20px;height: 20px;"></n-avatar>
                                <div class="desc"> {{ store.state.user_info.username }}</div>
                                <div style="display: flex;justify-content: center;align-items: center;;">
                                    <icon name="gengduo"></icon>
                                </div>
                            </div>
                        </template>
                        <n-list class="menu-list">
                            <n-list-item>
                                <div class="menu-item" @click=" router.push(`/orders`), show_menu = false">
                                    <icon name="dingdan" />
                                    <div class="desc">我的订单</div>
                                </div>
                            </n-list-item>
                            <n-list-item>
                                <div class="menu-item" @click=" router.push(`/user/passwd`), show_menu = false">
                                    <icon name="mima" />
                                    <div class="desc">修改密码</div>
                                </div>
                            </n-list-item>
                            <n-list-item>
                                <div class="menu-item" @click="store.dispatch('logout'), show_menu = false">
                                    <icon name="tuichu" />
                                    <div class="desc">退出登录</div>
                                </div>
                            </n-list-item>
                        </n-list>
                    </n-popover>
                </n-list-item>
            </n-list>
        </div>
    </div>
</template>
<style lang="scss" scoped>
:deep(.n-list) {
    .n-list-item {
        padding: 12px 15px;
    }
}
</style>
<style lang="scss">
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
        padding: 0 10px;
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
    width: var(--v-target-width);
}

.n-popover {
    --n-space: 20px !important;
    padding: 0 !important;
}
</style>