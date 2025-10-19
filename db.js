const sql = require('mssql');

// 基础配置（连接到 master 数据库）
const masterConfig = {
  user: 'sa',
  password: '123',
  server: 'localhost',
  database: 'master', // 先连接到 master
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// 应用数据库配置
const appConfig = {
  user: 'sa',
  password: '123',
  server: 'localhost',
  database: 'music_app',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// 检查并创建数据库
async function initDatabase() {
  let pool;
  try {
    console.log('🔍 检查数据库是否存在...');
    pool = await sql.connect(masterConfig);
    
    // 检查数据库是否存在
    const result = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = 'music_app'
    `);
    
    if (result.recordset.length === 0) {
      console.log('📦 数据库不存在，开始创建 music_app 数据库...');
      await pool.request().query('CREATE DATABASE music_app');
      console.log('✅ 数据库 music_app 创建成功');
    } else {
      console.log('✅ 数据库 music_app 已存在');
    }
    
    await pool.close();
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err.message);
    if (pool) await pool.close();
    throw err;
  }
}

// 检查并创建表
async function initTables() {
  let pool;
  try {
    console.log('🔍 检查数据表是否存在...');
    pool = await sql.connect(appConfig);
    
    // 创建 users 表
    const usersExists = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'users'
    `);
    
    if (usersExists.recordset.length === 0) {
      console.log('📋 创建 users 表...');
      await pool.request().query(`
        CREATE TABLE users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(50) NOT NULL,
          password NVARCHAR(100) NOT NULL,
          avatar NVARCHAR(200) NULL
        )
      `);
      console.log('✅ users 表创建成功');
    } else {
      console.log('✅ users 表已存在');
    }
    
    // 创建 favorites 表
    const favoritesExists = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'favorites'
    `);
    
    if (favoritesExists.recordset.length === 0) {
      console.log('📋 创建 favorites 表...');
      await pool.request().query(`
        CREATE TABLE favorites (
          id INT IDENTITY(1,1) PRIMARY KEY,
          userId INT NOT NULL,
          musicId BIGINT NOT NULL,
          createdAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✅ favorites 表创建成功');
    } else {
      console.log('✅ favorites 表已存在');
    }
    
    // 创建 history 表
    const historyExists = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'history'
    `);
    
    if (historyExists.recordset.length === 0) {
      console.log('📋 创建 history 表...');
      await pool.request().query(`
        CREATE TABLE history (
          id INT IDENTITY(1,1) PRIMARY KEY,
          userId INT NOT NULL,
          musicId BIGINT NOT NULL,
          playedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✅ history 表创建成功');
    } else {
      console.log('✅ history 表已存在');
    }
    
    // 创建 DownloadedSongs 表
    const downloadedSongsExists = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'DownloadedSongs'
    `);
    
    if (downloadedSongsExists.recordset.length === 0) {
      console.log('📋 创建 DownloadedSongs 表...');
      await pool.request().query(`
        CREATE TABLE DownloadedSongs (
          downloadId INT IDENTITY(1,1) PRIMARY KEY,
          userId INT NULL,
          musicId BIGINT NOT NULL,
          songName NVARCHAR(200) NOT NULL,
          artist NVARCHAR(200) NULL,
          album NVARCHAR(200) NULL,
          coverUrl VARCHAR(500) NULL,
          localPath VARCHAR(500) NULL,
          downloadTime DATETIME DEFAULT GETDATE(),
          status INT DEFAULT 1,
          lyricsPath VARCHAR(500) NULL,
          lyricsStatus INT DEFAULT 0
        )
      `);
      console.log('✅ DownloadedSongs 表创建成功');
    } else {
      console.log('✅ DownloadedSongs 表已存在');
    }
    
    await pool.close();
  } catch (err) {
    console.error('❌ 数据表初始化失败:', err.message);
    if (pool) await pool.close();
    throw err;
  }
}

// 主连接函数
async function connectDB() {
  try {
    // 1. 检查并创建数据库
    await initDatabase();
    
    // 2. 检查并创建表
    await initTables();
    
    // 3. 连接到应用数据库
    await sql.connect(appConfig);
    console.log('✅ 数据库连接完成，所有表已就绪');
    
  } catch (err) {
    console.error('❌ 数据库连接失败:', err);
    throw err;
  }
}

module.exports = { sql, connectDB };
