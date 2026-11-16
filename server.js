require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Inicializa o Firebase usando a chave privada baixada do projeto Firebase.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
    throw new Error(
        "Configure FIREBASE_SERVICE_ACCOUNT_PATH no arquivo .env."
    );
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const postsCollection = db.collection("posts");

// Permite que o navegador acesse os arquivos do front-end.
app.use(express.static(path.join(__dirname, "public")));

// Rota principal: entrega o index.html.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", async (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // previousMessage: envia ao cliente as publicações já salvas.
    try {
        const snapshot = await postsCollection
            .orderBy("createdAt", "desc")
            .get();

        const posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            titulo: doc.data().titulo,
            texto: doc.data().texto,
            createdAt: doc.data().createdAt
                ? doc.data().createdAt.toDate().toISOString()
                : null
        }));

        socket.emit("previousMessage", posts);
    } catch (error) {
        console.error("Erro ao buscar publicações:", error);
        socket.emit("serverError", "Não foi possível carregar as publicações.");
    }

    // sendMessage: recebe uma nova publicação enviada pelo front-end.
    socket.on("sendMessage", async (post) => {
        try {
            const titulo = String(post?.titulo || "").trim();
            const texto = String(post?.texto || "").trim();

            if (!titulo || !texto) {
                socket.emit("serverError", "Preencha o título e o texto do post.");
                return;
            }

            const novoPost = {
                titulo,
                texto,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await postsCollection.add(novoPost);
            const salvo = await docRef.get();
            const dados = salvo.data();

            const postCriado = {
                id: docRef.id,
                titulo: dados.titulo,
                texto: dados.texto,
                createdAt: dados.createdAt
                    ? dados.createdAt.toDate().toISOString()
                    : new Date().toISOString()
            };

            // receivedMessage: avisa todos os clientes conectados.
            io.emit("receivedMessage", postCriado);
        } catch (error) {
            console.error("Erro ao salvar publicação:", error);
            socket.emit("serverError", "Não foi possível salvar o post no Firestore.");
        }
    });

    socket.on("disconnect", () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor iniciado: http://localhost:${PORT}`);
});