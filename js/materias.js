(() => {
  const chave = "materiasDisponiveis";

  const seletores = [
    document.getElementById("materia"),
    document.getElementById("materiaNota"),
  ].filter(Boolean);

  const campoNovaMateria = document.getElementById("novaMateria");
  const botaoAdicionar = document.getElementById("adicionarMateria");
  const listaMaterias = document.getElementById("listaMaterias");

  if (seletores.length === 0) return;

  const primeiroSelect = seletores[0];

  const textoInicial =
    primeiroSelect.options[0]?.value === ""
      ? primeiroSelect.options[0].textContent
      : "Selecione uma matéria";

  let materias;

  try {
    const salvas = JSON.parse(localStorage.getItem(chave));

    materias = Array.isArray(salvas)
      ? salvas.filter((m) => typeof m === "string" && m.trim() !== "")
      : null;
  } catch {
    materias = null;
  }

  // Na primeira utilização, recupera as opções do HTML.
  if (materias === null) {
    materias = Array.from(primeiroSelect.options)
      .filter((opcao) => opcao.value.trim() !== "")
      .map((opcao) => opcao.textContent.trim());
  }

  function salvarMaterias() {
    localStorage.setItem(chave, JSON.stringify(materias));
  }

  function atualizarSeletores() {
    seletores.forEach((select) => {
      const valorAnterior = select.value;

      select.replaceChildren(new Option(textoInicial, ""));

      materias.forEach((materia) => {
        select.add(new Option(materia, materia));
      });

      if (materias.includes(valorAnterior)) {
        select.value = valorAnterior;
      }
    });
  }

  function mostrarMaterias() {
    if (!listaMaterias) return;

    listaMaterias.replaceChildren();

    if (materias.length === 0) {
      const aviso = document.createElement("p");
      aviso.className = "text-secondary mb-0";
      aviso.textContent = "Nenhuma matéria cadastrada.";
      listaMaterias.appendChild(aviso);
      return;
    }

    materias.forEach((materia) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex justify-content-between align-items-center gap-2";

      const nome = document.createElement("span");
      nome.textContent = materia;

      const botaoRemover = document.createElement("button");
      botaoRemover.type = "button";
      botaoRemover.className = "btn btn-sm btn-outline-danger";
      botaoRemover.textContent = "Remover";

      botaoRemover.addEventListener("click", () => {
        const confirmar = confirm(
          `Deseja remover a matéria "${materia}" das opções?`,
        );

        if (!confirmar) return;

        materias = materias.filter((item) => item !== materia);

        salvarMaterias();
        atualizarSeletores();
        mostrarMaterias();
      });

      item.append(nome, botaoRemover);
      listaMaterias.appendChild(item);
    });
  }

  function adicionarMateria() {
    const nome = campoNovaMateria.value.trim();

    if (nome === "") {
      alert("Digite o nome da matéria.");
      return;
    }

    const jaExiste = materias.some(
      (materia) =>
        materia.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR"),
    );

    if (jaExiste) {
      alert("Essa matéria já está cadastrada.");
      return;
    }

    materias.push(nome);

    salvarMaterias();
    atualizarSeletores();
    mostrarMaterias();

    campoNovaMateria.value = "";
  }

  if (botaoAdicionar && campoNovaMateria) {
    botaoAdicionar.addEventListener("click", adicionarMateria);

    campoNovaMateria.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") {
        evento.preventDefault();
        adicionarMateria();
      }
    });
  }

  salvarMaterias();
  atualizarSeletores();
  mostrarMaterias();
})();
