const express = require("express"); // Importa o framework Express
const exphbs = require("express-handlebars"); // Importa o template engine Handlebars
const session = require("express-session"); // Importa o middleware de sessão do Express
const FileStore = require("session-file-store")(session); // Importa o armazenamento de sessão em arquivos
const flash = require("express-flash"); // Importa o middleware para mensagens flash

const app = express(); // Cria uma aplicação Express

const conn = require("./db/conn"); // Importa a conexão com o banco de dados

const Tought = require("./models/Tought"); // Importa o modelo Tought
const User = require("./models/User"); // Importa o modelo User

const toughtsRoutes = require("./routes/toughtsRoutes"); // Importa as rotas de Toughts
const authRoutes = require("./routes/authRoutes");
const ToughtController = require("./controllers/ToughtController"); // Importa o controlador de Toughts
const { checkAuth } = require("./helpers/auth");

// Configura o template engine Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Middleware para interpretar dados de formulários e JSON
app.use(express.urlencoded({ extend: true })); // Interpreta dados de formulários
app.use(express.json()); // Interpreta dados JSON

// Middleware para servir arquivos estáticos
app.use(express.static("public")); // Define a pasta "public" para arquivos estáticos

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
app.use(flash()); // Configura o middleware para mensagens flash

// Middleware para adicionar a sessão às variáveis locais da resposta
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session; // Adiciona a sessão às variáveis locais se o usuário estiver logado
  }

  next(); // Passa para o próximo middleware
});

app.use("/toughts", toughtsRoutes); // Define as rotas para "/toughts"
app.use("/", authRoutes);

app.get("/", ToughtController.showToughts); // Define a rota para a página inicial

// Sincroniza a conexão com o banco de dados e inicia o servidor
conn
  //.sync({ force: true })
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log(`Aplicação iniciada com sucesso!`); // Inicia o servidor na porta 3000
    });
  })
  .catch((err) => console.error(err)); // Loga erros de conexão
