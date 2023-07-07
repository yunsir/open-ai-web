<script setup lang="ts">
import { NMenu,  NScrollbar } from 'naive-ui';
import { onMounted, ref, watch } from 'vue';
import FormulaEditor from "./formula-editor.vue";

const emit = defineEmits(['update:value'])
const props = defineProps({
    options: Array<any>,
    value: String,
})

let fields:any = ref([])
let formula = ref(props.value || '')
onMounted(() => {
    props.options?.forEach(option=> {
        fields.value.push({id: option.column_name, name: option.column_desc, fieldType: 'text'})
    })

})


let formula_editor:any = ref(null)
function clickItem(v:any) {
    let option = props.options?.find(e => e.column_name === v)
    formula_editor.value.insertField({id: option.column_name, name: option.column_desc, fieldType: 'text'})
}

watch(() => formula.value, (value) => {
    emit('update:value', value)
})

</script>

<template>
    <div class="editor">
        <div class="editor-left">
            <div class="title">可选字段</div>
            <n-scrollbar style="max-height: 100%;">
                <n-menu :options="options" accordion @update:value="clickItem" key-field="column_name"
                    label-field="column_desc" />
            </n-scrollbar>
        </div>
        <div class="editor-desc">
            <formula-editor  v-model="formula" :fields="fields"  ref="formula_editor"></formula-editor>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.editor {
    border: 1px solid #e1e1e1;
    width: 100%;
    padding: 8px;
    display: flex;

    &-left {
        height: 410px;
        flex: 1;
        border: 1px solid #e1e1e1;
        margin-right: 9px;
        display: flex;
        flex-direction: column;
        .title {
            height: 30px;
            line-height: 30px;
            padding: 0 18px;
            border-bottom: 1px solid #e1e1e1;
            cursor: pointer;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: bold;
        }
    }

    &-desc {
        flex: 3;
        border: 1px solid #e1e1e1;
    }

    :deep(.n-menu) {
        padding-bottom: 0;
    }

    .n-menu :deep(.n-menu-item) {
        margin-top: 0;
    }

    .n-menu :deep(.n-menu-item-content::before) {
        left: 0;
        right: 0
    }
}
</style>