import VueModule from 'vue'
import excel from 'vue-excel-export'
import router from './router'
import store from './store'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

VueModule.config.productionTip = false
Vue.use(excel)
new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')
