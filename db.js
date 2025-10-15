const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123',
  server: 'localhost', // 或你的SQL实例名
  database: 'music_app',
  options: {
    encrypt: false, // 本地一般设为 false
    trustServerCertificate: true
  }
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log('✅ 已成功连接到 SQL Server');
  } catch (err) {
    console.error('❌ 数据库连接失败:', err);
  }
}

module.exports = { sql, connectDB };
