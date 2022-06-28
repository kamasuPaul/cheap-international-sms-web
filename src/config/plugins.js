/* eslint-disable import/extensions */
import Vue from 'vue'
import auth from '@websanova/vue-auth/src/v2.js'
import driverAuthBearer from '@websanova/vue-auth/src/drivers/auth/bearer.js'
import driverHttpAxios from '@websanova/vue-auth/src/drivers/http/axios.1.x.js'
import driverRouterVueRouter from '@websanova/vue-auth/src/drivers/router/vue-router.2.x.js'

const drivers = {
  auth: driverAuthBearer,
  http: driverHttpAxios,
  router: driverRouterVueRouter,
}
Vue.use(drivers)

// const authOptions = {
//   authRedirect:'/',
//   auth: require('@websanova/vue-auth/drivers/auth/bearer.js'),
//   http: require('@websanova/vue-auth/drivers/http/vue-resource.1.x.js'),
//   router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
//   token: [{request: 'token', response: 'token', authType: 'bearer', foundIn: 'header'}],
//   tokenName:'token',
//   loginData: {url: 'api/auth', method: 'POST', redirect: 'dashboard'},
//   logoutData: {url: 'api/logout', method: 'POST', redirect: 'login',  makeRequest: false},
//   fetchData: {url: 'api/account', method: 'GET' , authType: 'bearer'},
//   refreshData: {enabled: false},
//   rolesVar: 'role_id'
// };
Vue.use(auth, {
  plugins: {
    http: Vue.axios,
    router: Vue.router,
  },
  drivers: {
    auth: driverAuthBearer,
    http: driverHttpAxios,
    router: driverRouterVueRouter,
  },
  options: {
    notFoundRedirect: { name: 'dashboard' },
    tokenDefaultKey: 'token',
    tokenName: 'token',
    fetchData: { url: 'me', method: 'GET', authType: 'bearer' },
    refreshData: { enabled: false },
  },

})
