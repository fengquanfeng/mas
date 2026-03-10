import { nextTick  } from 'vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from '@/router'
import { useViewTagsStore, useKeepAliveStore, useIframeStore } from '@/store'

export default {
	//刷新标签
	refresh() {
		NProgress.start()
		const route = router.currentRoute.value
		const keepAliveStore = useKeepAliveStore()
		keepAliveStore.removeKeepLive(route.name)
		keepAliveStore.setRouteShow(false)
		nextTick(() => {
			keepAliveStore.pushKeepLive(route.name)
			keepAliveStore.setRouteShow(true)
			NProgress.done()
		})
	},
	//关闭标签
	close(tag) {
		const route = tag || router.currentRoute.value
		const viewTagsStore = useViewTagsStore()
		const iframeStore = useIframeStore()
		const keepAliveStore = useKeepAliveStore()
		viewTagsStore.removeViewTags(route)
		iframeStore.removeIframeList(route)
		keepAliveStore.removeKeepLive(route.name)
		const tagList = viewTagsStore.viewTags
		const latestView = tagList.slice(-1)[0]
		if (latestView) {
			router.push(latestView)
		} else {
			router.push('/')
		}
	},
	//关闭标签后处理
	closeNext(next) {
		const route = router.currentRoute.value
		const viewTagsStore = useViewTagsStore()
		const iframeStore = useIframeStore()
		const keepAliveStore = useKeepAliveStore()
		viewTagsStore.removeViewTags(route)
		iframeStore.removeIframeList(route)
		keepAliveStore.removeKeepLive(route.name)
		if(next){
			const tagList = viewTagsStore.viewTags
			next(tagList)
		}
	},
	//关闭其他
	closeOther() {
		const route = router.currentRoute.value
		const viewTagsStore = useViewTagsStore()
		const tagList = [...viewTagsStore.viewTags]
		tagList.forEach(tag => {
			if(tag.meta&&tag.meta.affix || route.fullPath==tag.fullPath){
				return true
			}else{
				this.close(tag)
			}
		})
	},
	//设置标题
	setTitle(title){
		const viewTagsStore = useViewTagsStore()
		viewTagsStore.updateViewTagsTitle(title)
	}
}
