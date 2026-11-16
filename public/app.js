$(function () {
    const socket = io();

    const $modal = $("#myModal");
    const $form = $("#frm_post");
    const $posts = $("#posts_container");
    const $formMessage = $("#form_message");

    // Abre e fecha o formulário modal.
    $("#btn_post").on("click", function () {
        $modal.show();
        $("#txt_titulo").trigger("focus");
    });

    $(".close").on("click", function () {
        $modal.hide();
        $formMessage.text("");
    });

    $(window).on("click", function (event) {
        if (event.target === $modal[0]) {
            $modal.hide();
            $formMessage.text("");
        }
    });

    function formatarData(data) {
        if (!data) return "";
        const dataObj = new Date(data);
        if (Number.isNaN(dataObj.getTime())) return "";
        return dataObj.toLocaleString("pt-BR");
    }

    // Cria o elemento do post usando text(), evitando interpretar HTML digitado.
    function renderPost(post, noInicio = true) {
        $("#loading_message").remove();

        const $card = $("<article>").addClass("post_container").attr("data-id", post.id || "");
        $("<h3>").text(post.titulo).appendTo($card);
        $("<p>").text(post.texto).appendTo($card);

        const data = formatarData(post.createdAt);
        if (data) {
            $("<span>").text(data).appendTo($card);
        }

        if (noInicio) {
            $posts.prepend($card);
        } else {
            $posts.append($card);
        }
    }

    // previousMessage: recebe e mostra os posts antigos do Firestore.
    socket.on("previousMessage", function (posts) {
        $posts.empty();

        if (!posts || posts.length === 0) {
            $("<p>").attr("id", "empty_message")
                .text("Ainda não há publicações. Seja o primeiro a postar!")
                .appendTo($posts);
            return;
        }

        posts.forEach(function (post) {
            renderPost(post, false);
        });
    });

    // receivedMessage: mostra uma nova publicação em tempo real.
    socket.on("receivedMessage", function (post) {
        $("#empty_message").remove();
        renderPost(post, true);
    });

    socket.on("serverError", function (message) {
        $formMessage.text(message);
    });

    // Envia os dados do formulário para o servidor.
    $form.on("submit", function (event) {
        event.preventDefault();

        const titulo = $("#txt_titulo").val().trim();
        const texto = $("#txt_post").val().trim();

        if (!titulo || !texto) {
            $formMessage.text("Preencha o título e o texto do post.");
            return;
        }

        $("#btn_postar").prop("disabled", true).text("ENVIANDO...");
        $formMessage.text("");

        // sendMessage: o back-end salvará o post no Firestore.
        socket.emit("sendMessage", { titulo: titulo, texto: texto });

        // A publicação aparecerá quando o servidor emitir receivedMessage.
        // O botão é reabilitado após um pequeno intervalo para permitir novo envio.
        setTimeout(function () {
            $("#btn_postar").prop("disabled", false).text("POSTAR");
        }, 1000);

        $form[0].reset();
        $modal.hide();
    });
});