const express = require("express"); // Importa o framework Express
const exphbs = require("express-handlebars"); // Importa o template engine Handlebars
const session = require("express-session"); // Importa o middleware de sessão do Express
const FileStore = require("session-file-store")(session); // Importa o armazenamento de sessão em arquivos
const flash = require("express-flash"); // Importa o middleware para mensagens flash

const app = express(); // Cria uma aplicação Express

const conn = require("./db/conn"); // Importa a conexão com o banco de dados

// Configura o template engine Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Middleware para interpretar dados de formulários e JSON
app.use(express.urlencoded({ extend: true }));
app.use(express.json());

// Middleware para servir arquivos estáticos
app.use(express.static("public"));

// Configuração da sessão
app.use(
  session({
    name: "session", // Nome do cookie da sessão
    secret: process.env.SECRET_KEY, // Chave secreta para assinar o cookie da sessão
    resave: false, // Não salva a sessão se ela não foi modificada
    saveUninitialized: false, // Não cria uma sessão nova se ela não estiver inicializada
    store: new FileStore({
      logFn: function () {}, // Função de log (vazia)
      path: require("path").join(require("os").tmpdir(), "sessions"), // Caminho para armazenar os arquivos de sessão
    }),
    cookie: {
      secure: false, // Cookie não será enviado em conexões HTTPS
      maxAge: 360000, // Tempo de vida do cookie em milissegundos
      expires: new Date(Date.now() + 360000), // Data de expiração do cookie
      httpOnly: true, // Cookie não acessível via JavaScript no navegador
    },
  })
);

// Middleware para mensagens flash
app.use(flash());

// Middleware para adicionar a sessão às variáveis locais da resposta
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session;
  }

  next();
});

// Sincroniza a conexão com o banco de dados e inicia o servidor
conn
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log(`Aplicação iniciada com sucesso!`);
    });
  })
  .catch((err) => console.error(err));
