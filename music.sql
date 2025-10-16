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