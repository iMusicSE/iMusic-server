CREATE DATABASE music_app;
GO

USE music_app;
GO

CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) NOT NULL,
  password NVARCHAR(100) NOT NULL,
  avatar NVARCHAR(200) NULL
);

CREATE TABLE favorites (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    musicId BIGINT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    musicId BIGINT NOT NULL,
    playedAt DATETIME DEFAULT GETDATE()

);

CREATE TABLE DownloadedSongs (
    downloadId INT IDENTITY(1,1) PRIMARY KEY,  -- 自增主键
    userId INT NULL,                           -- 关联用户（可选）
    musicId BIGINT NOT NULL,                    -- 歌曲ID
    songName NVARCHAR(200) NOT NULL,           -- 歌曲名
    artist NVARCHAR(200) NULL,                 -- 歌手
    album NVARCHAR(200) NULL,                  -- 专辑
    coverUrl VARCHAR(500) NULL,                -- 封面图URL
    localPath VARCHAR(500) NULL,               -- 本地保存路径
    downloadTime DATETIME DEFAULT GETDATE(),   -- 下载时间
    status INT DEFAULT 1                       -- 状态：1=已下载,0=失败
	  lyricsPath VARCHAR(500) NULL,    -- 歌词文件
	  lyricsStatus INT DEFAULT 0;   
);
