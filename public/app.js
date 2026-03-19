const FIELDS = [
  { key: 'peso', label: 'Peso (kg)', unit: 'kg', type: 'muscle' },
  { key: 'biceps_contraido', label: 'Bíceps Contraído', unit: 'cm', type: 'muscle' },
  { key: 'biceps_relaxado', label: 'Bíceps Relaxado', unit: 'cm', type: 'muscle' },
  { key: 'antebraco', label: 'Antebraço', unit: 'cm', type: 'muscle' },
  { key: 'ombro_bustos', label: 'Ombro / Bustos', unit: 'cm', type: 'muscle' },
  { key: 'peito', label: 'Peito', unit: 'cm', type: 'muscle' },
  { key: 'cintura_buxinho', label: 'Cintura (Buxinho)', unit: 'cm', type: 'waist' },
  { key: 'cintura_umbigo', label: 'Cintura (Umbigo)', unit: 'cm', type: 'waist' },
  { key: 'coxa_superior', label: 'Coxa Superior', unit: 'cm', type: 'muscle' },
  { key: 'coxa_inferior', label: 'Coxa Inferior', unit: 'cm', type: 'muscle' },
  { key: 'panturrilha', label: 'Panturrilha', unit: 'cm', type: 'muscle' },
];

let measurements = [];

const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');
const emptyMsg = document.getElementById('empty-msg');
const periodEl = document.getElementById('period');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const form = document.getElementById('measurement-form');
const btnNew = document.getElementById('btn-new');
const btnCancel = document.getElementById('btn-cancel');

async function api(method, url, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

async function loadData() {
  measurements = await api('GET', '/api/measurements');
  render();
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function render() {
  const hasMeasurements = measurements.length > 0;
  document.querySelector('table').style.display = hasMeasurements ? '' : 'none';
  emptyMsg.style.display = hasMeasurements ? 'none' : '';
  if (!hasMeasurements) { periodEl.textContent = ''; return; }

  const first = measurements[0];
  const last = measurements[measurements.length - 1];
  periodEl.textContent = `${formatDate(first.date)} - ${formatDate(last.date)}`;
  const showEvolution = measurements.length >= 2;

  let headHtml = '<tr><th>Medida</th>';
  measurements.forEach(m => {
    headHtml += `<th><span>${formatDate(m.date)}</span><span class="header-label">${m.label || ''}</span><span class="header-actions"><button class="btn-icon btn-edit" onclick="editMeasurement(${m.id})" title="Editar">&#9998;</button><button class="btn-icon btn-delete" onclick="deleteMeasurement(${m.id})" title="Excluir">&#10005;</button></span></th>`;
  });
  if (showEvolution) headHtml += '<th class="col-evolution">Evolução Total</th>';
  headHtml += '</tr>';
  tableHead.innerHTML = headHtml;

  let bodyHtml = '';
  FIELDS.forEach(field => {
    bodyHtml += `<tr><td>${field.label}</td>`;
    measurements.forEach(m => {
      const val = m[field.key];
      bodyHtml += `<td>${val != null ? val : '-'}</td>`;
    });
    if (showEvolution) {
      const firstVal = first[field.key];
      const lastVal = last[field.key];
      if (firstVal != null && lastVal != null) {
        const diff = lastVal - firstVal;
        const sign = diff > 0 ? '+' : '';
        let cls = 'neutral';
        if (field.type === 'waist') { if (diff < 0) cls = 'positive'; else if (diff > 0) cls = 'warning'; }
        else { if (diff > 0) cls = 'positive'; else if (diff < 0) cls = 'negative'; }
        bodyHtml += `<td class="evolution ${cls}">${sign}${diff.toFixed(1)}</td>`;
      } else { bodyHtml += '<td class="evolution neutral">-</td>'; }
    }
    bodyHtml += '</tr>';
  });
  tableBody.innerHTML = bodyHtml;
}

function openModal(data = null) {
  form.reset();
  document.getElementById('form-id').value = '';
  if (data) {
    modalTitle.textContent = 'Editar Medição';
    document.getElementById('form-id').value = data.id;
    document.getElementById('form-date').value = data.date;
    document.getElementById('form-label').value = data.label || '';
    FIELDS.forEach(f => { const input = document.getElementById('form-' + f.key); if (input && data[f.key] != null) input.value = data[f.key]; });
  } else {
    modalTitle.textContent = 'Nova Medição';
    document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
  }
  modal.classList.remove('hidden');
}

function closeModal() { modal.classList.add('hidden'); }

btnNew.addEventListener('click', () => openModal());
btnCancel.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('form-id').value;
  const body = { date: document.getElementById('form-date').value, label: document.getElementById('form-label').value };
  FIELDS.forEach(f => { const val = document.getElementById('form-' + f.key).value; body[f.key] = val !== '' ? parseFloat(val) : null; });
  if (id) { await api('PUT', `/api/measurements/${id}`, body); } else { await api('POST', '/api/measurements', body); }
  closeModal();
  await loadData();
});

window.editMeasurement = function (id) { const m = measurements.find(x => x.id === id); if (m) openModal(m); };
window.deleteMeasurement = async function (id) { if (!confirm('Excluir esta medição?')) return; await api('DELETE', `/api/measurements/${id}`); await loadData(); };

const PROFILE_KEY = 'gym_profile';
const modalProfile = document.getElementById('modal-profile');
const profileForm = document.getElementById('profile-form');

function loadProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; } }
function saveProfile(data) { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); }

document.getElementById('btn-profile').addEventListener('click', () => {
  const p = loadProfile();
  document.getElementById('profile-sexo').value = p.sexo || '';
  document.getElementById('profile-idade').value = p.idade || '';
  document.getElementById('profile-altura').value = p.altura || '';
  document.getElementById('profile-freq').value = p.freq || '';
  document.getElementById('profile-calorias').value = p.calorias || '';
  document.getElementById('profile-rotina').value = p.rotina || '';
  modalProfile.classList.remove('hidden');
});

document.getElementById('btn-profile-cancel').addEventListener('click', () => { modalProfile.classList.add('hidden'); });
modalProfile.addEventListener('click', e => { if (e.target === modalProfile) modalProfile.classList.add('hidden'); });

profileForm.addEventListener('submit', e => {
  e.preventDefault();
  saveProfile({ sexo: document.getElementById('profile-sexo').value, idade: document.getElementById('profile-idade').value, altura: document.getElementById('profile-altura').value, freq: document.getElementById('profile-freq').value, calorias: document.getElementById('profile-calorias').value, rotina: document.getElementById('profile-rotina').value });
  modalProfile.classList.add('hidden');
  const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = 'Perfil salvo!'; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2100);
});

document.getElementById('btn-export-prompt').addEventListener('click', () => {
  if (measurements.length === 0) { alert('Nenhuma medição para exportar.'); return; }
  let prompt = 'Analise minha evolução corporal e me dê feedbacks detalhados sobre meu progresso, pontos fortes, pontos de atenção e sugestões.\n\n';
  const profile = loadProfile();
  if (profile.sexo || profile.idade || profile.altura || profile.freq || profile.rotina) {
    prompt += '--- Perfil ---\n';
    if (profile.sexo) prompt += `Sexo: ${profile.sexo}\n`;
    if (profile.idade) prompt += `Idade: ${profile.idade} anos\n`;
    if (profile.altura) prompt += `Altura: ${profile.altura} cm\n`;
    if (profile.freq) prompt += `Treinos por semana: ${profile.freq}x\n`;
    if (profile.calorias) prompt += `Calorias por dia: ${profile.calorias} kcal\n`;
    if (profile.rotina) prompt += `Rotina: ${profile.rotina}\n`;
    prompt += '\n';
  }
  prompt += `Tenho ${measurements.length} medição(ões) registrada(s):\n\n`;
  measurements.forEach((m, i) => {
    prompt += `--- Medição ${i + 1}: ${formatDate(m.date)}${m.label ? ' (' + m.label + ')' : ''} ---\n`;
    FIELDS.forEach(f => { const val = m[f.key]; if (val != null) prompt += `${f.label}: ${val} ${f.unit}\n`; });
    prompt += '\n';
  });
  if (measurements.length >= 2) {
    const first = measurements[0]; const last = measurements[measurements.length - 1];
    prompt += `--- Evolução (${formatDate(first.date)} → ${formatDate(last.date)}) ---\n`;
    FIELDS.forEach(f => { const fv = first[f.key]; const lv = last[f.key]; if (fv != null && lv != null) { const diff = lv - fv; const sign = diff > 0 ? '+' : ''; prompt += `${f.label}: ${sign}${diff.toFixed(1)} ${f.unit}\n`; } });
  }
  navigator.clipboard.writeText(prompt).then(() => { const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = 'Prompt copiado! Cole em qualquer IA para análise.'; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2100); });
});

loadData();
