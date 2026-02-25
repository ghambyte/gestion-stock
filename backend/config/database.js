const { Sequelize } = require('sequelize');
require('dotenv').config();

const commonOptions = {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Railway fournit MYSQL_URL, DATABASE_URL, ou les variables individuelles MYSQL*
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

let sequelize;

if (connectionUrl) {
  console.log('DB: Connexion via URL');
  sequelize = new Sequelize(connectionUrl, commonOptions);
} else if (process.env.MYSQLHOST) {
  console.log('DB: Connexion via variables MYSQL* Railway');
  sequelize = new Sequelize(
    process.env.MYSQLDATABASE,
    process.env.MYSQLUSER,
    process.env.MYSQLPASSWORD,
    {
      ...commonOptions,
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT || 3306,
    }
  );
} else if (process.env.DB_HOST) {
  console.log('DB: Connexion via variables DB_* locales');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      ...commonOptions,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
    }
  );
} else {
  console.error('DB: Aucune variable de connexion MySQL trouvee!');
  console.error('Variables disponibles:', Object.keys(process.env).filter(k => k.includes('MYSQL') || k.includes('DB_') || k.includes('DATABASE')).join(', '));
  process.exit(1);
}

module.exports = sequelize;
