<script setup lang="ts">
import {NForm,NFormItem, NInput,NButton, useMessage} from 'naive-ui';
import { ref } from 'vue';
import Service from '@/utils/Service';
let form_ref: any = ref()
let form: any = ref({})
let rules: any = []

const message = useMessage()

async function handleSave() {
    let error = await form_ref.value?.validate().catch((e: any) => Promise.resolve(e))
    if (error) return

    await Service.put(`/users/login/password`, {...form.value})
    message.success('操作成功')
    handleReset()
}


function handleReset() {
    form.value = {}
}
</script>

<template>
<div class="passwd container">

    <n-form ref="ref_form" :model="form" label-placement="top" style="margin-top: 10px; max-width: 400px;width: 100%;" :rules="rules">
        <n-form-item label="原密码" path="password">
            <n-input v-model:value="form['password']" placeholder="原密码" clearable type="password" show-password-on="click"/>
        </n-form-item>
        <n-form-item label="新密码" path="new_password">
            <n-input v-model:value="form['new_password']" placeholder="新密码" clearable type="password" show-password-on="click"/>
        </n-form-item>
        <n-form-item label="重复新密码" path="re_new_password">
            <n-input v-model:value="form['re_new_password']" placeholder="重复新密码" clearable type="password" show-password-on="click"/>
        </n-form-item>

        <n-button type="success" style="margin-right: 20px;" @click="handleSave">保存 </n-button>
        <n-button @click="handleReset">重置</n-button>
    </n-form>
</div>

</template>

<style lang="scss" scoped>
@media (max-width: 768px) {
    .passwd {
        align-items: center;
    }
}
</style>