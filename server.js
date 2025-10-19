const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { sql, connectDB } = require('./db');
const app = express();

// 最宽松的CORS配置 - 允许所有来源访问（开发/测试环境使用）
app.use(cors({
  origin: true, // 允许所有来源（动态返回请求的origin）
  credentials: true, // 允许携带凭证（cookies, authorization headers等）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'], // 允许所有常用HTTP方法
  allowedHeaders: '*', // 允许所有请求头
  exposedHeaders: '*', // 暴露所有响应头给前端
  maxAge: 86400, // 预检请求缓存时间（24小时）
  optionsSuccessStatus: 200 // 兼容旧浏览器
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB(); // 初始化数据库连接

const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📁 已自动创建 uploads 文件夹');
}


// 注册接口
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 检查是否已存在用户
    const check = await sql.query`SELECT * FROM users WHERE username = ${username}`;
    if (check.recordset.length > 0) {
      return res.json({ success: false, message: '用户名已存在' });
    }

    // 插入新用户
    await sql.query`INSERT INTO users (username, password) VALUES (${username}, ${password})`;
    res.json({ success: true, message: '注册成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

// 登录接口
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await sql.query`
      SELECT * FROM users WHERE username = ${username} AND password = ${password}
    `;
    if (result.recordset.length > 0) {
      res.json({ success: true, message: '登录成功', user: result.recordset[0] });
    } else {
      res.json({ success: false, message: '用户名或密码错误' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '数据库错误' });
  }
});

//上传头像
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 上传头像并更新数据库
app.post('/uploadAvatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.json({ success: false, message: '未选择图片' });

  const { id } = req.body;
  const avatarUrl = `http://localhost:3000/uploads/${req.file.filename}`;

  try {
    await connectDB();
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('avatar', sql.NVarChar, avatarUrl);
    await request.query('UPDATE users SET avatar=@avatar WHERE id=@id');

    res.json({ success: true, avatarUrl, message: '头像更新成功' });
  } catch (err) {
    console.error('❌ 头像上传失败：', err);
    res.json({ success: false, message: '头像更新失败' });
  }
});



///更新用户信息接口
app.post('/updateUser', async (req, res) => {
  const { id, username, avatar, password } = req.body;
  try {
    // 使用 connectDB 建立连接（已经全局配置了）
    await connectDB();

    let sqlText = 'UPDATE users SET username = @username, avatar = @avatar';
    if (password) sqlText += ', password = @password';
    sqlText += ' WHERE id = @id';

    //  用 sql.request() 创建请求
    const request = new sql.Request();
    request.input('username', sql.NVarChar, username);
    request.input('avatar', sql.NVarChar, avatar);
    if (password) request.input('password', sql.NVarChar, password);
    request.input('id', sql.Int, id);

    await request.query(sqlText);

    res.json({ success: true, message: '更新成功' });
  } catch (err) {
    console.error('❌ 更新失败：', err);
    res.json({ success: false, message: '更新失败' });
  }
});



// 获取用户收藏
app.get('/favorites/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await sql.query`SELECT musicId, createdAt FROM favorites WHERE userId = ${userId} ORDER BY createdAt DESC`;
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('❌ 获取收藏失败：', err);
    res.status(500).json({ success: false, message: '获取收藏失败' });
  }
});

// 新增收藏
app.post('/favorites/add', async (req, res) => {
  const { userId, musicId } = req.body;
  console.log('🎵 [DEBUG] 收藏接口被调用');
  console.log('  ├─ 请求体:', req.body);
  console.log('  ├─ userId:', userId, '类型:', typeof userId);
  console.log('  └─ musicId:', musicId, '类型:', typeof musicId);
  
  try {
    console.log('  ├─ 准备插入数据库...');
    await sql.query`
      INSERT INTO favorites (userId, musicId)
      VALUES (${userId}, ${musicId})
    `;
    console.log('  └─ ✅ 数据库插入成功');
    res.json({ success: true, message: '收藏成功' });
  } catch (err) {
    console.error('  └─ ❌ 收藏失败：', err);
    console.error('      详细错误:', err.message);
    res.status(500).json({ success: false, message: '收藏失败' });
  }
});

// 删除收藏
app.post('/favorites/delete', async (req, res) => {
  const { userId, musicId } = req.body;
  console.log('🗑️  [DEBUG] 删除收藏接口被调用');
  console.log('  ├─ 请求体:', req.body);
  console.log('  ├─ userId:', userId, '类型:', typeof userId);
  console.log('  └─ musicId:', musicId, '类型:', typeof musicId);
  
  try {
    console.log('  ├─ 准备从数据库删除...');
    await sql.query`
      DELETE FROM favorites WHERE userId = ${userId} AND musicId = ${musicId}
    `;
    console.log('  └─ ✅ 数据库删除成功');
    res.json({ success: true, message: '已取消收藏' });
  } catch (err) {
    console.error('  └─ ❌ 删除收藏失败：', err);
    console.error('      详细错误:', err.message);
    res.status(500).json({ success: false, message: '删除收藏失败' });
  }
});

// 获取播放历史
app.get('/history/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await sql.query`SELECT musicId, playedAt FROM history WHERE userId = ${userId} ORDER BY playedAt DESC`;
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('❌ 获取历史失败：', err);
    res.status(500).json({ success: false, message: '获取历史失败' });
  }
});

// 新增播放历史（自动去重）
app.post('/history/add', async (req, res) => {
  const { userId, musicId } = req.body;
  console.log('🕒 [DEBUG] 播放历史接口被调用');
  console.log('  ├─ 请求体:', req.body);
  console.log('  ├─ userId:', userId, '类型:', typeof userId);
  console.log('  └─ musicId:', musicId, '类型:', typeof musicId);
  
  try {
    // 删除旧记录
    console.log('  ├─ 准备删除旧记录...');
    await sql.query`
      DELETE FROM history WHERE userId = ${userId} AND musicId = ${musicId}
    `;
    console.log('  ├─ 旧记录删除完成');
    
    // 插入新记录
    console.log('  ├─ 准备插入新记录...');
    await sql.query`
      INSERT INTO history (userId, musicId)
      VALUES (${userId}, ${musicId})
    `;
    console.log('  └─ ✅ 播放历史插入成功');
    res.json({ success: true, message: '历史已更新' });
  } catch (err) {
    console.error('  └─ ❌ 添加历史失败：', err);
    console.error('      详细错误:', err.message);
    res.status(500).json({ success: false, message: '添加历史失败' });
  }
});

// 清空收藏记录
app.post('/favorites/clear', async (req, res) => {
  const { userId } = req.body;
  try {
    await sql.query`DELETE FROM favorites WHERE userId = ${userId}`;
    res.json({ success: true, message: '已清空收藏记录' });
  } catch (err) {
    console.error('❌ 清空收藏失败：', err);
    res.status(500).json({ success: false, message: '清空收藏失败' });
  }
});

// 清空播放历史
app.post('/history/clear', async (req, res) => {
  const { userId } = req.body;
  try {
    await sql.query`DELETE FROM history WHERE userId = ${userId}`;
    res.json({ success: true, message: '已清空播放历史' });
  } catch (err) {
    console.error('❌ 清空播放历史失败：', err);
    res.status(500).json({ success: false, message: '清空播放历史失败' });
  }
});

//下载模块
const axios = require('axios');

// 创建 downloads 文件夹
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
  console.log('📁 已自动创建 downloads 文件夹');
}

app.post('/downloads/add', async (req, res) => {
  const { userId, musicId, songName, artist, album, coverUrl, fileUrl, lyricsUrl } = req.body;

  if (!fileUrl || !musicId) {
    return res.status(400).json({ success: false, message: '缺少 fileUrl 或 musicId' });
  }

  try {
    // 下载歌曲
    const response = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
    const safeName = `${songName}_${musicId}`.replace(/[\\/:*?"<>| ]/g, '_');
    const audioPath = path.join(downloadsDir, `${safeName}.mp3`);
    const writer = fs.createWriteStream(audioPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
    const localPath = `http://localhost:3000/downloads/files/${safeName}.mp3`;

    // 下载歌词
    let lyricsPath = null;
    let lyricsStatus = 0;
    if (req.body.lyricsText) {
      try {
        const lrcPath = path.join(downloadsDir, `${safeName}.lrc`);
        fs.writeFileSync(lrcPath, req.body.lyricsText, 'utf-8');
        lyricsPath = `http://localhost:3000/downloads/files/${safeName}.lrc`;
        lyricsStatus = 1;
      } catch (err) {
        console.warn('⚠️ 歌词生成失败', err.message);
      }
    }

    // 写入数据库
    await sql.query`
      INSERT INTO DownloadedSongs 
        (userId, musicId, songName, artist, album, coverUrl, localPath, status, lyricsPath, lyricsStatus)
      VALUES
        (${userId}, ${musicId}, ${songName}, ${artist}, ${album}, ${coverUrl}, ${localPath}, 1, ${lyricsPath}, ${lyricsStatus})
    `;

    res.json({ success: true, message: '下载完成', path: localPath, lyricsPath });

  } catch (err) {
    console.error('❌ 下载失败：', err);
    res.status(500).json({ success: false, message: '下载失败', error: err.message });
  }
});


//获取用户下载列表
app.get('/downloads/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await sql.query`
      SELECT * FROM DownloadedSongs WHERE userId = ${userId} ORDER BY downloadTime DESC
    `;
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('❌ 获取下载列表失败：', err);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});


// 删除下载记录（同时删除本地文件）
app.post('/downloads/delete', async (req, res) => {
  const { downloadId } = req.body;
  if (!downloadId) {
    return res.status(400).json({ success: false, message: '缺少 downloadId' });
  }

  try {
    const result = await sql.query`
      SELECT localPath FROM DownloadedSongs WHERE downloadId = ${downloadId}
    `;
    if (result.recordset.length === 0) {
      return res.json({ success: false, message: '记录不存在' });
    }

    // 删除本地文件
    const localUrl = result.recordset[0].localPath;
    const fileName = localUrl.split('/downloads/files/')[1];
    const filePath = path.join(downloadsDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ 已删除文件: ${filePath}`);
    }

    // 删除数据库记录
    await sql.query`DELETE FROM DownloadedSongs WHERE downloadId = ${downloadId}`;
    res.json({ success: true, message: '删除成功' });

  } catch (err) {
    console.error('❌ 删除失败：', err);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 清空下载记录
app.post('/downloads/clear', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: '缺少 userId' });

  try {
    await sql.query`DELETE FROM DownloadedSongs WHERE userId = ${userId}`;
    res.json({ success: true, message: '已清空下载记录' });
  } catch (err) {
    console.error('❌ 清空下载失败：', err);
    res.status(500).json({ success: false, message: '清空下载失败' });
  }
});



// 提供静态访问下载文件
app.use('/downloads/files', express.static(path.join(__dirname, 'downloads')));







app.listen(3000, () => console.log('🎵 Server running on http://localhost:3000'));
