<script setup lang="ts">
import CodeMirror from 'codemirror';
import './formula-MIME';
import './formula-hint'
import 'codemirror/addon/display/placeholder';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/hint/show-hint.css';
import * as util from './util';

import { onMounted, reactive, ref } from 'vue';
import ObjectUtil from '@/utils/ObjectUtil';

const emit = defineEmits(['update:modelValue'])
const props: any = withDefaults(defineProps<{
    placeholder?: string,
    readOnly?: boolean,
    fields: Array<any>,
    modelValue: string,
}>(), {
    placeholder: '请选择获取输入数据项',
    readOnly: false,
})
let editor: any
let formula_editor: any = ref(null)
let editor_fields: any = reactive({});
onMounted(() => {
    editor = CodeMirror(formula_editor.value, {
        theme: 'formula',
        mode: 'formula',
        addModeClass: true,
        lineNumbers: false,
        lineWrapping: true,
        placeholder: props.placeholder,
        matchBrackets: {
            maxScanLines: 2000,
            maxHighlightLineLength: 2000,
        },
        hintOptions: {
            completeSingle: false,
            // closeOnUnfocus: false,
            // closeCharacters: /[\s()\[\]{};:>,]/,
        },
        readOnly: props.readOnly,
        // https://discuss.codemirror.net/t/how-to-disable-multiple-selection/2291/2 禁止多光标
        configureMouse: () => ({ addNew: false }),
        // 公式编辑器实例
        formulaEditor: formula_editor.value,
    });
    setTimeout(() => {
        registerFields()
        registerEvent()

        if (props.modelValue) {
            util.insertEditorText(editor, props.modelValue, editor_fields, true)
        }
    }, 0)

})


function insertField(field: any) {
    util.insertField(editor, field);
}

defineExpose({
    insertField
})

function registerFields() {
    props.fields.forEach((field:any) => {
        editor_fields[field.id] = ObjectUtil.deepCopy(field)
    })
}

function registerEvent() {
    editor.on('change', (v:any) => {
        setTimeout(() => {
            let code = util.getEditorValue(editor)
            emit('update:modelValue', code)
        }, 0)
    })

    // @ts-ignore
    // this.editor.on('cursorActivity', () => {
    //   if (this.debounce) {
    //     cancelAnimationFrame(this.debounce);
    //     this.debounce = 0;
    //   }
    //   this.debounce = requestAnimationFrame(() => {
    //     const funcName = getActiveFuncName(this.editor);
    //     if (this.formulaTokenFuncs.includes(funcName.toUpperCase())) {
    //       CodeMirror.signal(this, 'tip', funcName);
    //     }
    //   });
    // });
}
</script>

<template>
    <div ref="formula_editor" class="formula-editor"></div>
</template>

<style lang="scss" >
@import './formula-theme.scss';

.formula-editor {
    height: 100%;
    width: 100%;
    font-size: 13px;
}
</style>