import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/index.vue';
import MobileLayout from '@/mobile/layout/index.vue';
const routes = [
    {
        path: '/login', name: 'login',
        meta: { title: '登录' }, component: () => import('@/views/login.vue')
    },
    {
        path: '/register', name: 'register',
        meta: { title: '注册' }, component: () => import('@/views/register.vue')
    },
    {
        path: '/', redirect: '/chat', component: Layout,
        children: [
            {
                path: '/index',
                name: 'index',
                meta: { title: '首页' },
                component: () => import('@/views/index.vue')
            }
        ]
    },

    {
        path: '/plans',
        name: 'plans',
        component: Layout,
        children: [
            {
                path: '/plans',
                name: 'pay-plan',
                component: () => import('@/views/plan/pay-plan.vue'),
                meta: { keep_alive: false, title: '套餐列表' }
            },
            {
                path: '/periods',
                name: 'pay-period',
                component: () => import('@/views/plan/pay-period.vue'),
                meta: { keep_alive: false, title: '周期设置' }
            },
        ]
    },
    {
        path: '/buy-plans',
        name: 'buy-plan-layout',
        component: Layout,
        children: [
            {
                path: '/buy-plans',
                name: 'buy-plans',
                component: () => import('@/views/plan/sale-plan.vue'),
                meta: { keep_alive: false, title: '购买套餐' }
            },
            {
                path: '/sale-plans/:id',
                name: 'buy-plan',
                component: () => import('@/views/plan/buy-sale-plan.vue'),
                meta: { keep_alive: false, title: '购买套餐' }
            }
        ]
    },

    {
        path: '/orders',
        name: 'order-layout',
        component: Layout,
        children: [
            {
                path: '/orders',
                name: 'orders',
                component: () => import('@/views/order/order.vue'),
                meta: { keep_alive: false, title: '订单列表' }
            },
            {
                path: '/orders/:order_no',
                name: 'order-detail',
                component: () => import('@/views/order/order-detail.vue'),
                meta: { keep_alive: false, title: '订单详情' }
            },
        ]
    },
    {
        path: '/user',
        name: 'user-layout',
        component: Layout,
        children: [
            {
                path: '/user/info',
                name: 'user-info',
                component: () => import('@/views/user/info.vue'),
                meta: {keep_alive: false, title: '个人信息'},
            },
            {
                path: '/user/passwd',
                name: 'user-passwd',
                component: () => import(`@/views/user/password.vue`),
                meta: {keep_alive: false, title: '修改密码'}
            },
            {
                path: '/users',
                name: 'users',
                component: ()=> import(`@/views/user/list.vue`),
                meta: {keep_alive: false, title: '用户管理'}
            }
        ]
    },
    {
        path: '/chat',
        name: 'chat-layout',
        component: Layout,
        children: [
            {
                path: '/chat',
                name: 'chat',
                component: () => import('@/views/chat/index.vue'),
                meta: {keep_alive: false, title: 'chat-gpt'}
            }
        ]
    },
    {
        path: '/settings',
        name: 'setting-layout',
        component: Layout,
        children: [
            {
                path: '/settings/platform-key',
                name: 'platform-key',
                component:  () => import('@/views/chat/platform-key.vue'),
                meta: {title: '平台key'}
            }
        ]
    },

    {
        path: '/mobile',
        name: 'mobile-layout',
        component: MobileLayout,
        children: [
            {
                path: '/mobile/chat',
                name: 'mobile-chat',
                component: () => import('@/views/chat/index.vue'),
                meta: {title: '聊天'}
            },
            {
                path: '/mobile/buy-plans',
                name: 'mobile-buy-plans',
                component: () => import('@/views/plan/sale-plan.vue'),
                meta: { keep_alive: false, title: '购买套餐' }
            },
            {
                path: '/mobile/sale-plans/:id',
                name: 'mobile-buy-plan',
                component: () => import('@/views/plan/buy-sale-plan.vue'),
                meta: { keep_alive: false, title: '购买套餐' }
            },
            {
                path: '/mobile/orders',
                name: 'mobile-orders',
                component: () => import('@/mobile/order/order.vue'),
                meta: { keep_alive: false, title: '订单列表' }
            },
            {
                path: '/mobile/orders/:order_no',
                name: 'mobile-order-detail',
                component: () => import('@/views/order/order-detail.vue'),
                meta: { keep_alive: false, title: '订单详情' }
            },
            {
                path: '/mobile/user/passwd',
                name: 'mobile-user-passwd',
                component: () => import(`@/views/user/password.vue`),
                meta: {keep_alive: false, title: '修改密码'}
            },
        ]
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})


export default router