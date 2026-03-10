import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIframeStore = defineStore('iframe', () => {
	// state
	const iframeList = ref([])

	// actions (原 mutations)
	const setIframeList = (route) => {
		iframeList.value = []
		iframeList.value.push(route)
	}

	const pushIframeList = (route) => {
		let target = iframeList.value.find((item) => item.path === route.path)
		if(!target){
			iframeList.value.push(route)
		}
	}

	const removeIframeList = (route) => {
		iframeList.value.forEach((item, index) => {
			if (item.path === route.path){
				iframeList.value.splice(index, 1)
			}
		})
	}

	const refreshIframe = (route) => {
		iframeList.value.forEach((item) => {
			if (item.path == route.path){
				var url = route.meta.url;
				item.meta.url = '';
				setTimeout(function() {
					item.meta.url = url
				}, 200);
			}
		})
	}

	const clearIframeList = () => {
		iframeList.value = []
	}

	return {
		iframeList,
		setIframeList,
		pushIframeList,
		removeIframeList,
		refreshIframe,
		clearIframeList
	}
})
