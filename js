// Função principal que renderiza o calendário
function atualizarCalendario() {
  const hoje = new Date();
  const primeiroDiaMes = new Date(anoSelecionado, mesSelecionado, 1);
  const ultimoDiaMes = new Date(anoSelecionado, mesSelecionado + 1, 0);
  const diasNoMes = ultimoDiaMes.getDate();
  
  // Calcular primeiro dia da semana (0=Segunda, 6=Domingo)
  let primeiroDiaSemana = primeiroDiaMes.getDay(); // 0=Domingo, 1=Segunda, etc.
  primeiroDiaSemana = primeiroDiaSemana === 0 ? 6 : primeiroDiaSemana - 1; // Converter para 0=Segunda
  
  // Atualizar título do calendário
  const calendarTitle = document.getElementById('calendarTitle');
  if (calendarTitle) {
    calendarTitle.textContent = `${MESES[mesSelecionado]} de ${anoSelecionado}`;
  }
  
  // Gerar grid do calendário
  const calendarGrid = document.getElementById('calendarGrid');
  if (!calendarGrid) return;
  
  // Manter os cabeçalhos (primeiros 7 elementos)
  while (calendarGrid.children.length > 7) {
    calendarGrid.removeChild(calendarGrid.lastChild);
  }
  
  // Dias vazios no início
  for (let i = 0; i < primeiroDiaSemana; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
  
  // Dias do mês
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.setAttribute('data-dia', dia);
    
    const dataDia = new Date(anoSelecionado, mesSelecionado, dia);
    
    // Calcular dia da semana
    let diaSemanaNumero = dataDia.getDay();
    diaSemanaNumero = diaSemanaNumero === 0 ? 6 : diaSemanaNumero - 1;
    
    const diaSemanaNome = DIAS_SEMANA[diaSemanaNumero];
    
    // Verificar se é hoje
    if (hoje.getDate() === dia && 
        hoje.getMonth() === mesSelecionado && 
        hoje.getFullYear() === anoSelecionado) {
      dayDiv.classList.add('today');
    }
    
    // Verificar se há dados para este dia
    const dadosDia = getDadosDiaComTrocas(dia);
    if (dadosDia) {
      dayDiv.classList.add('has-data');
      
      // Verificar se este dia tem trocas ativas
      const temTrocas = trocasRegistradas.some(troca => 
        (troca.dia_a === dia || troca.dia_b === dia) && troca.status === 'ativa'
      );
      
      if (temTrocas) {
        dayDiv.classList.add('swapped');
      }
      
      // Adicionar evento de clique
      dayDiv.onclick = () => handleDiaClick(dia);
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
      
      // Adicionar ícone de troca se houver
      const temTrocas = trocasRegistradas.some(troca => 
        (troca.dia_a === dia || troca.dia_b === dia) && troca.status === 'ativa'
      );
      
      if (temTrocas) {
        content += `<div class="swap-icon"><i class="bi bi-arrow-left-right"></i></div>`;
      }
    }
    
    dayDiv.innerHTML = content;
    calendarGrid.appendChild(dayDiv);
  }
  
  // Preencher células restantes
  const totalCells = primeiroDiaSemana + diasNoMes;
  const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
  
  for (let i = 0; i < remainingCells; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
}

// Função para mostrar detalhes do dia (ao clicar)
function mostrarDetalhesDia(dia) {
  const dadosDia = getDadosDiaComTrocas(dia);
  if (!dadosDia) return;
  
  const trocasDia = trocasRegistradas.filter(t => 
    (t.dia_a === dia || t.dia_b === dia) && t.status === 'ativa'
  );
  
  const modal = new bootstrap.Modal(document.getElementById('dayModal'));
  const modalTitle = document.getElementById('dayModalTitle');
  const modalContent = document.getElementById('dayModalContent');
  
  if (!modalTitle || !modalContent) return;
  
  let tituloExtra = '';
  if (trocasDia.length > 0) {
    const numTrocas = trocasDia.length;
    tituloExtra = ` <span class="badge bg-purple">${numTrocas} troca(s)</span>`;
  }
  
  modalTitle.innerHTML = `Dia ${dia} (${dadosDia.diaSemana}) - ${dadosDia.numPessoas} pessoa(s) trabalhando${tituloExtra}`;
  
  let html = `
    <div class="day-content">
      <div class="area-section">
        <div class="area-title">
          <i class="bi bi-diagram-3"></i>
          <span>Divisão de Áreas</span>
          ${trocasDia.length > 0 ? '<span class="badge bg-info ms-2">COM TROCAS</span>' : ''}
        </div>
        <div class="area-grid">
  `;
  
  if (Object.keys(dadosDia.divisao).length > 0) {
    // Ordenar as entradas alfabeticamente pelo primeiro nome da pessoa
    const entradasOrdenadas = Object.entries(dadosDia.divisao)
      .filter(([area, pessoa]) => pessoa)
      .sort((a, b) => {
        const nomeA = obterPrimeiroNome(a[1]).toLowerCase();
        const nomeB = obterPrimeiroNome(b[1]).toLowerCase();
        return nomeA.localeCompare(nomeB, 'pt-BR');
      });

    entradasOrdenadas.forEach(([area, pessoa]) => {
      // Verificar se esta pessoa está em alguma troca
      const pessoaEmTroca = trocasDia.some(t => t.pessoa_a === pessoa || t.pessoa_b === pessoa);

      // Se já contém " / " (múltiplas pessoas, ex: RIO com 2), usar valor direto
      // Caso contrário, extrair primeiro nome
      const nomeExibir = pessoa.includes(' / ')
        ? pessoa.split(' / ').map(n => obterPrimeiroNome(n)).join(' / ')
        : obterPrimeiroNome(pessoa);

      html += `
        <div class="area-item">
          <span class="area-label">${area}</span>
          <div class="funcionario-name" title="${pessoa}">
            ${nomeExibir}
            ${pessoaEmTroca ? ' <i class="bi bi-arrow-left-right text-purple"></i>' : ''}
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
          <div class="status-group-title">Trabalhando (${dadosDia.trabalhando.length})</div>
          <div class="status-list">
  `;

  // Ordenar trabalhando alfabeticamente pelo primeiro nome
  const trabalhandoOrdenado = ordenarNomesAlfabeticamente(dadosDia.trabalhando);

  trabalhandoOrdenado.forEach(nome => {
    const pessoaEmTroca = trocasDia.some(t => t.pessoa_a === nome || t.pessoa_b === nome);
    const primeiroNome = obterPrimeiroNome(nome);

    html += `
      <div class="status-item">
        <span class="status-badge badge-presente">✓</span>
        <span>${primeiroNome} ${pessoaEmTroca ? '<i class="bi bi-arrow-left-right text-purple ms-1"></i>' : ''}</span>
      </div>
    `;
  });
  
  html += `
          </div>
        </div>
  `;
  
  if (dadosDia.ausentes.length > 0) {
    html += `
        <div class="status-group">
          <div class="status-group-title">Ausentes (${dadosDia.ausentes.length})</div>
          <div class="status-list">
    `;

    // Ordenar ausentes alfabeticamente pelo primeiro nome
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
