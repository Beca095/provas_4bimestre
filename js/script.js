const formulario = document.getElementById("formTarefa");
const campoMateria = document.getElementById("materia");
const campoDescricao = document.getElementById("descricao");
const campoPrazo = document.getElementById("prazo");
const campoPrioridade = document.getElementById("prioridade");

const listaTarefas = document.getElementById("listaTarefas");
const mensagemVazia = document.getElementById("mensagemVazia");

const totalTarefas = document.getElementById("totalTarefas");
const tarefasPendentes = document.getElementById("tarefasPendentes");
const tarefasConcluidas = document.getElementById("tarefasConcluidas");

const botoesFiltro = document.querySelectorAll(".filtro");

// Recupera as tarefas salvas
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";

// Mostra a data atual
const elementoData = document.getElementById("dataAtual");

if (elementoData) {
  const hoje = new Date();

  elementoData.textContent = hoje.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  if (campoPrazo) {
    campoPrazo.min = `${ano}-${mes}-${dia}`;
  }
}

function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function atualizarContadores() {
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
  const pendentes = tarefas.length - concluidas;

  if (totalTarefas) totalTarefas.textContent = tarefas.length;
  if (tarefasPendentes) tarefasPendentes.textContent = pendentes;
  if (tarefasConcluidas) tarefasConcluidas.textContent = concluidas;
}

function formatarData(data) {
  const partes = data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function criarTexto(tag, texto, classe = "") {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;
  elemento.className = classe;
  return elemento;
}

function atualizarBotoesFiltro() {
  botoesFiltro.forEach((botao) => {
    const selecionado = botao.dataset.filtro === filtroAtual;

    botao.classList.toggle("btn-dark", selecionado);
    botao.classList.toggle("btn-outline-dark", !selecionado);

    botao.setAttribute("aria-pressed", String(selecionado));
  });
}

function mostrarTarefas() {
  if (!listaTarefas || !mensagemVazia) return;

  listaTarefas.replaceChildren();

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroAtual === "pendentes") {
      return !tarefa.concluida;
    }

    if (filtroAtual === "concluidas") {
      return tarefa.concluida;
    }

    return true;
  });

  mensagemVazia.classList.toggle("d-none", tarefasFiltradas.length > 0);

  if (tarefasFiltradas.length === 0) {
    mensagemVazia.textContent =
      tarefas.length === 0
        ? "Você ainda não tem tarefas cadastradas."
        : "Nenhuma tarefa encontrada neste filtro.";
  }

  tarefasFiltradas.forEach((tarefa) => {
    const item = document.createElement("div");
    item.className = "list-group-item p-3";

    const linha = document.createElement("div");
    linha.className =
      "d-flex flex-column flex-md-row justify-content-between gap-3";

    const conteudo = document.createElement("div");
    conteudo.className = "flex-grow-1";

    // Checkbox para concluir a tarefa
    const linhaTitulo = document.createElement("div");
    linhaTitulo.className = "d-flex align-items-center gap-2 mb-2";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input mt-0";
    checkbox.checked = tarefa.concluida;
    checkbox.setAttribute("aria-label", "Marcar tarefa como concluída");

    checkbox.addEventListener("change", () => {
      tarefa.concluida = checkbox.checked;

      salvarTarefas();
      atualizarContadores();
      mostrarTarefas();
    });

    const titulo = criarTexto("h3", tarefa.descricao, "h6 mb-0");

    if (tarefa.concluida) {
      titulo.classList.add("text-decoration-line-through", "text-secondary");
    }

    linhaTitulo.append(checkbox, titulo);

    const detalhes = criarTexto(
      "p",
      `${tarefa.materia} | Prazo: ${formatarData(tarefa.prazo)}`,
      "small text-secondary mb-2",
    );

    let classePrioridade = "text-bg-secondary";

    if (tarefa.prioridade === "Alta") {
      classePrioridade = "text-bg-danger";
    } else if (tarefa.prioridade === "Média") {
      classePrioridade = "text-bg-warning";
    } else if (tarefa.prioridade === "Baixa") {
      classePrioridade = "text-bg-success";
    }

    const etiqueta = criarTexto(
      "span",
      `Prioridade: ${tarefa.prioridade}`,
      `badge ${classePrioridade}`,
    );

    conteudo.append(linhaTitulo, detalhes, etiqueta);

    const botaoExcluir = criarTexto(
      "button",
      "Excluir",
      "btn btn-outline-danger btn-sm align-self-start",
    );

    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", () => {
      tarefas = tarefas.filter((item) => item.id !== tarefa.id);

      salvarTarefas();
      atualizarContadores();
      mostrarTarefas();
    });

    linha.append(conteudo, botaoExcluir);
    item.appendChild(linha);
    listaTarefas.appendChild(item);
  });
}

if (formulario) {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const novaTarefa = {
      id: Date.now(),
      materia: campoMateria.value,
      descricao: campoDescricao.value.trim(),
      prazo: campoPrazo.value,
      prioridade: campoPrioridade.value,
      concluida: false,
    };

    if (
      novaTarefa.descricao === "" ||
      novaTarefa.prazo === "" ||
      novaTarefa.materia === ""
    ) {
      return;
    }

    tarefas.push(novaTarefa);

    salvarTarefas();
    atualizarContadores();

    filtroAtual = "todas";
    atualizarBotoesFiltro();
    mostrarTarefas();

    formulario.reset();

    if (campoPrioridade) {
      campoPrioridade.value = "Média";
    }
  });
}

botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    filtroAtual = botao.dataset.filtro;

    atualizarBotoesFiltro();
    mostrarTarefas();
  });
});

// Inicializa a lista de tarefas
atualizarContadores();
atualizarBotoesFiltro();
mostrarTarefas();

const tempoCronometro = document.getElementById("tempoCronometro");
const modoCronometro = document.getElementById("modoCronometro");

const iniciarCronometro = document.getElementById("iniciarCronometro");
const pausarCronometro = document.getElementById("pausarCronometro");
const reiniciarCronometro = document.getElementById("reiniciarCronometro");

const modoPausa = document.getElementById("modoPausa");
const voltarEstudo = document.getElementById("voltarEstudo");

let tempoInicial = 25 * 60;
let tempoRestante = tempoInicial;
let intervaloCronometro = null;

function atualizarCronometro() {
  if (!tempoCronometro) return;

  const minutos = Math.floor(tempoRestante / 60);
  const segundos = tempoRestante % 60;

  tempoCronometro.textContent =
    String(minutos).padStart(2, "0") + ":" + String(segundos).padStart(2, "0");
}

function iniciarContagem() {
  if (intervaloCronometro !== null || tempoRestante <= 0) {
    return;
  }

  intervaloCronometro = setInterval(() => {
    tempoRestante--;

    atualizarCronometro();

    if (tempoRestante <= 0) {
      clearInterval(intervaloCronometro);
      intervaloCronometro = null;

      alert("Tempo encerrado!");
    }
  }, 1000);
}

function pausarContagem() {
  clearInterval(intervaloCronometro);
  intervaloCronometro = null;
}

function reiniciarContagem() {
  pausarContagem();

  tempoRestante = tempoInicial;
  atualizarCronometro();
}

function selecionarEstudo() {
  pausarContagem();

  tempoInicial = 25 * 60;
  tempoRestante = tempoInicial;

  if (modoCronometro) {
    modoCronometro.textContent = "Tempo de estudo";
  }

  atualizarCronometro();
}

function selecionarPausa() {
  pausarContagem();

  tempoInicial = 5 * 60;
  tempoRestante = tempoInicial;

  if (modoCronometro) {
    modoCronometro.textContent = "Tempo de pausa";
  }

  atualizarCronometro();
}

if (iniciarCronometro) {
  iniciarCronometro.addEventListener("click", iniciarContagem);
}

if (pausarCronometro) {
  pausarCronometro.addEventListener("click", pausarContagem);
}

if (reiniciarCronometro) {
  reiniciarCronometro.addEventListener("click", reiniciarContagem);
}

if (modoPausa) {
  modoPausa.addEventListener("click", selecionarPausa);
}

if (voltarEstudo) {
  voltarEstudo.addEventListener("click", selecionarEstudo);
}

atualizarCronometro();

const formAnotacao = document.getElementById("formAnotacao");
const tituloAnotacao = document.getElementById("tituloAnotacao");
const textoAnotacao = document.getElementById("textoAnotacao");
const listaAnotacoes = document.getElementById("listaAnotacoes");
const mensagemAnotacoes = document.getElementById("mensagemAnotacoes");

let anotacoes = JSON.parse(localStorage.getItem("minhasAnotacoes")) || [];

function salvarAnotacoes() {
  localStorage.setItem("minhasAnotacoes", JSON.stringify(anotacoes));
}

function mostrarAnotacoes() {
  if (!listaAnotacoes || !mensagemAnotacoes) return;

  listaAnotacoes.replaceChildren();

  mensagemAnotacoes.classList.toggle("d-none", anotacoes.length > 0);

  anotacoes.forEach((anotacao) => {
    const coluna = document.createElement("div");
    coluna.className = "col-md-6 col-lg-4";

    const cartao = document.createElement("div");
    cartao.className = "card h-100 border-0 shadow-sm";
    cartao.style.backgroundColor = "#F5F0D5";

    const corpo = document.createElement("div");
    corpo.className = "card-body";

    const titulo = document.createElement("h5");
    titulo.className = "card-title fw-bold";
    titulo.style.color = "#172554";
    titulo.textContent = anotacao.titulo;

    const texto = document.createElement("p");
    texto.className = "card-text";
    texto.textContent = anotacao.texto;

    const data = document.createElement("small");
    data.className = "text-secondary d-block mb-3";
    data.textContent = anotacao.data;

    const botoes = document.createElement("div");
    botoes.className = "d-flex gap-2";

    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.className = "btn btn-sm btn-outline-primary";
    botaoEditar.textContent = "Editar";

    botaoEditar.addEventListener("click", () => {
      const novoTitulo = prompt("Digite o novo título:", anotacao.titulo);

      if (novoTitulo === null) return;

      const novoTexto = prompt("Digite o novo texto:", anotacao.texto);

      if (novoTexto === null) return;

      if (novoTitulo.trim() === "" || novoTexto.trim() === "") {
        alert("Preencha o título e o texto.");
        return;
      }

      anotacao.titulo = novoTitulo.trim();
      anotacao.texto = novoTexto.trim();

      salvarAnotacoes();
      mostrarAnotacoes();
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "btn btn-sm btn-outline-danger";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", () => {
      anotacoes = anotacoes.filter((item) => item.id !== anotacao.id);

      salvarAnotacoes();
      mostrarAnotacoes();
    });

    botoes.append(botaoEditar, botaoExcluir);
    corpo.append(titulo, texto, data, botoes);
    cartao.appendChild(corpo);
    coluna.appendChild(cartao);

    listaAnotacoes.appendChild(coluna);
  });
}

if (formAnotacao) {
  formAnotacao.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const titulo = tituloAnotacao.value.trim();
    const texto = textoAnotacao.value.trim();

    if (titulo === "" || texto === "") {
      return;
    }

    const novaAnotacao = {
      id: Date.now(),
      titulo: titulo,
      texto: texto,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    anotacoes.push(novaAnotacao);

    salvarAnotacoes();
    mostrarAnotacoes();

    formAnotacao.reset();
  });
}

mostrarAnotacoes();
