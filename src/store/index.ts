import { createStore } from 'vuex'
import { storage } from '@/utils/Storage'
import router from '@/router';
import Service from '@/utils/Service';
const store = createStore({
    state: {
        token: storage.get('token'),
        user_info: storage.get('user_info') ,
        redirect_url: storage.get('redirect_url')
    },
    mutations: {
        setToken(state, val) {
            state.token = val
            storage.set('token', val)
        },
        delToken(state) {
            state.token = ''
            state.user_info = ''
            storage.remove('token')
            storage.remove('user_info')
        },
        setUserInfo: (state, sysUser) => {
            state.user_info = sysUser
            storage.set('user_info', sysUser)
        },
        savePath(state,path)  {
            state.redirect_url = path
            storage.set('redirect_url', path)
        }
    },
    actions: {
        async setToken(context, payload) {
            context.commit('setToken', payload)
        },
        async getUserInfo(context) {
            let user = await Service.get(`/users/login/user_info`)
            context.commit('setUserInfo', user)
        },
        async logout(context, is_req = true) {
            try {
                if (is_req) {
                    await Service.post('/authorizes/logout')
                }
            } catch (error) {
                console.log(error);
            } finally {
                context.commit('delToken')
                router.push('/login')
            }
        },
        async savePath(context, payload) {
            context.commit('savePath', payload)
        }

    }
})

export default store