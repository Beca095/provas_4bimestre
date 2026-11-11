(() => {
  // Recupera os dados salvos no navegador
  function recuperarDados(chave) {
    try {
      const dados = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  const notas = recuperarDados("notasEscolares");
  const tarefas = recuperarDados("tarefas");

  // Elementos dos indicadores
  const mediaGeral = document.getElementById("mediaGeral");
  const totalNotas = document.getElementById("totalNotas");
  const totalMaterias = document.getElementById("totalMaterias");
  const totalConcluidas = document.getElementById("totalConcluidas");

  function formatarNota(valor) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  }

  // Agrupa as notas por matéria
  const materias = {};

  notas.forEach((nota) => {
    const valor = Number(nota.valor);

    if (
      typeof nota.materia !== "string" ||
      !Number.isFinite(valor) ||
      valor < 0 ||
      valor > 10
    ) {
      return;
    }

    const chave = nota.materia.trim().toLocaleLowerCase("pt-BR");

    if (!chave) return;

    if (!materias[chave]) {
      materias[chave] = {
        nome: nota.materia.trim(),
        valores: [],
      };
    }

    materias[chave].valores.push(valor);
  });

  const materiasValidas = Object.values(materias);

  const quantidadeNotas = materiasValidas.reduce(
    (total, materia) => total + materia.valores.length,
    0,
  );

  const somaNotas = materiasValidas.reduce(
    (total, materia) =>
      total + materia.valores.reduce((soma, valor) => soma + valor, 0),
    0,
  );

  const media = quantidadeNotas > 0 ? somaNotas / quantidadeNotas : null;

  mediaGeral.textContent = media === null ? "—" : formatarNota(media);

  totalNotas.textContent = quantidadeNotas;
  totalMaterias.textContent = materiasValidas.length;

  // Calcula as tarefas
  const tarefasValidas = tarefas.filter(
    (tarefa) => tarefa && typeof tarefa.concluida === "boolean",
  );

  const concluidas = tarefasValidas.filter((tarefa) => tarefa.concluida).length;

  totalConcluidas.textContent = concluidas;

  // Gráfico de desempenho por matéria
  if (quantidadeNotas > 0) {
    const nomesMaterias = materiasValidas.map((materia) => materia.nome);

    const mediasMaterias = materiasValidas.map((materia) => {
      const soma = materia.valores.reduce((total, valor) => total + valor, 0);

      return Number((soma / materia.valores.length).toFixed(2));
    });

    document.getElementById("mensagemMaterias").style.display = "none";
    document.getElementById("areaGraficoMaterias").style.display = "block";

    new Chart(document.getElementById("graficoMaterias"), {
      type: "bar",

      data: {
        labels: nomesMaterias,

        datasets: [
          {
            label: "Média",
            data: mediasMaterias,
            backgroundColor: "#233766",
            borderRadius: 6,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
            },
          },
        },

        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  // Calcula a média de cada bimestre
  const bimestres = [1, 2, 3, 4].map((numero) => {
    const notasBimestre = notas.filter((nota) => {
      const valor = Number(nota.valor);

      return (
        Number(nota.bimestre) === numero &&
        Number.isFinite(valor) &&
        valor >= 0 &&
        valor <= 10
      );
    });

    if (notasBimestre.length === 0) {
      return null;
    }

    const soma = notasBimestre.reduce(
      (total, nota) => total + Number(nota.valor),
      0,
    );

    return Number((soma / notasBimestre.length).toFixed(2));
  });

  if (bimestres.some((valor) => valor !== null)) {
    document.getElementById("mensagemBimestres").style.display = "none";
    document.getElementById("areaGraficoBimestres").style.display = "block";

    new Chart(document.getElementById("graficoBimestres"), {
      type: "line",

      data: {
        labels: ["1º bimestre", "2º bimestre", "3º bimestre", "4º bimestre"],

        datasets: [
          {
            label: "Média",
            data: bimestres,
            borderColor: "#233766",
            backgroundColor: "rgba(35, 55, 102, 0.12)",
            fill: true,
            tension: 0.3,
            spanGaps: false,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
            },
          },
        },
      },
    });
  }

  // Gráfico de tarefas concluídas e pendentes
  if (tarefasValidas.length > 0) {
    const pendentes = tarefasValidas.length - concluidas;

    document.getElementById("mensagemTarefas").style.display = "none";
    document.getElementById("areaGraficoTarefas").style.display = "block";

    new Chart(document.getElementById("graficoTarefas"), {
      type: "doughnut",

      data: {
        labels: ["Concluídas", "Pendentes"],

        datasets: [
          {
            data: [concluidas, pendentes],
            backgroundColor: ["#233766", "#b8c7e0"],
            borderWidth: 0,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }
})();
