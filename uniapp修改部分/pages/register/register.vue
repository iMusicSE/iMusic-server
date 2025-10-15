<template>
  <view class="container">
    <view class="title">注册账号</view>

    <view class="input-group">
      <input v-model="username" placeholder="请输入用户名" class="input-box" />
      <input v-model="password" placeholder="请输入密码" class="input-box" password />
      <input v-model="confirmPassword" placeholder="请确认密码" class="input-box" password />
    </view>

    <button class="main-btn" @click="register">立即注册</button>
    <view class="footer">
      <text>已有账号？</text>
      <text class="link" @click="goLogin">去登录</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    async register() {
      if (!this.username || !this.password || !this.confirmPassword) {
        return uni.showToast({ title: '请输入完整信息', icon: 'none' });
      }

      if (this.password !== this.confirmPassword) {
        return uni.showToast({ title: '两次密码不一致', icon: 'none' });
      }

      const res = await uni.request({
        url: 'http://localhost:3000/register',
        method: 'POST',
        data: {
          username: this.username,
          password: this.password
        }
      });

      if (res.data.success) {
        uni.showToast({ title: '注册成功', icon: 'success' });
        uni.navigateTo({ url: '/pages/login/login' });
      } else {
        uni.showToast({ title: res.data.message, icon: 'none' });
      }
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' });
    }
  }
};
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
</style>
