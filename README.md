# iMusic 后端服务 (Node.js + Express + MSSQL)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

如果安装失败，可切换镜像源：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 2. 配置数据库

修改 `db.js` 中的数据库连接配置：

```javascript
user: 'sa',           // 你的SQL用户名
password: '123',      // 你的密码
server: 'localhost'   // 你的服务器地址
```

### 3. 启动服务

```bash
node server.js
```

**✨ 首次启动会自动完成以下操作：**
- ✅ 检查并创建 `music_app` 数据库
- ✅ 检查并创建所需的 4 个数据表（users, favorites, history, DownloadedSongs）
- ✅ 创建 uploads 和 downloads 文件夹

成功启动后显示：
```
✅ 数据库连接完成，所有表已就绪
🎵 Server running on http://localhost:3000
```

## 功能特性

### 🎯 数据库自动初始化
- 无需手动创建数据库和表
- 智能检测，不会覆盖已有数据
- 缺失的表会自动补充

### 📦 项目结构
```
iMusic-server/
├── server.js           # 主服务器
├── db.js               # 数据库连接（含自动初始化）
├── music.sql           # SQL脚本（参考）
├── uploads/            # 头像上传目录
└── downloads/          # 歌曲下载目录
```

### 🔌 API 接口
- 用户注册/登录
- 收藏管理
- 播放历史
- 歌曲下载
- 头像上传

## 注意事项

- 确保 SQL Server 服务已启动
- 确保配置的用户有创建数据库权限
- 端口 3000 需未被占用

## 故障排查

如果遇到连接错误，请检查：
1. SQL Server 是否已启动
2. 用户名密码是否正确
3. 服务器地址是否正确
4. 是否有创建数据库的权限
