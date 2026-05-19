document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // ACESSIBILIDADE - REDIMENSIONAMENTO DE FONTE E ALTERNAÇÃO DE TEMA
    // ==========================================================================
    const btnAumentar = document.getElementById("btn-aumentar");
    const btnDiminuir = document.getElementById("btn-diminuir");
    const btnTema = document.getElementById("btn-tema");
    
    let porcentagemFonte = 100;

    btnAumentar.addEventListener("click", () => {
        if (porcentagemFonte < 130) {
            porcentagemFonte += 10;
            document.documentElement.style.fontSize = `${porcentagemFonte}%`;
        }
    });

    btnDiminuir.addEventListener("click", () => {
        if (porcentagemFonte > 80) {
            porcentagemFonte -= 10;
            document.documentElement.style.fontSize = `${porcentagemFonte}%`;
        }
    });

    btnTema.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });

    // ==========================================================================
    // SÍNTESE DE VOZ (SPEECH SYNTHESIS API) - CONTEÚDO PRINCIPAL EXCLUSIVO
    // ==========================================================================
    const btnLer = document.getElementById("btn-ler");
    const btnParar = document.getElementById("btn-parar");
    const areaLeitura = document.getElementById("conteudo-principal");
    
    const sinteseVoz = window.speechSynthesis;
    let controleSintese = null;

    if (!sinteseVoz) {
        btnLer.style.display = "none";
    } else {
        btnLer.addEventListener("click", () => {
            if (sinteseVoz.speaking) {
                sinteseVoz.cancel();
            }

            // Captura apenas elementos textuais semânticos, ignorando estruturais ou invisíveis
            const nosTexto = areaLeitura.querySelectorAll("p, h2, h3, blockquote");
            let textoEstruturado = "";

            nosTexto.forEach(no => {
                // Filtra para ignorar textos internos de containers de imagens ou accordions fechados
                if (!no.closest(".imagem") && !no.closest("details:not([open])")) {
                    textoEstruturado += no.innerText + ". ";
                }
            });

            controleSintese = new SpeechSynthesisUtterance(textoEstruturado);
            controleSintese.lang = "pt-BR";
            controleSintese.rate = 1.0;

            controleSintese.onstart = () => {
                btnLer.hidden = true;
                btnParar.hidden = false;
                areaLeitura.classList.add("elemento-leitura-ativa");
            };

            controleSintese.onend = () => {
                resetarInterfaceVoz();
            };

            controleSintese.onerror = () => {
                resetarInterfaceVoz();
            };

            sinteseVoz.speak(controleSintese);
        });

        btnParar.addEventListener("click", () => {
            if (sinteseVoz.speaking) {
                sinteseVoz.cancel();
            }
            resetarInterfaceVoz();
        });
    }

    function resetarInterfaceVoz() {
        btnLer.hidden = false;
        btnParar.hidden = true;
        areaLeitura.classList.remove("elemento-leitura-ativa");
    }

    // Garante interrupção da fala caso o usuário feche a aba
    window.addEventListener("beforeunload", () => {
        if (sinteseVoz && sinteseVoz.speaking) {
            sinteseVoz.cancel();
        }
    });

    // ==========================================================================
    // CAPTURA E PROCESSAMENTO DO FORMULÁRIO LATERAL
    // ==========================================================================
    const formInscricao = document.getElementById("form-inscricao");
    const statusInscricao = document.getElementById("status-inscricao");

    formInscricao.addEventListener("submit", (evento) => {
        evento.preventDefault();
        
        statusInscricao.innerText = "Inscrição realizada com sucesso! Verifique seu e-mail.";
        statusInscricao.hidden = false;
        formInscricao.reset();
        
        setTimeout(() => {
            statusInscricao.hidden = true;
        }, 5000);
    });

    // ==========================================================================
    // SEÇÃO DE COMENTÁRIOS COM SANITIZAÇÃO DE INPUT (ANTI-XSS)
    // ==========================================================================
    const formComentario = document.getElementById("form-comentario");
    const campoComentario = document.getElementById("campo-comentario");
    const listaComentarios = document.getElementById("lista-comentarios");

    formComentario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const textoPuro = campoComentario.value.trim();

        if (textoPuro) {
            const blocoComentario = document.createElement("div");
            blocoComentario.className = "comentario-item";

            const dataString = new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            // Inserção segura tratando caracteres especiais para mitigar XSS
            blocoComentario.innerHTML = `
                <div class="comentario-data">Visitante • ${dataString}</div>
                <p>${sanitizarTexto(textoPuro)}</p>
            `;

            // Adiciona o novo comentário sempre no topo da lista
            listaComentarios.insertBefore(blocoComentario, listaComentarios.firstChild);
            campoComentario.value = "";
        }
    });

    function sanitizarTexto(string) {
        return string.replace(/[&<>'"]/g, caractere => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[caractere] || caractere));
    }
});