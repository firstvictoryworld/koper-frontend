import { createApp } from 'vue'
import '@/scss/style.scss'
import VueAxios from 'vue-axios'
import axios, { axiosInjectKey } from '@/utils/axios'
import PerfectScrollbar from 'vue3-perfect-scrollbar'
// import VueApexCharts from 'vue3-apexcharts'
/* @ts-expect-error: no module exists
// import InstantSearch from 'vue-instantsearch/vue3/es' */
import VCalendar from 'v-calendar'
import vuetify from './plugins/vuetify'
import router from './router'
import App from './App.vue'
import store from '@/stores'
import i18n from '@/locales'
import { createHead } from "@vueuse/head"

const app = createApp(App)
const head = createHead()

app.use(PerfectScrollbar)
// app.use(InstantSearch)
app.use(i18n)
app.use(store)
app.use(VCalendar, {})
// app.use(VueApexCharts)
app.use(router)
app.use(vuetify)
app.use(VueAxios, axios)
app.use(head)

app.provide(axiosInjectKey, axios)

app.directive('outsideClick', {
	mounted: (el, bindings) => {
		document.addEventListener('click', (e) => {
			if (el && !el.contains(e.target)) {
				bindings.value();
			}
		});
	}
})

app.mount('#app')
