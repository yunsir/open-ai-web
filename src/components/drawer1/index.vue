<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

let teleport_key:number = 0
const props: any = defineProps({
    show: { type: Boolean },
    width: String,
    title: String,
    placement: String
})

const emits = defineEmits(['update:show'])

let data: any = reactive({
    show: false
})
watch(() => props.show, () => {
    data.show = props.show;
})

function close() {
    data.show = false
    emits('update:show', false)
}
</script>
<template>
    <Teleport to="body" :key="teleport_key ++">
        <div class="drawer" v-if="data.show">
            <!-- 遮罩层 -->
            <div class="drawer-mask" @click="close()"></div>
            <!-- 抽屉层 -->

            <div class="drawer-content" :style="{ 'width': width }">
                <div class="drawer-content-header">
                    <template v-if="$slots.header">
                        <slot name="header"></slot>
                    </template>

                    <template v-else>
                        {{ title }}
                    </template>

                </div>
                <div class="drawer-content-body" v-if="!!$slots.body">
                    <slot name="body"></slot>
                </div>

                <div class="drawer-content-footer" v-if="!!$slots.footer">
                    <slot name="footer">

                    </slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
.drawer {
    // height: 500px;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;

    /* 遮罩 */
    &-mask {
        //     position: absolute;
        // left: 0;
        // right: 0;
        // bottom: 0;
        // top:0;
        position: fixed;
        z-index: 999;
        top: 0px;
        bottom: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .3);
    }

    &-content {
        position: fixed;
        z-index: 1000;
        top: 0px;
        bottom: 0px;
        height: 100%;

        // background: #FFFFFF;
        // border-left: 1px solid #CFD8DC !important;
        // box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.12);
        // -webkit-transition: all 1s ease;
        box-shadow: 0 6px 16px -9px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 12px 48px 16px rgba(0, 0, 0, 0.03);
        background-color: #fff;
        color: rgb(51, 54, 57);
        box-sizing: border-box;
        transition: background-color .3s cubic-bezier(0.4, 0, 0.2, 1), color .3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 20px;

        right: 0px;
        display: flex;
        flex-direction: column;


        &-header {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        &-body {
            flex: 1;
        }

        &-footer {}
    }

    :deep(.n-data-table .n-data-table-empty) {
        display: none;
    }

}
</style>