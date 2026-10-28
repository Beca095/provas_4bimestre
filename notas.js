const formNota = document.getElementById("formNota");
const materiaNota = document.getElementById("materiaNota");
const valorNota = document.getElementById("valorNota");
const bimestreNota = document.getElementById("bimestreNota");

const listaNotas = document.getElementById("listaNotas");
const listaMedias = document.getElementById("listaMedias");
const mensagemVazia = document.getElementById("mensagemVazia");
const mensagemMedias = document.getElementById("mensagemMedias");

const totalNotas = document.getElementById("totalNotas");
const mediaGeral = document.getElementById("mediaGeral");

let notas = JSON.parse(localStorage.getItem("notasEscolares")) || [];

function salvarNotas() {
  localStorage.setItem("notasEscolares", JSON.stringify(notas));
}

function formatarNota(valor) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function mostrarNotas() {
  listaNotas.innerHTML = "";
  listaMedias.innerHTML = "";

  mensagemVazia.classList.toggle("d-none", notas.length > 0);
  mensagemMedias.classList.toggle("d-none", notas.length > 0);

  totalNotas.textContent = notas.length;

  if (notas.length === 0) {
    mediaGeral.textContent = "—";
  } else {
    const soma = notas.reduce((total, nota) => total + nota.valor, 0);
    mediaGeral.textContent = formatarNota(soma / notas.length);
  }

  notas.forEach(function (nota, indice) {
    const linha = document.createElement("tr");

    linha.appendChild(criarCelula(nota.materia));
    linha.appendChild(criarCelula(formatarNota(nota.valor)));
    linha.appendChild(criarCelula(nota.bimestre + "º bimestre"));

    const celulaAcao = document.createElement("td");
    const botaoExcluir = document.createElement("button");

    botaoExcluir.type = "button";
    botaoExcluir.className = "btn btn-outline-danger btn-sm";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", function () {
      notas.splice(indice, 1);
      salvarNotas();
      mostrarNotas();
    });

    celulaAcao.appendChild(botaoExcluir);
    linha.appendChild(celulaAcao);
    listaNotas.appendChild(linha);
  });

  const materias = {};

  notas.forEach(function (nota) {
    const chave = nota.materia.trim().toLocaleLowerCase("pt-BR");

    if (!materias[chave]) {
      materias[chave] = {
        nome: nota.materia,
        valores: [],
      };
    }

    materias[chave].valores.push(nota.valor);
  });

  Object.values(materias).forEach(function (materia) {
    const soma = materia.valores.reduce((total, valor) => total + valor, 0);
    const media = soma / materia.valores.length;

    const linha = document.createElement("tr");

    linha.appendChild(criarCelula(materia.nome));
    linha.appendChild(criarCelula(materia.valores.length));
    linha.appendChild(criarCelula(formatarNota(media)));

    const situacao = document.createElement("td");
    const etiqueta = document.createElement("span");

    if (media >= 6) {
      etiqueta.className = "badge text-bg-success";
      etiqueta.textContent = "Média igual ou acima de 6";
    } else {
      etiqueta.className = "badge text-bg-warning";
      etiqueta.textContent = "Média abaixo de 6";
    }

    situacao.appendChild(etiqueta);
    linha.appendChild(situacao);

    listaMedias.appendChild(linha);
  });
}

formNota.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const materia = materiaNota.value.trim();
  const valor = Number(valorNota.value);
  const bimestre = bimestreNota.value;

  if (
    materia === "" ||
    valorNota.value === "" ||
    !Number.isFinite(valor) ||
    valor < 0 ||
    valor > 10 ||
    !["1", "2", "3", "4"].includes(bimestre)
  ) {
    alert("Confira os dados. A nota deve estar entre 0 e 10.");
    return;
  }

  notas.push({
    materia: materia,
    valor: valor,
    bimestre: bimestre,
  });

  salvarNotas();
  mostrarNotas();
  formNota.reset();
});

mostrarNotas();
