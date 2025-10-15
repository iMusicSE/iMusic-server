// 全局状态管理 - 音乐播放器状态
// #ifndef VUE3
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
// #endif

// #ifdef VUE3
import { createStore } from 'vuex'
// #endif

// #ifndef VUE3
const store = new Vuex.Store({
// #endif

// #ifdef VUE3
const store = createStore({
// #endif
	state: {
		userId: null, // 当前登录用户ID
		audioContext: null,
		currentSong: null,
		isPlaying: false,
		playlist: [],
		currentIndex: 0,
		playMode: 0,
		currentTime: 0,
		duration: 0,
		favorites: [],
		history: []
	},

	getters: {
		getCurrentSong: state => state.currentSong,
		getPlayState: state => state.isPlaying,
		getPlaylist: state => state.playlist,
		getFavorites: state => state.favorites,
		getHistory: state => state.history,
		isFavorite: state => songId => {
		    return state.favorites.some(song => Number(song.id) === Number(songId))
		}
	},

	mutations: {
		SET_AUDIO_CONTEXT(state, context) {
			state.audioContext = context
		},
		SET_CURRENT_SONG(state, song) {
			state.currentSong = song
		},
		SET_PLAY_STATE(state, isPlaying) {
			state.isPlaying = isPlaying
		},
		SET_PLAYLIST(state, playlist) {
			state.playlist = playlist
		},
		SET_CURRENT_INDEX(state, index) {
			state.currentIndex = index
		},
		SET_PLAY_MODE(state, mode) {
			state.playMode = mode
		},
		SET_CURRENT_TIME(state, time) {
			state.currentTime = time
		},
		SET_DURATION(state, duration) {
			state.duration = duration
		},
		SET_USER_ID(state, userId) {
			state.userId = userId
		},

		// 添加收藏
		ADD_FAVORITE(state, song) {
			if (!state.favorites.some(item => item.id === song.id)) {
				state.favorites.unshift(song)
				uni.setStorageSync('favorites', state.favorites)
			}
		},
		// 移除收藏
		REMOVE_FAVORITE(state, songId) {
			state.favorites = state.favorites.filter(song => song.id !== songId)
			uni.setStorageSync('favorites', state.favorites)
		},
		// 清空收藏
		CLEAR_FAVORITES(state) {
			state.favorites = []
			uni.removeStorageSync('favorites')
		},

		// 添加播放历史
		ADD_HISTORY(state, song) {
			state.history = state.history.filter(item => item.id !== song.id)
			state.history.unshift(song)
			if (state.history.length > 100) state.history = state.history.slice(0, 100)
			uni.setStorageSync('history', state.history)
		},
		// 清空播放历史
		CLEAR_HISTORY(state) {
			state.history = []
			uni.removeStorageSync('history')
		},

		LOAD_LOCAL_DATA(state) {
			const favorites = uni.getStorageSync('favorites')
			const history = uni.getStorageSync('history')
			if (favorites) state.favorites = favorites
			if (history) state.history = history
		},
		SET_FAVORITES(state, favorites) {
			state.favorites = favorites
		},
		REMOVE_FROM_PLAYLIST(state, index) {
			state.playlist.splice(index, 1)
			if (index < state.currentIndex) {
				state.currentIndex--
			} else if (index === state.currentIndex) {
				if (state.currentIndex >= state.playlist.length) {
					state.currentIndex = state.playlist.length - 1
				}
			}
		},
		CLEAR_PLAYLIST(state) {
			state.playlist = []
			state.currentIndex = 0
		},
		ADD_TO_PLAYLIST(state, song) {
			const exists = state.playlist.some(item => item.id === song.id)
			if (!exists) {
				state.playlist.push(song)
			}
		},
		INSERT_TO_PLAYLIST(state, song) {
			const existIndex = state.playlist.findIndex(item => item.id === song.id)
			if (existIndex >= 0) {
				state.playlist.splice(existIndex, 1)
				if (existIndex <= state.currentIndex) {
					state.currentIndex--
				}
			}
			const insertIndex = state.currentIndex + 1
			state.playlist.splice(insertIndex, 0, song)
		}
	},

	actions: {
		// ------------------ 🎵 播放控制 ------------------
		initAudioContext({ commit, state }) {
			if (!state.audioContext) {
				const audioContext = uni.createInnerAudioContext()
				commit('SET_AUDIO_CONTEXT', audioContext)
			}
		},

		playSong({ commit, state, dispatch }, { song, playlist }) {
			commit('SET_CURRENT_SONG', song)
			if (playlist && playlist.length > 0) {
				commit('SET_PLAYLIST', playlist)
				const index = playlist.findIndex(item => item.id === song.id)
				commit('SET_CURRENT_INDEX', index >= 0 ? index : 0)
			}

			commit('ADD_HISTORY', song)
			dispatch('syncHistory', song)

			if (state.audioContext) {
				state.audioContext.src = song.url
				state.audioContext.play()
				commit('SET_PLAY_STATE', true)
			}
		},

		togglePlay({ commit, state }) {
			if (state.audioContext) {
				if (state.isPlaying) {
					state.audioContext.pause()
					commit('SET_PLAY_STATE', false)
				} else {
					state.audioContext.play()
					commit('SET_PLAY_STATE', true)
				}
			}
		},

		playPrevious({ commit, state, dispatch }) {
			if (state.playlist.length === 0) return
			let newIndex = state.currentIndex - 1
			if (newIndex < 0) newIndex = state.playlist.length - 1
			commit('SET_CURRENT_INDEX', newIndex)
			dispatch('playSong', { song: state.playlist[newIndex] })
		},

		playNext({ commit, state, dispatch }) {
			if (state.playlist.length === 0) return
			let newIndex
			if (state.playMode === 2) {
				newIndex = Math.floor(Math.random() * state.playlist.length)
			} else {
				newIndex = state.currentIndex + 1
				if (newIndex >= state.playlist.length) newIndex = 0
			}
			commit('SET_CURRENT_INDEX', newIndex)
			dispatch('playSong', { song: state.playlist[newIndex] })
		},

		togglePlayMode({ commit, state }) {
			const newMode = (state.playMode + 1) % 3
			commit('SET_PLAY_MODE', newMode)
			const modeText = ['列表循环', '单曲循环', '随机播放']
			uni.showToast({ title: modeText[newMode], icon: 'none', duration: 1500 })
		},

		// ------------------ ❤️ 收藏功能 + 同步数据库 ------------------
		async syncFavorite({ state }, song) {
			if (!state.userId) return
			try {
				await uni.request({
					url: 'http://localhost:3000/favorites/add',
					method: 'POST',
					data: { userId: state.userId, musicId: song.id }
				})
			} catch (err) {
				console.error('同步收藏失败', err)
			}
		},

		async removeFavoriteDB({ state }, songId) {
			if (!state.userId) return
			try {
				await uni.request({
					url: 'http://localhost:3000/favorites/delete',
					method: 'POST',
					data: { userId: state.userId, musicId: songId }
				})
			} catch (err) {
				console.error('同步取消收藏失败', err)
			}
		},

		async clearFavorites({ commit, state }) {
			commit('CLEAR_FAVORITES')
			if (!state.userId) return
			try {
				await uni.request({
					url: 'http://localhost:3000/favorites/clear',
					method: 'POST',
					data: { userId: state.userId }
				})
				uni.showToast({ title: '已清空收藏', icon: 'success' })
			} catch (err) {
				console.error('清空收藏失败', err)
				uni.showToast({ title: '清空收藏失败', icon: 'none' })
			}
		},

		toggleFavorite({ commit, state, getters, dispatch }, song) {
			if (getters.isFavorite(song.id)) {
				commit('REMOVE_FAVORITE', song.id)
				dispatch('removeFavoriteDB', song.id)
				uni.showToast({ title: '已取消收藏', icon: 'none' })
			} else {
				commit('ADD_FAVORITE', song)
				dispatch('syncFavorite', song)
				uni.showToast({ title: '已添加到收藏', icon: 'success' })
			}
		},

		// ------------------ 🕒 播放历史 + 同步数据库 ------------------
		async syncHistory({ state }, song) {
			if (!state.userId) return
			try {
				await uni.request({
					url: 'http://localhost:3000/history/add',
					method: 'POST',
					data: { userId: state.userId, musicId: song.id }
				})
			} catch (err) {
				console.error('同步历史失败', err)
			}
		},

		async clearHistory({ commit, state }) {
			commit('CLEAR_HISTORY')
			if (!state.userId) return
			try {
				await uni.request({
					url: 'http://localhost:3000/history/clear',
					method: 'POST',
					data: { userId: state.userId }
				})
				uni.showToast({ title: '已清空播放历史', icon: 'success' })
			} catch (err) {
				console.error('清空历史失败', err)
				uni.showToast({ title: '清空历史失败', icon: 'none' })
			}
		},

		// ------------------ ⚙️ 其他 ------------------
		loadLocalData({ commit }) {
			commit('LOAD_LOCAL_DATA')
		},

		removeFromPlaylist({ commit, state, dispatch }, index) {
			if (index < 0 || index >= state.playlist.length) return
			const isCurrentSong = index === state.currentIndex
			commit('REMOVE_FROM_PLAYLIST', index)
			if (isCurrentSong && state.playlist.length > 0) {
				dispatch('playSong', { song: state.playlist[state.currentIndex] })
			} else if (state.playlist.length === 0) {
				commit('SET_CURRENT_SONG', null)
				commit('SET_PLAY_STATE', false)
				if (state.audioContext) state.audioContext.stop()
			}
			uni.showToast({ title: '已从播放列表移除', icon: 'none' })
		},

		clearPlaylist({ commit, state }) {
			commit('CLEAR_PLAYLIST')
			commit('SET_CURRENT_SONG', null)
			commit('SET_PLAY_STATE', false)
			if (state.audioContext) state.audioContext.stop()
			uni.showToast({ title: '已清空播放列表', icon: 'success' })
		},

		addToPlaylist({ commit }, song) {
			commit('ADD_TO_PLAYLIST', song)
			uni.showToast({ title: '已添加到播放列表', icon: 'success' })
		},

		insertToPlaylist({ commit, state }, song) {
			if (state.playlist.length === 0) {
				commit('SET_PLAYLIST', [song])
				commit('SET_CURRENT_INDEX', 0)
				commit('SET_CURRENT_SONG', song)
			} else {
				commit('INSERT_TO_PLAYLIST', song)
			}
			uni.showToast({ title: '将在下一首播放', icon: 'success' })
		}
	}
})

export default store
