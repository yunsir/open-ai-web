import { Router } from 'vue-router';
import store from '@/store';
import ObjectUtil from '@/utils/ObjectUtil';


let white_list = ['/login', '/register']
export function createRouterGuard(router: Router) {
    router.beforeEach(async (to, from, next) => {
        if (to.query.token) {
            await store.dispatch('setToken', to.query.token)
        }
        let token = store.state.token
        document.title = `AI助手${to.meta.title ? '-' + to.meta.title : ''}`
        if (!token) {
            if (white_list.includes(to.path)) {
                next()
            } else {

                await store.dispatch('savePath', to.path)
                next({ path: '/login' })
            }
        } else {
            if (white_list.includes(to.path)) {
                //next({ path: '/', replace: true })
                next()
            } else {
                if (ObjectUtil.isEmpty(store.state.user_info)) { // 判断当前用户是否已拉取完user_info信息
                    try {
                        await store.dispatch('getUserInfo')


                        next({ path: to.path, replace: true })
                    } catch (error) {
                        console.log(error);

                        next()
                    }
                } else {
                    next()
                }
            }
        }
    })
}

