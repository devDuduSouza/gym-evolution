const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'gym.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    peso REAL,
    biceps_contraido REAL,
    biceps_relaxado REAL,
    antebraco REAL,
    ombro_bustos REAL,
    peito REAL,
    cintura_buxinho REAL,
    cintura_umbigo REAL,
    coxa_superior REAL,
    coxa_inferior REAL,
    panturrilha REAL
  )
`);

module.exports = db;
