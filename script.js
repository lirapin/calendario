// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const DIAS_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

let mesSelecionado = new Date().getMonth();
let anoSelecionado = new Date().getFullYear();
let dadosProcessados = {};

// ============================================
// DADOS DE EXEMPLO (SUBSTITUA PELOS SEUS DADOS REAIS)
// ============================================

// Exemplo de estrutura de dados
dadosProcessados = {
  1: {
    dia: 1,
    diaSemana: 'QUA',
    numPessoas: 5,
    trabalhando: ['JOÃO SILVA', 'MARIA SANTOS', 'PEDRO OLIVEIRA', 'ANA COSTA', 'CARLOS SOUZA'],
    ausentes: [],
    divisao: {
      'RIO': 'JOÃO SILVA',
      'NE/BA': 'MARIA SANTOS',
      'CO/NO': 'PEDRO OLIVEIRA',
      'MG': 'ANA COSTA',
      'SIR/APOIO': 'CARLOS SOUZA'
    }
  },
  15: {
    dia: 15,
    diaSemana: 'QUA',
    numPessoas: 4,
    trabalhando: ['JOÃO SILVA', 'MARIA SANTOS', 'PEDRO OLIVEIRA', 'ANA COSTA'],
    ausentes: [
      { nome: 'CARLOS SOUZA', motivo: 'FÉRIAS' }
    ],
    divisao: {
      'RIO': 'JOÃO SILVA',
      'NE/BA': 'MARIA SANTOS',
      'CO/NO': 'PEDRO OLIVEIRA',
      'MG': 'ANA COSTA'
    }
  }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function obterPrimeiroNome(nomeCompleto) {
  if (!nomeCompleto) return '';
  const nome = String(nomeCompleto).trim();
  const partes = nome.split(/\s+/);
  if (partes.length > 0) {
    const primeiro = partes[0];
    return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
  }
  return nome;
}

function ordenarNomesAlfabeticamente(nomes) {
  return [...nomes].sort((a, b) => {
    const nomeA = obterPrimeiroNome(a).toLowerCase();
    const nomeB = obterPrimeiroNome(b).toLowerCase();
    return nomeA.localeCompare(nomeB, 'pt-BR');
  });
}

// ============================================
// CALENDÁRIO
// ============================================

function mudarMes(delta) {
  mesSelecionado += delta;
  
  if (mesSelecionado > 11) {
    mesSelecionado = 0;
    anoSelecionado++;
  } else if (mesSelecionado < 0) {
    mesSelecionado = 11;
    anoSelecionado--;
  }
  
  atualizarCalendario();
}

function atualizarCalendario() {
  const hoje = new Date();
  const primeiroDiaMes = new Date(anoSelecionado, mesSelecionado, 1);
  const ultimoDiaMes = new Date(anoSelecionado, mesSelecionado + 1, 0);
  const diasNoMes = ultimoDiaMes.getDate();
  
  let primeiroDiaSemana = primeiroDiaMes.getDay();
  primeiroDiaSemana = primeiroDiaSemana === 0 ? 6 : primeiroDiaSemana - 1;
  
  const calendarTitle = document.getElementById('calendarTitle');
  if (calendarTitle) {
    calendarTitle.textContent = `${MESES[mesSelecionado]} de ${anoSelecionado}`;
  }
  
  const calendarGrid = document.getElementById('calendarGrid');
  if (!calendarGrid) return;
  
  while (calendarGrid.children.length > 7) {
    calendarGrid.removeChild(calendarGrid.lastChild);
  }
  
  for (let i = 0; i < primeiroDiaSemana; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
  
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.setAttribute('data-dia', dia);
    
    const dataDia = new Date(anoSelecionado, mesSelecionado, dia);
    let diaSemanaNumero = dataDia.getDay();
    diaSemanaNumero = diaSemanaNumero === 0 ? 6 : diaSemanaNumero - 1;
    const diaSemanaNome = DIAS_SEMANA[diaSemanaNumero];
    
    if (hoje.getDate() === dia && 
        hoje.getMonth() === mesSelecionado && 
        hoje.getFullYear() === anoSelecionado) {
      dayDiv.classList.add('today');
    }
    
    const dadosDia = dadosProcessados[dia];
    if (dadosDia) {
      dayDiv.classList.add('has-data');
      dayDiv.onclick = () => mostrarDetalhesDia(dia);
    }
    
    let content = `
      <div class="calendar-day-number">${dia}</div>
      <div class="calendar-day-week">${diaSemanaNome}</div>
    `;
    
    if (dadosDia) {
      content += `<div class="calendar-day-stats">${dadosDia.numPessoas} pessoa(s)</div>`;
      if (dadosDia.ausentes.length > 0) {
        content += `<div class="calendar-day-absent">${dadosDia.ausentes.length} ausente(s)</div>`;
      }
    }
    
    dayDiv.innerHTML = content;
    calendarGrid.appendChild(dayDiv);
  }
  
  const totalCells = primeiroDiaSemana + diasNoMes;
  const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
  
  for (let i = 0; i < remainingCells; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
}

function mostrarDetalhesDia(dia) {
  const dadosDia = dadosProcessados[dia];
  if (!dadosDia) return;
  
  const modal = new bootstrap.Modal(document.getElementById('dayModal'));
  const modalTitle = document.getElementById('dayModalTitle');
  const modalContent = document.getElementById('dayModalContent');
  
  if (!modalTitle || !modalContent) return;
  
  modalTitle.innerHTML = `Dia ${dia} (${dadosDia.diaSemana}) - ${dadosDia.numPessoas} pessoa(s) trabalhando`;
  
  let html = `
    <div class="day-content">
      <div class="area-section">
        <div class="area-title">
          <i class="bi bi-diagram-3"></i>
          <span>Divisão de Áreas</span>
        </div>
        <div class="area-grid">
  `;
  
  if (Object.keys(dadosDia.divisao).length > 0) {
    const entradasOrdenadas = Object.entries(dadosDia.divisao)
      .filter(([area, pessoa]) => pessoa)
      .sort((a, b) => {
        const nomeA = obterPrimeiroNome(a[1]).toLowerCase();
        const nomeB = obterPrimeiroNome(b[1]).toLowerCase();
        return nomeA.localeCompare(nomeB, 'pt-BR');
      });

    entradasOrdenadas.forEach(([area, pessoa]) => {
      const nomeExibir = pessoa.includes(' / ')
        ? pessoa.split(' / ').map(n => obterPrimeiroNome(n)).join(' / ')
        : obterPrimeiroNome(pessoa);

      html += `
        <div class="area-item">
          <span class="area-label">${area}</span>
          <div class="funcionario-name" title="${pessoa}">
            ${nomeExibir}
          </div>
        </div>
      `;
    });
  } else {
    html += `<div class="text-muted small">Não foi possível fazer a divisão.</div>`;
  }
  
  html += `
        </div>
      </div>
      
      <div class="status-section">
        <div class="status-title">
          <i class="bi bi-people"></i>
          <span>Status da Equipe</span>
        </div>
        
        <div class="status-group">
          <div class="status-group-title" style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; font-weight: 500;">Trabalhando (${dadosDia.trabalhando.length})</div>
          <div class="status-list">
  `;

  const trabalhandoOrdenado = ordenarNomesAlfabeticamente(dadosDia.trabalhando);

  trabalhandoOrdenado.forEach(nome => {
    const primeiroNome = obterPrimeiroNome(nome);
    html += `
      <div class="status-item">
        <span class="status-badge badge-presente">✓</span>
        <span>${primeiroNome}</span>
      </div>
    `;
  });
  
  html += `
          </div>
        </div>
  `;
  
  if (dadosDia.ausentes.length > 0) {
    html += `
        <div class="status-group" style="margin-top: 1rem;">
          <div class="status-group-title" style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; font-weight: 500;">Ausentes (${dadosDia.ausentes.length})</div>
          <div class="status-list">
    `;

    const ausentesOrdenados = [...dadosDia.ausentes].sort((a, b) => {
      const nomeA = obterPrimeiroNome(a.nome).toLowerCase();
      const nomeB = obterPrimeiroNome(b.nome).toLowerCase();
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });

    ausentesOrdenados.forEach(({nome, motivo}) => {
      const primeiroNome = obterPrimeiroNome(nome);
      html += `
        <div class="status-item">
          <span class="status-badge badge-ausente">${motivo}</span>
          <span>${primeiroNome}</span>
        </div>
      `;
    });

    html += `</div></div>`;
  }
  
  html += `
      </div>
    </div>
  `;
  
  modalContent.innerHTML = html;
  modal.show();
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  atualizarCalendario();
});
