// Script para atualizar initialData.ts com dados da planilha Google Sheets
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'sheets-data.csv');
const csvData = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const result = [];
  for (const line of lines) {
    // Simple CSV parsing - handles quoted fields
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current);
    result.push(fields);
  }
  return result;
}

const rows = parseCSV(csvData);

console.log('Total rows:', rows.length);

// Find the header row for payments
let paymentHeaderRow = -1;
for (let i = 0; i < rows.length; i++) {
  if (rows[i][1] === 'STATUS' && rows[i][2] === 'Janeiro') {
    paymentHeaderRow = i;
    break;
  }
}

console.log('\nPayment header row:', paymentHeaderRow);

if (paymentHeaderRow >= 0) {
  const headers = rows[paymentHeaderRow];
  console.log('Headers:', headers);
  
  // Parse player payments
  const players = [];
  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  for (let i = paymentHeaderRow + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] || row[0].trim() === '' || row[0].includes('Total') || row[0].includes('EM DINHEIRO')) {
      continue;
    }
    
    const nome = row[0].trim();
    const status = row[1]?.trim() || 'Mensalista';
    
    if (!nome) continue;
    
    const pagamentos = {};
    MESES.forEach((mes, idx) => {
      const val = row[idx + 2]?.trim();
      if (val && val !== '' && val !== 'R$ 0,00') {
        const num = parseFloat(val.replace('R$ ', '').replace('.', '').replace(',', '.'));
        if (!isNaN(num)) {
          pagamentos[mes] = num;
        } else {
          pagamentos[mes] = 0;
        }
      } else if (val === 'R$ 0,00') {
        pagamentos[mes] = 0;
      } else {
        pagamentos[mes] = null;
      }
    });
    
    players.push({ nome, status, pagamentos });
  }
  
  console.log('\nPlayers found:', players.length);
  players.forEach(p => console.log(p.nome, p.status, JSON.stringify(p.pagamentos)));
  
  // Parse Entradas (columns 15-16)
  console.log('\n--- ENTRADAS ---');
  const entradas = [];
  for (let i = paymentHeaderRow + 1; i < rows.length; i++) {
    const row = rows[i];
    const desc = row[15]?.trim();
    const val = row[16]?.trim();
    if (desc && val && val.startsWith('R$')) {
      entradas.push({ descricao: desc, valor: parseFloat(val.replace('R$ ', '').replace('.', '').replace(',', '.')) });
    }
  }
  console.log('Entradas:', entradas);
  
  // Parse Saídas (columns 17-18)
  console.log('\n--- SAÍDAS ---');
  const saidas = [];
  for (let i = paymentHeaderRow + 1; i < rows.length; i++) {
    const row = rows[i];
    const desc = row[17]?.trim();
    const val = row[18]?.trim();
    if (desc && val && val.startsWith('R$')) {
      saidas.push({ descricao: desc, valor: parseFloat(val.replace('R$ ', '').replace('.', '').replace(',', '.')) });
    }
  }
  console.log('Saídas:', saidas);
  
  // Generate updated initialData.ts content
  console.log('\n\n=== GENERATED PAGAMENTOS_INICIAIS ===');
  console.log('export const PAGAMENTOS_INICIAIS = {');
  
  // Map player names to IDs (using existing IDs from initialData.ts)
  const nameToId = {
    'Alex': 'j_alex',
    'Bahia': 'j_bahia',
    'Brug': 'j_brug',
    'Daibert': 'j_daibert',
    'Douglas': 'j_douglas',
    'Diogo': 'j_diogo',
    'Felipe': 'j_felipe',
    'Felipo': 'j_felipo',
    'Rogerio': 'j_rogerio',
    'Rechan': 'j_rechan',
    'Guilherme': 'j_guilherme',
    'Filipão': 'j_filipao',
    'Lucao': 'j_lucao',
    'Alan': 'j_alan',
    'Fabio': 'j_fabio',
    'Juan': 'j_juan',
    'Thiago': 'j_thiago',
    'Victão': 'j_victao',
    'Jader': 'j_jader',
    'Yuri': 'j_yuri',
    'Thierry': 'j_thierry',
    'Fontainha': 'j_fontainha',
  };
  
  for (const player of players) {
    const id = nameToId[player.nome];
    if (!id) {
      console.log(`// WARNING: No ID mapping for ${player.nome}`);
      continue;
    }
    
    console.log(`  ${id}: {`);
    MESES.forEach((mes, idx) => {
      const val = player.pagamentos[mes];
      if (val === null) {
        console.log(`    ${mes}: null,`);
      } else {
        console.log(`    ${mes}: ${val.toFixed(1)},`);
      }
    });
    console.log(`  },`);
  }
  console.log('};');
  
  console.log('\n=== GENERATED ENTRADAS_INICIAIS ===');
  console.log('export const ENTRADAS_INICIAIS = [');
  entradas.forEach((e, idx) => {
    console.log(`  { id: 'ent_${idx + 1}', tipo: 'entrada', descricao: '${e.descricao}', valor: ${e.valor.toFixed(1)}, categoria: 'Diarista', data: '${e.descricao}', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() },`);
  });
  console.log('];');
  
  console.log('\n=== GENERATED SAIDAS_INICIAIS ===');
  console.log('export const SAIDAS_INICIAIS = [');
  saidas.forEach((s, idx) => {
    console.log(`  { id: 'sai_${idx + 1}', tipo: 'saida', descricao: '${s.descricao}', valor: ${s.valor.toFixed(1)}, categoria: 'Quadra', data: '${s.descricao}', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() },`);
  });
  console.log('];');
}