<template>
  <view class="settings-container">
    <view class="settings-card">
      <text class="title">账户设置</text>

      <!-- 头像 -->
      <view class="item avatar-item" @click="changeAvatar">
        <text class="label">头像</text>
        <image :src="user.avatar || '/static/logo.png'" class="avatar"></image>
      </view>

      <!-- 用户名 -->
      <view class="item">
        <text class="label">用户名</text>
        <input v-model="user.username" placeholder="请输入用户名" class="input" />
      </view>

      <!-- 旧密码 -->
      <view class="item">
        <text class="label">旧密码</text>
        <input v-model="oldPassword" type="password" placeholder="请输入旧密码" class="input" />
      </view>

      <!-- 新密码 -->
      <view class="item">
        <text class="label">新密码</text>
        <input v-model="newPassword" type="password" placeholder="请输入新密码" class="input" />
      </view>

      <button class="save-btn" @click="saveSettings">保存修改</button>

      <!-- 退出登录 -->
      <button class="logout-btn" @click="logout">退出当前账户</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: {},
      oldPassword: '',
      newPassword: ''
    }
  },
  onShow() {
    const userInfo = uni.getStorageSync('currentUser')
    if (userInfo) this.user = { ...userInfo }
  },
  methods: {
    // 修改头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          uni.uploadFile({
            url: 'http://localhost:3000/uploadAvatar',
            filePath: filePath,
            name: 'avatar',
            formData: {
              id: this.user.id
            },
            success: (uploadRes) => {
              const data = JSON.parse(uploadRes.data);
              if (data.success) {
                this.user.avatar = data.avatarUrl;
                uni.setStorageSync('currentUser', this.user);
                uni.showToast({ title: '头像更新成功' });
              } else {
                uni.showToast({ title: data.message, icon: 'none' });
              }
            },
            fail: (err) => {
              console.error(err);
              uni.showToast({ title: '上传失败', icon: 'none' });
            }
          });
        }
      });
    },

    // 保存修改
    saveSettings() {
      if (!this.user.username) {
        return uni.showToast({ title: '用户名不能为空', icon: 'none' })
      }
      if (this.newPassword && !this.oldPassword) {
        return uni.showToast({ title: '请输入旧密码', icon: 'none' })
      }

      if (this.newPassword) {
        uni.request({
          url: 'http://localhost:3000/login',
          method: 'POST',
          data: {
            username: this.user.username,
            password: this.oldPassword
          },
          success: (res) => {
            if (res.data.success) {
              this.updateUser()
            } else {
              uni.showToast({ title: '旧密码错误', icon: 'none' })
            }
          },
          fail: () => {
            uni.showToast({ title: '验证失败，请稍后再试', icon: 'none' })
          }
        })
      } else {
        this.updateUser()
      }
    },

    // 更新用户信息
    updateUser() {
      uni.request({
        url: 'http://localhost:3000/updateUser',
        method: 'POST',
        data: {
          id: this.user.id,
          username: this.user.username,
          avatar: this.user.avatar,
          password: this.newPassword || ''
        },
        success: (res) => {
          if (res.data.success) {
            uni.setStorageSync('currentUser', this.user)
            uni.showToast({ title: '更新成功' })
            this.oldPassword = ''
            this.newPassword = ''
          } else {
            uni.showToast({ title: res.data.message, icon: 'none' })
          }
        },
        fail: (err) => {
          console.error(err)
          uni.showToast({ title: '保存失败', icon: 'none' })
        }
      })
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出当前账户吗？',
        success: (res) => {
          if (res.confirm) {
            // ✅ 清除用户与缓存数据
            uni.removeStorageSync('currentUser');
            uni.removeStorageSync('favorites');
            uni.removeStorageSync('history');
    
            // ✅ 清空 Vuex 状态
            const store = this.$store;
            store.commit('CLEAR_FAVORITES');
            store.commit('CLEAR_HISTORY');
            store.commit('SET_USER_ID', null);
    
            // ✅ 跳转登录页
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.settings-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
}

.settings-card {
  width: 85%;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
  padding: 50rpx 40rpx;
}

.title {
  text-align: center;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid #eee;
  padding-bottom: 20rpx;
}

.avatar-item {
  justify-content: space-between;
}

.label {
  font-size: 30rpx;
  color: #555;
}

.input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  border: none;
  outline: none;
  color: #333;
  padding: 10rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
}

.save-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #42b983, #2e8b57);
  color: #fff;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  text-align: center;
  line-height: 80rpx;
  margin-top: 50rpx;
  box-shadow: 0 6rpx 10rpx rgba(66, 185, 131, 0.3);
  transition: all 0.2s;
}
.save-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* 新增退出按钮样式 */
.logout-btn {
  width: 100%;
  height: 80rpx;
  margin-top: 30rpx;
  background: linear-gradient(135deg, #ff5f6d, #ffc371);
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  text-align: center;
  line-height: 80rpx;
  box-shadow: 0 6rpx 10rpx rgba(255, 95, 109, 0.3);
  transition: all 0.2s;
}
.logout-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}
</style>
