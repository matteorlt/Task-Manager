import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tester la connexion
pool.getConnection()
  .then(connection => {
    console.log('Connexion à la base de données réussie');
    // Auto-migration légère: ajouter la colonne color à events et tasks si absente
    connection.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS color VARCHAR(7) NULL AFTER location;")
      .catch(() => { /* ignore si déjà existante */ });
    connection.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS color VARCHAR(7) NULL AFTER category;")
      .catch(() => { /* ignore si déjà existante */ })
      .finally(() => connection.release());
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
  });

export default pool; 