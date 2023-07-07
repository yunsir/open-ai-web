<script setup lang="ts">
import { NSpace, NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, useMessage } from 'naive-ui';
import Header from './Header.vue';
window.$message = useMessage()

</script>

<template>
    <n-space vertical size="large">
        <n-layout position="absolute">
            <n-layout-header>
                <Header></Header>
            </n-layout-header>
            <n-layout-content  :native-scrollbar="false">
                    <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component :is="Component" :key="$route.name" v-if="$route.meta.keep_alive" />
                        </keep-alive>
                        <component :is="Component" :key="$route.name" v-if="!$route.meta.keep_alive" />
                    </router-view>
                </n-layout-content>
        </n-layout>
    </n-space>
</template>

<style lang="scss" scoped>
.n-layout-header {
    box-shadow: rgb(0 0 0 / 10%) 0px 1px 4px 0px;
    border-bottom: 1px solid #eee;
}

.n-layout {

    ::v-deep(.n-layout-scroll-container) {

        display: flex;
        flex-direction: column;

        .n-scrollbar-content {
            height: 100%;
            display: flex;
        }
    }

}
</style>