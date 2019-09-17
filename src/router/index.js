import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/pages/Login'
import Requests from '@/components/pages/Requests'
import Ads from '@/components/pages/Ads'
import CategoriesLink from '@/components/pages/CategoriesLink'
import Countries from '@/components/pages/Countries'
import Others from '@/components/pages/Others'
import RenamingCategories from '@/components/pages/RenamingCategories'
import CommericalRequests from '@/components/pages/CommericalRequests'
import CommericalCategories from '@/components/pages/CommericalCategories'
import CommericalSettings from '@/components/pages/CommericalSettings'
import SpecialProductsOrders from '@/components/pages/SpecialProductsOrders'
import Packages from '@/components/pages/Packages'
import Users from '@/components/pages/Users'
import baseURL from '@/components/config/baseurl'

function loadView(view) {
  return () => import(`@/views/${view}.vue`)
}

import axios from 'axios';

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/dashboard',
      redirect: '/dashboard/requests',
      secure: true
    },
    {
      path: '/dashboard/requests',
      name: 'Requests',
      component: Requests,
      secure: true
    },
    {
      path: '/dashboard/ads',
      name: 'Ads',
      component: Ads,
      secure: true
    },
    {
      path: '/dashboard/special-products-order',
      name: 'SpecialProductsOrders',
      component: SpecialProductsOrders,
      secure: true
    },
    {
      path: '/dashboard/packages',
      name: 'Packages',
      component: Packages,
      secure: true
    },
    {
      path: '/dashboard/categories/link',
      name: 'CategoriesLink',
      component: CategoriesLink,
      secure: true
    },
    {
      path: '/dashboard/categories/names',
      name: 'RenamingCategories',
      component: RenamingCategories,
      secure: true
    },
    {
      path: '/dashboard/commerical/requests',
      name: 'CommericalRequests',
      component: CommericalRequests,
      secure: true
    },
    {
      path: '/dashboard/commerical/categories',
      name: 'CommericalCategories',
      component: CommericalCategories,
      secure: true
    },
    {
      path: '/dashboard/commerical/settings',
      name: 'CommericalSettings',
      component: CommericalSettings,
      secure: true
    },
    {
      path: '/dashboard/users',
      name: 'Users',
      component: Users,
      secure: true
    },
    {
      path: '/dashboard/countries',
      name: 'Countries',
      component: Countries,
      secure: true
    },
    {
      path: '/dashboard/others',
      name: 'Others',
      component: Others,
      secure: true
    },
  ]
})


router.beforeEach((to, from, next) => {
  router.options.routes.forEach((route) => {
    // If this is the current route and it's secure
    if (to.matched[0].path === route.path && route.secure) {
      axios.get(baseURL + 'api/admin/check')
      .catch((e) => {
        if(e.response.data == 'unauthenticated'){
          Vue.ls.set('token', null)
          return next('/login');
        }
      })
    }
  });
  next()
})

export default router;