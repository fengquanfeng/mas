<!--
 * @Descripttion: 处理iframe持久化，涉及store(VUEX)
 * @version: 1.0
 * @Author: sakuya
 * @Date: 2021年6月30日13:20:41
 * @LastEditors:
 * @LastEditTime:
-->

<template>
	<div v-show="$route.meta.type=='iframe'" class="iframe-pages">
		<iframe v-for="item in iframeList" :key="item.meta.url" v-show="$route.meta.url==item.meta.url" :src="item.meta.url" frameborder='0'></iframe>
	</div>
</template>

<script>
	import { useIframeStore, useGlobalStore } from '@/store'
	import { mapState, mapActions } from 'pinia'

	export default {
		data() {
			return {

			}
		},
		watch: {
			$route(e) {
				this.push(e)
			},
		},
		created() {
			this.push(this.$route);
		},
		computed:{
			...mapState(useIframeStore, ['iframeList']),
			...mapState(useGlobalStore, ['ismobile', 'layoutTags'])
		},
		mounted() {

		},
		methods: {
			...mapActions(useIframeStore, ['setIframeList', 'pushIframeList', 'clearIframeList']),
			push(route){
				if(route.meta.type == 'iframe'){
					if(this.ismobile || !this.layoutTags){
						this.setIframeList(route)
					}else{
						this.pushIframeList(route)
					}
				}else{
					if(this.ismobile || !this.layoutTags){
						this.clearIframeList()
					}
				}
			}
		}
	}
</script>

<style scoped>
	.iframe-pages {width:100%;height:100%;background: #fff;}
	iframe {border:0;width:100%;height:100%;display: block;}
</style>
