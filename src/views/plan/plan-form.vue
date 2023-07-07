<script setup lang="ts">
import { NDataTable, NForm, NFormItem, FormRules, NInput, NDropdown, NA, NInputNumber, NSwitch,NSelect} from 'naive-ui';
import { h, reactive, ref, onMounted, defineComponent, nextTick, withDefaults } from 'vue';
import Sortable from 'sortablejs'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

onMounted(() => {
    nextTick(() => {
        let head: HTMLElement | null = document.querySelector('.n-data-table-tbody')
        if (head == null) {
            return
        }
        Sortable.create(head, {
            animation: 500,
            onEnd({ oldIndex, newIndex }: any) {
                let plan_periods = props.form.plan_periods
                let temp = plan_periods[oldIndex]
                plan_periods[oldIndex] = plan_periods[newIndex]
                plan_periods[newIndex] = temp
            },
        });
    })
})
const props = withDefaults(defineProps<{
    form: any,
    periods_options: Array<any>
}>(), {
    form: () => ({
        plan_periods: [],
    }),
    periods_options: () => []
})

let rules: FormRules = {
    'name': [{ type: 'string', required: true, message: '请输入名称', trigger: 'blur' }],
}
let columns = reactive([
    { title: '付款周期', key: 'period_name', width: '50%' },
    {
        title: '价格', key: 'price', render(row: any, index: number): any {
            return h(ShowOrEdit, {
                value: row.price,
                onUpdateValue(v: any) {
                    row.price = v
                }
            })
        }
    },
    {
        title: '操作', key: 'actions', width: '60px',
        render(row: any, index: number): any {
            return h(NA, {
                style: `color: red`,
                onClick: async () => {
                    let form: any = props.form
                    form.plan_periods.splice(index,1)
                }
            }, { default: () => '删除' })
        }
    }

])

let type_options:any = [
    {label: '普通套餐', value: 0},
    {label: '增值套餐', value: 1}
]

function handleSelect(selected: string) {
    let period: any = props.periods_options.find((e: any) => e.id === selected)
    let form: any = props.form
    if (!form.plan_periods) form.plan_periods = []
    form.plan_periods.push({ period_id: period.id ,period_name: period.name, period_rule: period.rule })
}

const ShowOrEdit = defineComponent({
    props: {
        value: [String, Number],
        onUpdateValue: [Function, Array]
    },
    setup(props: any) {
        const isEdit = ref(false)
        const inputRef: any = ref(null)
        const inputValue = ref(props.value)
        const value = ref(props.value)
        function handleOnClick() {
            isEdit.value = true
            nextTick(() => {
                inputRef.value.focus()
            })
        }
        function handleChange() {
            props.onUpdateValue(value.value)
            isEdit.value = false
        }
        function number(value:any, multiple:number) {
            let number = parseFloat(value)
            if (Number.isNaN(number)) {
                return ''
            } else {
                if(multiple < 1) {
                    return (number * multiple).toFixed(2)
                } else {
                    return (number * multiple) + ''
                }
            }
        }
        return () =>
            h(
                'div',
                {
                    style: 'min-height: 20px',
                    onClick: handleOnClick
                },
                isEdit.value
                    ? h(NInput, {
                        ref: inputRef,
                        value: inputValue.value,
                        onUpdateValue: (v) => {
                            inputValue.value =v
                            value.value = number(v, 100)
                        },
                        onChange: handleChange,
                        onBlur: handleChange
                    })
                    : number(props.value, 0.01)
            )
    }
})

</script>

<template>
    <n-form ref="ref_form" :model="form" label-placement="top" style="margin-top: 10px;" :rules="rules">
        <n-form-item label="名称" path="name">
            <n-input v-model:value="form['name']" placeholder="名称" clearable />
        </n-form-item>
        <n-form-item label="可用量" path="capacity">
            <n-input-number v-model:value="form['capacity']">
            </n-input-number>
            <!-- <n-input v-model:value="form['capacity']" placeholder="可用量" clearable /> -->
        </n-form-item>
        <n-form-item label="套餐类型" path="type">
            <n-select class="select" v-model:value="form['type']" :options="type_options" ></n-select>
        </n-form-item>
        <n-form-item label="套餐重置" path="renew" v-if="form['type'] === 0">
            <n-switch v-model:value="form['renew']" :checked-value="1" :unchecked-value="0"></n-switch>
        </n-form-item>
        <n-form-item label="描述" path="content">
            <ckeditor v-model:model-value="form['content']" :editor="ClassicEditor" style="width:100%"></ckeditor>
        </n-form-item>

        <n-form-item label="套餐可用" path="enable" >
            <n-switch v-model:value="form['enable']" :checked-value="1" :unchecked-value="0"></n-switch>
        </n-form-item>

        <n-form-item label="付款" path="plan_periods" class="plan-periods" >
            <n-dropdown :options="periods_options" label-field="name" key-field="id" placement="left"
                :on-select="handleSelect">
                <div class="periods-add">
                    <n-a type="error">添加</n-a>
                </div>
            </n-dropdown>
            <n-data-table :columns="columns" :data="form.plan_periods" :single-line="false" size="small">
                <template v-slot:empty>
                    <div></div>
                </template>
            </n-data-table>

        </n-form-item>

    </n-form>
</template>

<style lang="scss" scoped>
:deep(.ck-editor) {
    width: 100% !important;
}

.plan-periods {
    position: relative;

    :deep(.n-form-item-blank) {
        flex-direction: column;
    }

    .periods-add {
        position: absolute;
        right: 0;
        top: -26px;

        :deep(a) {
            color: #d03050;
        }
    }


    :deep(.n-input) {
        border: none;
        height: 20px;
        --n-border-hover: none !important;
        --n-caret-color: none !important;
        --n-border-focus: none !important;
        --n-box-shadow-focus: none !important;

        .n-input__border {
            border: none;
        }

        .n-input__state-border {
            border: none;
        }

        .n-input__input-el {
            height: 20px;
        }

        .n-input__placeholder {
            font-size: 12px;
        }

        .n-input-wrapper {
            padding: 0
        }
    }

    :deep(.n-data-table) {
        .n-data-table-tr:not(.n-data-table-tr--summary):hover {
            background-color: #fff;

            &>.n-data-table-td {
                background-color: #fff;
            }
        }
    }
}
</style>