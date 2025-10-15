<template>
  <view class="container">
    <view class="title">欢迎登录</view>

    <view class="input-group">
      <input v-model="username" placeholder="请输入用户名" class="input-box" />
      <input v-model="password" placeholder="请输入密码" class="input-box" password />
    </view>

    <button class="main-btn" @click="login">登录</button>

    <view class="footer">
      <text>还没有账号？</text>
      <text class="link" @click="toRegister">去注册</text>
    </view>

    <!-- 新增：游客访问按钮 -->
    <button class="guest-btn" @click="guestVisit">游客访问</button>
  </view>
</template>

<script>
import store from '@/store/index.js' 
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async login() {
      if (!this.username || !this.password) {
        return uni.showToast({ title: '请输入完整信息', icon: 'none' });
      }

      const res = await uni.request({
        url: 'http://localhost:3000/login',
        method: 'POST',
        data: {
          username: this.username,
          password: this.password
        }
      });

      if (res.data.success) {
        const user = res.data.user;
        uni.showToast({ title: '登录成功', icon: 'success' });
        
		const [favRes, hisRes] = await Promise.all([
		      uni.request({ url: `http://localhost:3000/favorites/${user.id}`, method: 'GET' }),
		      uni.request({ url: `http://localhost:3000/history/${user.id}`, method: 'GET' })
		    ]);
		
		    const fullUser = {
		      ...user,
		      favorites: (favRes.data.data || []).map(item => item.musicId),  
		      history: (hisRes.data.data || []).map(item => item.musicId)     // 只保留 musicId
		    };
            store.commit('SET_USER_ID', user.id);
			store.commit('SET_FAVORITES', fullUser.favorites);
			store.commit('SET_HISTORY', fullUser.history);
		
		    uni.setStorageSync('currentUser', fullUser);

        // 跳转到 discover 页面（tabBar 页面）
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/discover/discover'
          });
        }, 800);
      } else {
        uni.showToast({ title: res.data.message, icon: 'none' });
      }
    },

    toRegister() {
      uni.navigateTo({ url: '/pages/register/register' });
    },

    // ✅ 新增：游客访问逻辑
    guestVisit() {
      const guestUser = {
        id: 0,
        username: '游客用户',
        avatar: '/static/logo.png',
        isGuest: true
      };

      uni.setStorageSync('currentUser', guestUser);
      uni.showToast({ title: '以游客身份进入', icon: 'none' });

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/discover/discover'
        });
      }, 800);
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 60rpx;
  background: linear-gradient(180deg, #f8f9fb, #e3e6eb);
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 60rpx;
}

.input-group {
  width: 100%;
  margin-bottom: 40rpx;
}

.input-box {
  width: 100%;
  padding: 24rpx 32rpx;
  margin-bottom: 20rpx;
  border-radius: 40rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.08);
  font-size: 30rpx;
  border: none;
}

.main-btn {
  width: 100%;
  padding: 28rpx;
  text-align: center;
  border-radius: 40rpx;
  background: linear-gradient(90deg, #4f8ef7, #6fa8ff);
  color: #fff;
  font-size: 32rpx;
  margin-top: 20rpx;
  box-shadow: 0 6rpx 10rpx rgba(0,0,0,0.1);
}

.footer {
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #666;
}

.link {
  color: #4f8ef7;
  margin-left: 10rpx;
}

/* ✅ 新增：游客访问按钮样式 */
.guest-btn {
  width: 100%;
  padding: 24rpx;
  text-align: center;
  border-radius: 40rpx;
  border: 2rpx solid #4f8ef7;
  background: transparent;
  color: #4f8ef7;
  font-size: 30rpx;
  margin-top: 40rpx;
  transition: all 0.2s;
}
.guest-btn:active {
  background: #4f8ef7;
  color: #fff;
}
</style>
