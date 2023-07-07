<script setup lang="ts">
import { NSpace, NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, useMessage } from 'naive-ui';
import Header from './Header.vue';
import Siderbar from './Siderbar.vue';
window.$message = useMessage()

</script>

<template>
    <n-space vertical size="large">
        <n-layout class="layout-hello-world" position="absolute">
            <n-layout-header>
                <Header></Header>
            </n-layout-header>
            <n-layout has-sider>
                <n-layout-sider :native-scrollbar="false" :bordered="true">
                    <Siderbar></Siderbar>
                </n-layout-sider>
                <n-layout-content :native-scrollbar="false">
                    <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component :is="Component" :key="$route.name" v-if="$route.meta.keep_alive" />
                        </keep-alive>
                        <component :is="Component" :key="$route.name" v-if="!$route.meta.keep_alive" />
                    </router-view>
                </n-layout-content>
            </n-layout>
        </n-layout>
    </n-space>
</template>

<style lang="scss" scoped>
.n-layout-header {
    box-shadow: rgb(0 0 0 / 10%) 0px 1px 4px 0px;
    border-bottom: 1px solid #eee;
}

.n-layout {
    height: 100%;

    ::v-deep(.n-layout-scroll-container) {
        display: flex;
        flex-direction: column;

        .n-scrollbar-content {
            height: 100%;

            display: flex;

            .sidebar {
                width: 100%;
            }
        }
    }

}
</style>