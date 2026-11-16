# Atividade BD3 - Rede Social com Firebase Firestore

Projeto desenvolvido a partir do front-end disponibilizado pelo professor, acrescentando o back-end solicitado no enunciado.

## Tecnologias

- Node.js
- Express
- Nodemon
- Firebase Admin SDK / Cloud Firestore
- Socket.IO
- jQuery (CDN)

## 1. Pré-requisitos

Instale o Node.js (versão LTS) e tenha uma conta Google para acessar o Firebase.

## 2. Configurar o Firestore

1. Acesse https://console.firebase.google.com/
2. Crie um projeto (ou use um projeto Firebase que você já tenha).
3. No menu do projeto, abra **Firestore Database** e crie o banco de dados.
4. Nas configurações do projeto, entre em **Contas de serviço**.
5. Gere uma nova chave privada e baixe o arquivo JSON.
6. Coloque esse arquivo na pasta principal do projeto e renomeie para `serviceAccountKey.json`.

**Importante:** não envie esse arquivo para o GitHub. Ele contém credenciais privadas e já está protegido pelo `.gitignore`.

## 3. Configurar as variáveis

Faça uma cópia do arquivo `.env.example` com o nome `.env`.

O conteúdo deve ficar assim:

```env
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

Confira se o arquivo `serviceAccountKey.json` está na mesma pasta do `server.js`.

## 4. Instalar os pacotes

Abra o terminal do VS Code na pasta do projeto e execute:

```bash
npm install
```

## 5. Executar

Para iniciar em modo de desenvolvimento:

```bash
npm run dev
```

Ou para iniciar normalmente:

```bash
npm start
```

Abra no navegador:

http://localhost:3000

## 6. Como funciona a comunicação

- **connection:** quando o navegador conecta ao servidor Socket.IO, o back-end busca as publicações no Firestore.
- **previousMessage:** o servidor envia ao navegador a lista de publicações já cadastradas.
- **sendMessage:** o front-end envia o título e o texto do formulário ao back-end.
- **receivedMessage:** depois de salvar no Firestore, o servidor transmite a nova publicação para todos os navegadores conectados.

As publicações ficam na coleção `posts` do Firestore.

## 7. Estrutura do projeto

```text
bd3-atv-rede-social/
├── public/
│   ├── images/
│   │   └── rede.png
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Observação para a entrega

Antes de publicar no GitHub, confirme que `.env`, `serviceAccountKey.json` e `node_modules` não foram enviados. O repositório deve conter o código-fonte e as instruções, nunca a chave privada do Firebase.
