<script setup lang="ts">
import { NLayout, NForm, NFormItem, FormRules, NInput, NButton } from 'naive-ui';
import Service from '@/utils/Service';
import { reactive, ref } from 'vue';
import store from '@/store';
import { useRouter, useRoute } from 'vue-router';
let router = useRouter()
let route = useRoute()
let form_ref = ref()
let form = reactive({
    grant_type: 'password',
    account_no: '',
    password: ''
})
let rules: FormRules = {
    account_no: [{ type: 'string', required: true, message: '请输入账号', trigger: ['change', 'blur'] }],
    password: [{ type: 'string', required: true, message: '请输入密码', trigger: ['change', 'blur'] }]
}
let error_msg = ref('')
async function login() {

    error_msg.value = ''
    let error = await form_ref.value?.validate().catch((e: any) => Promise.resolve(e))
    if (error) return
    let data: any = await Service.post('/authorizes/token', form)

    if (data.return_code && data.return_code != 'success') {
        error_msg.value = data['return_msg']
    } else {
        await store.dispatch('setToken', data.token)

        const target = window.parent;
        if (target) {
            target.postMessage(data.token, '*')
        }

        let redirect_url = store.state.redirect_url

        if (redirect_url) {
            await store.dispatch('savePath', '')
            router.push({ path: redirect_url, replace: true })
        } else {
            if (isMobile()) {
                router.push({ path: '/mobile/chat', replace: true })
            } else {

                router.push({ path: '/', replace: true })
            }
        }

    }
}
function isMobile() {
    let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)

    return flag;
}

function handleClick() {
    router.replace('/register')
}

</script>

<template>
    <n-layout position="absolute">
        <div class="login">
            <div class="login-title"></div>
            <n-form ref="form_ref" :model="form" :rules="rules" style="width: 100%;">
                <n-form-item path="account_no" label-placement="left">
                    <n-input v-model:value="form.account_no" placeholder="账号" @input="error_msg = ''"
                        @keyup.enter.native="login" size="large">
                        <template #prefix>
                            <icon name="zhanghao" />
                        </template>
                    </n-input>
                </n-form-item>
                <n-form-item path="password" label-placement="left">
                    <n-input v-model:value="form.password" type="password" show-password-on="click" @input="error_msg = ''"
                        placeholder="密码" @keyup.enter.native="login">
                        <template #prefix>
                            <icon name="mima" />
                        </template>
                    </n-input>
                </n-form-item>


                <n-button type="primary" @click="login" @keyup.enter.native="login"
                    style="width: 100%;font-size: 16px;">登&nbsp;&nbsp;录</n-button>
                <div class="error">
                    {{ error_msg }}
                </div>
            </n-form>

            <div class="login-bottom">

                <div class=""></div>
                <div class="register" @click="handleClick">
                    去注册
                </div>
            </div>
        </div>
    </n-layout>
</template>

<style lang="scss" scoped>
.login {
    display: flex;
    justify-content: center;

    padding: 40px 40px;
    border: 1px solid #eee;
    margin: 200px auto;
    width: 300px;
    flex-direction: column;

    .error {
        color: red;
        margin-top: 10px;
    }

    :deep(.n-input) {
        --n-font-size: 16px !important;
        font-size: 16px !important;
        --n-height: 44px !important;
    }

    :deep(.n-button) {
        --n-height: 44px !important;
    }

    &-bottom {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        cursor: pointer;
        color: #999;

        .register {
            color: #999;
        }
    }
}

.n-layout {
    height: 100%;

    ::v-deep(.n-layout-scroll-container) {
        display: flex;
        flex-direction: column;
    }
}</style>