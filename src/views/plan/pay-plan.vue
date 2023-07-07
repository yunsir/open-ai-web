<script setup lang="ts">
import { NButton, useMessage, NCard, useDialog } from 'naive-ui';
import { reactive, ref, onMounted } from 'vue';

import Service from '@/utils/Service';
import Drawer from '@/components/drawer';
import PlanForm from './plan-form.vue';
import ObjectUtil from '@/utils/ObjectUtil';
const message = useMessage()
const dialog = useDialog()
onMounted(() => {
    query()
})
let data: any = ref([])


async function query() {
    let resp: any = await Service.get('/pay-plans')
    if (!resp['return_code']) {
        data.value = resp
    }

}

let show_form = ref(false)
let form: any = reactive({})


async function handleSave() {
    let req: any = ObjectUtil.deepCopy(form)

    let plan_periods: any[] = req['plan_periods']
    if (plan_periods && plan_periods.length > 0) {
        plan_periods.forEach(period => parseFloat(period.price) * 100)
    }
    await Service.post(`/pay-plans`, req)
    message.success('保存成功')
    show_form.value = false
    query()
}

function handleReset() {
    let defalut_form = { plan_periods: [], content: '', type: 0, renew: 1 }
    let keys = Object.keys(defalut_form)
    if (keys) {
        Object.keys(form).forEach(key => delete form[key])
        keys.forEach(key => {
            form[key] = defalut_form[key]
        })
    }
}
async function handleClose(item: any) {
    dialog.warning({
        title: '警告',
        content: '确定删除当前任务数据吗？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
            await Service.delete(`pay-plans/${item.id}`)
            message.success("删除成功")
            query()
        },
    })
}
let periods_options: any = reactive([])
function handleAdd(item?: any) {
    handleReset()
    show_form.value = true
    Service.get('/pay-periods').then((data: any) => {
        periods_options.length = 0
        data.forEach((e: any) => delete data['id'])
        periods_options.push(...data)
    })
    if (item) {
        let keys = Object.keys(item)
        if (keys) {
            keys.forEach(key => {
                if (key === 'plan_periods') {
                    if (!form[key]) form[key] = []
                    form[key].push(...item[key])
                }
                else if (key === 'content') form[key] = item[key] || ''
                else form[key] = item[key]
            })
        }
    }
}

</script>

<template>
    <div class="container">
        <n-button type="primary" @click="handleAdd" style="margin-left: 14px;width: 60px;">添加</n-button>
        <div class="plan-list">

            <template v-for="item in data">
                <div class="card">
                    <n-card closable @close="handleClose(item)">
                        <template #header>
                            <h3 class="card-header">{{ item['name'] }}</h3>
                        </template>
                        <template #default>
                            <div @click="handleAdd(item)">
                                <div class="card-price" v-if="item?.plan_periods">
                                    <p class="card-price-main">¥ {{
                                        (parseFloat(item?.plan_periods[0]?.price) / 100).toFixed(2) }}</p>
                                    <p class="card-price-desc">{{ item?.plan_periods[0]?.period_name }}</p>
                                </div>
                                <div class="card-body" v-html="item['content']"></div>
                            </div>
                        </template>

                    </n-card>
                </div>
            </template>
        </div>
    </div>
    <Drawer v-model:show="show_form" width="40%" placement="right" title="套餐">
        <template #body>
            <plan-form :form="form" :periods_options="periods_options"> </plan-form>
        </template>

        <template #footer>
            <div style="display: flex; justify-content: flex-end">
                <n-button type="primary" style="width:80px" @click="handleSave">
                    保存
                </n-button>
                <n-button type="default" style="width:80px;margin-left: 10px;" @click="show_form = false">
                    取消
                </n-button>
            </div>
        </template>
    </drawer>
</template>

<style lang="scss" scoped></style>