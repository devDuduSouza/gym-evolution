const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/measurements', (req, res) => {
  const rows = db.prepare('SELECT * FROM measurements ORDER BY date ASC').all();
  res.json(rows);
});

app.post('/api/measurements', (req, res) => {
  const { date, label, peso, biceps_contraido, biceps_relaxado, antebraco, ombro_bustos, peito, cintura_buxinho, cintura_umbigo, coxa_superior, coxa_inferior, panturrilha } = req.body;
  const stmt = db.prepare(`INSERT INTO measurements (date, label, peso, biceps_contraido, biceps_relaxado, antebraco, ombro_bustos, peito, cintura_buxinho, cintura_umbigo, coxa_superior, coxa_inferior, panturrilha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(date, label || '', peso, biceps_contraido, biceps_relaxado, antebraco, ombro_bustos, peito, cintura_buxinho, cintura_umbigo, coxa_superior, coxa_inferior, panturrilha);
  const newRow = db.prepare('SELECT * FROM measurements WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newRow);
});

app.put('/api/measurements/:id', (req, res) => {
  const { id } = req.params;
  const { date, label, peso, biceps_contraido, biceps_relaxado, antebraco, ombro_bustos, peito, cintura_buxinho, cintura_umbigo, coxa_superior, coxa_inferior, panturrilha } = req.body;
  const stmt = db.prepare(`UPDATE measurements SET date = ?, label = ?, peso = ?, biceps_contraido = ?, biceps_relaxado = ?, antebraco = ?, ombro_bustos = ?, peito = ?, cintura_buxinho = ?, cintura_umbigo = ?, coxa_superior = ?, coxa_inferior = ?, panturrilha = ? WHERE id = ?`);
  stmt.run(date, label || '', peso, biceps_contraido, biceps_relaxado, antebraco, ombro_bustos, peito, cintura_buxinho, cintura_umbigo, coxa_superior, coxa_inferior, panturrilha, id);
  const updated = db.prepare('SELECT * FROM measurements WHERE id = ?').get(id);
  if (!updated) return res.status(404).json({ error: 'Medição não encontrada' });
  res.json(updated);
});

app.delete('/api/measurements/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM measurements WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Medição não encontrada' });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
