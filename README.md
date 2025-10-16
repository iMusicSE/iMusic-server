# 后端node.js+express+ssms使用教程

## 1、在一个空文件夹下安装以下依赖

```bash
npm init -y
npm install express cors body-parser
npm install mssql
npm install multer
```

如果最后一步失败，可以尝试切换镜像源再安装，即

```bash
npm config set registry https://registry.npmmirror.com
npm install mssql
```

## 2、在你的ssms（Microsoft SQL Server Management Studio）里创建数据库

运行music.sql 

## 3、将js文件移入该文件夹

- db.js 数据库连接
- server.js 接口服务

## 4、修改db.js文件

 修改你的SQL账户和密码

## 5、运行

```bash
node server.js
```

开启代理，显示

```bash
🎵 Server running on http://localhost:3000
✅ 已成功连接到 SQL Server
```

即成功
