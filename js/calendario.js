// ==========================================
// ELEMENTOS DO HTML
// ==========================================

const calendario = document.getElementById("calendario");
const cabecalhoCalendario = document.getElementById("cabecalhoCalendario");

const diaSemana = document.getElementById("diaSemana");
const numeroDia = document.getElementById("numeroDia");
const mesAnoTitulo = document.getElementById("mesAnoTitulo");
const informacaoDia = document.getElementById("informacaoDia");

const seletorMes = document.getElementById("seletorMes");
const seletorAno = document.getElementById("seletorAno");
const seletorFeriados = document.getElementById("seletorFeriados");
const seletorInicio = document.getElementById("seletorInicio");

const botaoHoje = document.getElementById("botaoHoje");
const mesAnterior = document.getElementById("mesAnterior");
const proximoMes = document.getElementById("proximoMes");

const listaAtividadesDia = document.getElementById("listaAtividadesDia");

const formProva = document.getElementById("formProva");
const nomeProva = document.getElementById("nomeProva");
const materiaProva = document.getElementById("materiaProva");
const dataProva = document.getElementById("dataProva");

const listaProvas = document.getElementById("listaProvas");

// ==========================================
// DATAS E CONFIGURAÇÕES
// ==========================================

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

let dataSelecionada = new Date(hoje);
let mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

let inicioSemana = 0;
let mostrarFeriados = true;

let provas = JSON.parse(localStorage.getItem("provasEscolares")) || [];
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const diasSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const diasAbreviados = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Feriados nacionais com data fixa
const feriados = {
  "01-01": "Confraternização Universal",
  "21-04": "Tiradentes",
  "01-05": "Dia do Trabalho",
  "07-09": "Independência do Brasil",
  "12-10": "Nossa Senhora Aparecida",
  "02-11": "Finados",
  "15-11": "Proclamação da República",
  "20-11": "Dia da Consciência Negra",
  "25-12": "Natal",
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================

function iniciarCalendario() {
  preencherSeletores();
  mostrarCabecalhoSemana();
  mostrarCalendario();
  mostrarAtividadesDia();
  mostrarProvas();
}

// ==========================================
// SELETORES DE MÊS E ANO
// ==========================================

function preencherSeletores() {
  seletorMes.innerHTML = "";

  nomesMeses.forEach((mes, indice) => {
    const opcao = document.createElement("option");

    opcao.value = indice;
    opcao.textContent = mes;

    seletorMes.appendChild(opcao);
  });

  seletorAno.innerHTML = "";

  const anoAtual = hoje.getFullYear();

  for (let ano = anoAtual - 5; ano <= anoAtual + 10; ano++) {
    const opcao = document.createElement("option");

    opcao.value = ano;
    opcao.textContent = ano;

    seletorAno.appendChild(opcao);
  }

  atualizarSeletores();
}

function atualizarSeletores() {
  seletorMes.value = mesAtual.getMonth();
  seletorAno.value = mesAtual.getFullYear();
}

// ==========================================
// CABEÇALHO DOS DIAS DA SEMANA
// ==========================================

function mostrarCabecalhoSemana() {
  cabecalhoCalendario.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const indice = (i + inicioSemana) % 7;

    const coluna = document.createElement("div");
    coluna.className = "col";

    const nome = document.createElement("div");
    nome.className = "small text-secondary py-2";
    nome.textContent = diasAbreviados[indice];

    coluna.appendChild(nome);
    cabecalhoCalendario.appendChild(coluna);
  }
}

// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterFeriado(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");

  return feriados[`${dia}-${mes}`] || null;
}

// ==========================================
// MOSTRAR CALENDÁRIO
// ==========================================

function mostrarCalendario() {
  calendario.innerHTML = "";

  mesAnoTitulo.textContent = `${nomesMeses[mesAtual.getMonth()]} ${mesAtual.getFullYear()}`;

  atualizarSeletores();

  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);

  const deslocamento = (primeiroDia.getDay() - inicioSemana + 7) % 7;

  const dataInicio = new Date(
    mesAtual.getFullYear(),
    mesAtual.getMonth(),
    1 - deslocamento,
  );

  for (let i = 0; i < 42; i++) {
    const data = new Date(dataInicio);
    data.setDate(dataInicio.getDate() + i);

    criarDiaCalendario(data);
  }

  atualizarResumoData();
}

// ==========================================
// CRIAR CADA DIA
// ==========================================

function criarDiaCalendario(data) {
  const coluna = document.createElement("div");
  coluna.className = "col";

  const botao = document.createElement("button");
  botao.type = "button";

  botao.className = "w-100 ratio ratio-1x1 border rounded-3 bg-white p-0";

  botao.style.color = "#111827";

  const conteudo = document.createElement("div");
  conteudo.className =
    "d-flex flex-column align-items-center justify-content-center p-1 overflow-hidden";

  const numero = document.createElement("span");
  numero.className = "fw-semibold";

  numero.textContent = data.getDate();

  const mesmaData = formatarData(data) === formatarData(dataSelecionada);
  const ehHoje = formatarData(data) === formatarData(hoje);
  const outroMes = data.getMonth() !== mesAtual.getMonth();

  if (outroMes) {
    botao.classList.add("border-0");
    numero.classList.add("text-secondary");
    numero.style.opacity = "0.45";
  } else {
    botao.classList.add("border-0");
  }

  if (ehHoje) {
    botao.classList.remove("border-0");
    botao.classList.add("bg-primary-subtle");
  }

  if (mesmaData) {
    botao.classList.remove("border-0");
    botao.classList.add("border-primary", "border-2");
  }

  conteudo.appendChild(numero);

  // Marcadores de atividades
  const marcadores = document.createElement("div");
  marcadores.className = "d-flex justify-content-center gap-1 mt-1";

  const atividades = obterAtividades(data);

  atividades.slice(0, 3).forEach(() => {
    const bolinha = document.createElement("span");

    bolinha.className = "rounded-circle";
    bolinha.style.width = "7px";
    bolinha.style.height = "7px";
    bolinha.style.backgroundColor = "#d97732";

    marcadores.appendChild(bolinha);
  });

  if (atividades.length > 0) {
    conteudo.appendChild(marcadores);
  }

  // Feriados
  const feriado = obterFeriado(data);

  if (mostrarFeriados && feriado && !outroMes) {
    const marcadorFeriado = document.createElement("span");

    marcadorFeriado.className = "small text-danger text-truncate";
    marcadorFeriado.textContent = feriado;
    marcadorFeriado.style.maxWidth = "100%";

    conteudo.appendChild(marcadorFeriado);
  }

  botao.appendChild(conteudo);

  botao.addEventListener("click", () => {
    dataSelecionada = new Date(data);
    mesAtual = new Date(data.getFullYear(), data.getMonth(), 1);

    mostrarCalendario();
    mostrarAtividadesDia();
  });

  coluna.appendChild(botao);
  calendario.appendChild(coluna);
}

// ==========================================
// OBTER ATIVIDADES DE UMA DATA
// ==========================================

function obterAtividades(data) {
  const dataFormatada = formatarData(data);

  const provasDoDia = provas.filter((prova) => {
    return prova.data === dataFormatada;
  });

  const tarefasDoDia = tarefas.filter((tarefa) => {
    return tarefa.prazo === dataFormatada && !tarefa.concluida;
  });

  return [
    ...provasDoDia.map((prova) => ({
      tipo: "Prova",
      nome: prova.nome,
      materia: prova.materia,
    })),

    ...tarefasDoDia.map((tarefa) => ({
      tipo: "Tarefa",
      nome: tarefa.descricao,
      materia: tarefa.materia,
    })),
  ];
}

// ==========================================
// ATUALIZAR RESUMO DA DATA
// ==========================================

function atualizarResumoData() {
  diaSemana.textContent = diasAbreviados[dataSelecionada.getDay()] + ".";

  numeroDia.textContent = dataSelecionada.getDate();

  const dataFormatada = formatarData(dataSelecionada);
  const dataHoje = formatarData(hoje);

  if (dataFormatada === dataHoje) {
    informacaoDia.textContent = "Hoje";
  } else {
    informacaoDia.textContent = diasSemana[dataSelecionada.getDay()];
  }
}

// ==========================================
// MOSTRAR ATIVIDADES DO DIA
// ==========================================

function mostrarAtividadesDia() {
  listaAtividadesDia.innerHTML = "";

  const atividades = obterAtividades(dataSelecionada);

  if (atividades.length === 0) {
    listaAtividadesDia.innerHTML = `
            <p class="text-secondary mb-0">
                Nenhuma atividade cadastrada para este dia.
            </p>
        `;

    return;
  }

  atividades.forEach((atividade) => {
    const item = document.createElement("div");

    item.className =
      "border rounded-3 p-3 mb-2 d-flex justify-content-between align-items-center";

    const informacoes = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = atividade.nome;

    const detalhe = document.createElement("p");
    detalhe.className = "small text-secondary mb-0";
    detalhe.textContent = `${atividade.tipo} • ${atividade.materia || "Sem matéria"}`;

    informacoes.appendChild(titulo);
    informacoes.appendChild(detalhe);

    item.appendChild(informacoes);

    listaAtividadesDia.appendChild(item);
  });
}

// ==========================================
// ADICIONAR PROVA
// ==========================================

formProva.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const novaProva = {
    id: Date.now(),
    nome: nomeProva.value.trim(),
    materia: materiaProva.value.trim(),
    data: dataProva.value,
  };

  if (!novaProva.nome || !novaProva.materia || !novaProva.data) {
    alert("Preencha todos os campos.");
    return;
  }

  provas.push(novaProva);

  localStorage.setItem("provasEscolares", JSON.stringify(provas));

  formProva.reset();

  mostrarCalendario();
  mostrarAtividadesDia();
  mostrarProvas();
});

// ==========================================
// MOSTRAR PRÓXIMAS PROVAS
// ==========================================

function mostrarProvas() {
  listaProvas.innerHTML = "";

  const provasOrdenadas = [...provas].sort((a, b) => {
    return a.data.localeCompare(b.data);
  });

  if (provasOrdenadas.length === 0) {
    listaProvas.innerHTML = `
            <p class="text-secondary mb-0">
                Nenhuma prova cadastrada.
            </p>
        `;

    return;
  }

  provasOrdenadas.forEach((prova) => {
    const item = document.createElement("div");

    item.className =
      "border rounded-3 p-3 mb-2 d-flex flex-wrap justify-content-between align-items-center gap-2";

    const informacoes = document.createElement("div");

    const titulo = document.createElement("strong");
    titulo.textContent = prova.nome;

    const detalhe = document.createElement("p");
    detalhe.className = "small text-secondary mb-0";

    const data = new Date(prova.data + "T00:00:00");

    detalhe.textContent = `${prova.materia} • ${data.toLocaleDateString("pt-BR")}`;

    const diasRestantes = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));

    const contagem = document.createElement("span");
    contagem.className = "small fw-semibold";

    if (diasRestantes < 0) {
      contagem.textContent = "Prova passada";
    } else if (diasRestantes === 0) {
      contagem.textContent = "É hoje!";
    } else if (diasRestantes === 1) {
      contagem.textContent = "Falta 1 dia";
    } else {
      contagem.textContent = `Faltam ${diasRestantes} dias`;
    }

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "btn btn-sm btn-outline-danger";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", () => {
      provas = provas.filter((item) => item.id !== prova.id);

      localStorage.setItem("provasEscolares", JSON.stringify(provas));

      mostrarCalendario();
      mostrarAtividadesDia();
      mostrarProvas();
    });

    informacoes.appendChild(titulo);
    informacoes.appendChild(detalhe);
    informacoes.appendChild(contagem);

    item.appendChild(informacoes);
    item.appendChild(botaoExcluir);

    listaProvas.appendChild(item);
  });
}

// ==========================================
// NAVEGAÇÃO DO CALENDÁRIO
// ==========================================

mesAnterior.addEventListener("click", () => {
  mesAtual.setMonth(mesAtual.getMonth() - 1);

  mostrarCalendario();
});

proximoMes.addEventListener("click", () => {
  mesAtual.setMonth(mesAtual.getMonth() + 1);

  mostrarCalendario();
});

botaoHoje.addEventListener("click", () => {
  dataSelecionada = new Date(hoje);
  mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  mostrarCalendario();
  mostrarAtividadesDia();
});

seletorMes.addEventListener("change", () => {
  mesAtual.setMonth(Number(seletorMes.value));

  mostrarCalendario();
});

seletorAno.addEventListener("change", () => {
  mesAtual.setFullYear(Number(seletorAno.value));

  mostrarCalendario();
});

// ==========================================
// CONFIGURAÇÕES DO CALENDÁRIO
// ==========================================

seletorFeriados.addEventListener("change", () => {
  mostrarFeriados = seletorFeriados.value === "mostrar";

  mostrarCalendario();
});

seletorInicio.addEventListener("change", () => {
  inicioSemana = Number(seletorInicio.value);

  mostrarCabecalhoSemana();
  mostrarCalendario();
});

// ==========================================
// INICIAR
// ==========================================

iniciarCalendario();
