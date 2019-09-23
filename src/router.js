import Home from './views/Home.vue'

Vue.use(VueRouter)

export default new VueRouter({
	base: window.location.pathname,
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home,
		}
	],
})
