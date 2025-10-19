-- =====================================================
-- iMusic 数据库初始化脚本
-- =====================================================
-- 说明：
-- 1. 现在已经集成到 db.js 中自动执行
-- 2. 运行 node server.js 时会自动检查并创建数据库和表
-- 3. 本文件仅作为参考和手动初始化使用
-- =====================================================

-- 如果数据库不存在则创建（保留原有数据）
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'music_app')
BEGIN
    CREATE DATABASE music_app;
END
GO

USE music_app;
GO

-- 创建用户表（如果不存在）
IF OBJECT_ID('users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL,
        password NVARCHAR(100) NOT NULL,
        avatar NVARCHAR(200) NULL
    );
END
GO

-- 创建收藏表（如果不存在）
IF OBJECT_ID('favorites', 'U') IS NULL
BEGIN
    CREATE TABLE favorites (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        musicId BIGINT NOT NULL,
        createdAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 创建历史记录表（如果不存在）
IF OBJECT_ID('history', 'U') IS NULL
BEGIN
    CREATE TABLE history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        musicId BIGINT NOT NULL,
        playedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 创建下载歌曲表（如果不存在）
IF OBJECT_ID('DownloadedSongs', 'U') IS NULL
BEGIN
    CREATE TABLE DownloadedSongs (
        downloadId INT IDENTITY(1,1) PRIMARY KEY,  -- 自增主键
        userId INT NULL,                           -- 关联用户（可选）
        musicId BIGINT NOT NULL,                   -- 歌曲ID
        songName NVARCHAR(200) NOT NULL,           -- 歌曲名
        artist NVARCHAR(200) NULL,                 -- 歌手
        album NVARCHAR(200) NULL,                  -- 专辑
        coverUrl VARCHAR(500) NULL,                -- 封面图URL
        localPath VARCHAR(500) NULL,               -- 本地保存路径
        downloadTime DATETIME DEFAULT GETDATE(),   -- 下载时间
        status INT DEFAULT 1,                      -- 状态：1=已下载,0=失败
        lyricsPath VARCHAR(500) NULL,              -- 歌词文件路径
        lyricsStatus INT DEFAULT 0                 -- 歌词状态：0=无,1=已下载
    );
END
GO
