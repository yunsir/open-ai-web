<script setup lang="ts">
import Codemirror from "codemirror-editor-vue3";
// language
import "codemirror/mode/javascript/javascript";
// 代码提示
import 'codemirror/addon/selection/active-line'
// theme
import "codemirror/theme/solarized.css";
import 'codemirror/addon/edit/closebrackets'
import { onMounted, ref } from "vue";
const emit = defineEmits(['update:modelValue', 'change'])
const props = defineProps({
    modelValue: String,
    defaultValue: String,
})

onMounted(() => {
    code.value = props.modelValue || ''
})

let code:any = ref('')
let cm_options: any = {
    mode: "javascript", // 语言模式
    theme: "solarized", // 主题
    lineNumbers: true, // 显示行号
    smartIndent: true, // 智能缩进
    indentUnit: 2, // 智能缩进单位为4个空格长度
    foldGutter: false, // 启用行槽中的代码折叠
    styleActiveLine: true, // 显示选中行的样式
    matchBrackets: true,	//匹配括号
    autoCloseBrackets: true, // 在键入时自动关闭括号和引号
    hintOptions: {
        completeSingle: false
    },
    extraKeys: { "Ctrl-Space": "autocomplete" }
}

function handleChangeCode(value: any, editor: any) {
    emit('update:modelValue', value)
    emit('change', value)
}

</script>

<template>
    <div class="code-editor">
        <Codemirror   class="code-editor-body" v-model:value="code" :options="cm_options" @change="handleChangeCode" />
    </div>
</template>

<style lang="scss" scoped>
.code-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &-body {
        margin-top: 10px;
        width: 100%;
        flex: 1;

    }
}</style>