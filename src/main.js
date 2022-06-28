import '@/plugins/vue-composition-api'
import '@/styles/styles.scss'
import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store'
import http from './http'
import router from './router'
import config from './config'

Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  http,
  router,
  config,
  render: h => h(App),
}).$mount('#app')
