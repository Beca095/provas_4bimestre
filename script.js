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

// Carrega as tarefas salvas no navegador
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";

// Mostra a data atual
const hoje = new Date();

document.getElementById("dataAtual").textContent = hoje.toLocaleDateString(
  "pt-BR",
  {
    day: "2-digit",
    month: "long",
    year: "numeric",
  },
);

// Define a data mínima como hoje
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

campoPrazo.min = `${ano}-${mes}-${dia}`;

// Salva as tarefas no navegador
function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Atualiza os números do painel
function atualizarContadores() {
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;

  const pendentes = tarefas.length - concluidas;

  totalTarefas.textContent = tarefas.length;
  tarefasPendentes.textContent = pendentes;
  tarefasConcluidas.textContent = concluidas;
}

// Formata a data da tarefa
function formatarData(data) {
  const partes = data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Cria um elemento de texto
function criarTexto(tag, texto, classe = "") {
  const elemento = document.createElement(tag);

  elemento.textContent = texto;
  elemento.className = classe;

  return elemento;
}

// Mostra as tarefas na página
function mostrarTarefas() {
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
    if (tarefas.length === 0) {
      mensagemVazia.textContent = "Você ainda não tem tarefas cadastradas.";
    } else {
      mensagemVazia.textContent = "Nenhuma tarefa encontrada neste filtro.";
    }
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

    checkbox.addEventListener("change", function () {
      tarefa.concluida = checkbox.checked;

      salvarTarefas();
      atualizarContadores();
      mostrarTarefas();
    });

    const titulo = criarTexto("h3", tarefa.descricao, "h6 mb-0");

    if (tarefa.concluida) {
      titulo.classList.add("text-decoration-line-through");
      titulo.classList.add("text-secondary");
    }

    linhaTitulo.append(checkbox, titulo);

    // Informações da tarefa
    const detalhes = criarTexto(
      "p",
      `${tarefa.materia} | Prazo: ${formatarData(tarefa.prazo)}`,
      "small text-secondary mb-2",
    );

    // Etiqueta de prioridade
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

    // Botão para excluir a tarefa
    const botaoExcluir = criarTexto(
      "button",
      "Excluir",
      "btn btn-outline-danger btn-sm align-self-start",
    );

    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", function () {
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

// Adiciona uma nova tarefa
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const novaTarefa = {
    id: Date.now(),
    materia: campoMateria.value,
    descricao: campoDescricao.value.trim(),
    prazo: campoPrazo.value,
    prioridade: campoPrioridade.value,
    concluida: false,
  };

  if (novaTarefa.descricao === "" || novaTarefa.prazo === "") {
    return;
  }

  tarefas.push(novaTarefa);

  salvarTarefas();
  atualizarContadores();

  filtroAtual = "todas";
  atualizarBotoesFiltro();
  mostrarTarefas();

  formulario.reset();
  campoPrioridade.value = "Média";
});

// Alterna entre os filtros
botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", function () {
    filtroAtual = botao.dataset.filtro;

    atualizarBotoesFiltro();
    mostrarTarefas();
  });
});

// Destaca o filtro selecionado

function atualizarBotoesFiltro() {
  botoesFiltro.forEach((botao) => {
    const selecionado = botao.dataset.filtro === filtroAtual;

    botao.classList.toggle("btn-primary", false);
    botao.classList.toggle("btn-outline-primary", false);

    botao.classList.toggle("btn-dark", selecionado);
    botao.classList.toggle("btn-outline-dark", !selecionado);

    botao.setAttribute("aria-pressed", String(selecionado));
  });
}

const formAnotacao = document.getElementById("formAnotacao");
const tituloAnotacao = document.getElementById("tituloAnotacao");
const textoAnotacao = document.getElementById("textoAnotacao");
const listaAnotacoes = document.getElementById("listaAnotacoes");
const mensagemAnotacoes = document.getElementById("mensagemAnotacoes");

// Carrega as anotações salvas
let anotacoes = JSON.parse(localStorage.getItem("minhasAnotacoes")) || [];

// Salva a lista completa no navegador
function salvarAnotacoes() {
  localStorage.setItem("minhasAnotacoes", JSON.stringify(anotacoes));
}

// Mostra todas as anotações
function mostrarAnotacoes() {
  listaAnotacoes.replaceChildren();

  mensagemAnotacoes.classList.toggle("d-none", anotacoes.length > 0);

  anotacoes.forEach(function (anotacao) {
    const coluna = document.createElement("div");
    coluna.className = "col-12 col-md-6 col-lg-4";

    const cartao = document.createElement("div");
    cartao.className = "card h-100 border-0 shadow-sm";
    cartao.style.backgroundColor = "#F5F0D5";

    const corpo = document.createElement("div");
    corpo.className = "card-body d-flex flex-column";

    const titulo = document.createElement("h3");
    titulo.className = "h6";
    titulo.textContent = anotacao.titulo;
    titulo.style.color = "#172554";

    const texto = document.createElement("p");
    texto.className = "mb-3";
    texto.style.whiteSpace = "pre-wrap";
    texto.textContent = anotacao.texto;

    const data = document.createElement("small");
    data.className = "text-secondary mb-3";
    data.textContent = anotacao.data;

    const botoes = document.createElement("div");
    botoes.className = "d-flex gap-2 mt-auto";

    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.className = "btn btn-sm btn-outline-dark";
    botaoEditar.textContent = "Editar";

    botaoEditar.addEventListener("click", function () {
      const novoTitulo = prompt("Edite o título:", anotacao.titulo);

      if (novoTitulo === null) return;

      const novoTexto = prompt("Edite o conteúdo:", anotacao.texto);

      if (novoTexto === null) return;

      if (novoTitulo.trim() === "" || novoTexto.trim() === "") {
        alert("O título e o conteúdo não podem ficar vazios.");
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

    botaoExcluir.addEventListener("click", function () {
      const confirmar = confirm("Deseja excluir esta anotação?");

      if (!confirmar) return;

      anotacoes = anotacoes.filter(function (item) {
        return item.id !== anotacao.id;
      });

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

// Cria uma nova anotação sem apagar as anteriores
formAnotacao.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const novaAnotacao = {
    id: Date.now(),
    titulo: tituloAnotacao.value.trim(),
    texto: textoAnotacao.value.trim(),
    data: new Date().toLocaleDateString("pt-BR"),
  };

  if (novaAnotacao.titulo === "" || novaAnotacao.texto === "") {
    return;
  }

  anotacoes.push(novaAnotacao);

  salvarAnotacoes();
  mostrarAnotacoes();

  formAnotacao.reset();
});

// Exibe as anotações que já estavam salvas
mostrarAnotacoes();

// Inicia o organizador com as tarefas salvas
atualizarContadores();
atualizarBotoesFiltro();
mostrarTarefas();
