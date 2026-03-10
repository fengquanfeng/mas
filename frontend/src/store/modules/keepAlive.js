import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useKeepAliveStore = defineStore('keepAlive', () => {
	// state
	const keepLiveRoute = ref([])
	const routeKey = ref(null)
	const routeShow = ref(true)

	// actions (原 mutations)
	const pushKeepLive = (component) => {
		if(!keepLiveRoute.value.includes(component)){
			keepLiveRoute.value.push(component)
		}
	}

	const removeKeepLive = (component) => {
		var index = keepLiveRoute.value.indexOf(component);
		if(index !== -1){
			keepLiveRoute.value.splice(index, 1);
		}
	}

	const clearKeepLive = () => {
		keepLiveRoute.value = []
	}

	const setRouteKey = (key) => {
		routeKey.value = key
	}

	const setRouteShow = (key) => {
		routeShow.value = key
	}

	return {
		keepLiveRoute,
		routeKey,
		routeShow,
		pushKeepLive,
		removeKeepLive,
		clearKeepLive,
		setRouteKey,
		setRouteShow
	}
})
