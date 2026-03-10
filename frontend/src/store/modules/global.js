import { defineStore } from 'pinia'
import { ref } from 'vue'
import config from "@/config";

export const useGlobalStore = defineStore('global', () => {
	// state
	const ismobile = ref(false)
	const layout = ref(config.LAYOUT)
	const menuIsCollapse = ref(config.MENU_IS_COLLAPSE)
	const layoutTags = ref(config.LAYOUT_TAGS)
	const theme = ref(config.THEME)

	// actions (原 mutations)
	const SET_ismobile = (key) => {
		ismobile.value = key
	}

	const SET_layout = (key) => {
		layout.value = key
	}

	const SET_theme = (key) => {
		theme.value = key
	}

	const TOGGLE_menuIsCollapse = () => {
		menuIsCollapse.value = !menuIsCollapse.value
	}

	const TOGGLE_layoutTags = () => {
		layoutTags.value = !layoutTags.value
	}

	return {
		ismobile,
		layout,
		menuIsCollapse,
		layoutTags,
		theme,
		SET_ismobile,
		SET_layout,
		SET_theme,
		TOGGLE_menuIsCollapse,
		TOGGLE_layoutTags
	}
})
