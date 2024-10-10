const express = require("express"); // Importa o framework Express
const exphbs = require("express-handlebars"); // Importa o template engine Handlebars
const session = require("express-session"); // Middleware de sessão do Express
const FileStore = require("session-file-store")(session); // Armazenamento de sessão em arquivos
const flash = require("express-flash"); // Middleware para mensagens flash

const app = express(); // Cria uma aplicação Express

const conn = require("./db/conn"); // Conexão com o banco de dados

const Tought = require("./models/Tought"); // Modelo Tought
const User = require("./models/User"); // Modelo User

const toughtsRoutes = require("./routes/toughtsRoutes"); // Rotas de pensamentos (Toughts)
const authRoutes = require("./routes/authRoutes"); // Rotas de autenticação
const ToughtController = require("./controllers/ToughtController"); // Controlador de Toughts
const { checkAuth } = require("./helpers/auth"); // Middleware de autenticação

// Configuração do template engine Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Middleware para interpretar dados de formulários e JSON
app.use(express.urlencoded({ extend: true })); // Interpreta dados de formulários (x-www-form-urlencoded)
app.use(express.json()); // Interpreta dados JSON

// Middleware para servir arquivos estáticos
app.use(express.static("public")); // Define a pasta "public" para arquivos estáticos

// Configuração da sessão
app.use(
  session({
    name: "session", // Nome do cookie da sessão
    secret: process.env.SECRET_KEY, // Chave secreta para assinar o cookie da sessão
    resave: false, // Evita salvar a sessão se ela não foi modificada
    saveUninitialized: false, // Não cria uma sessão nova se ela não estiver inicializada
    store: new FileStore({
      logFn: function () {}, // Função de log (vazia)
      path: require("path").join(require("os").tmpdir(), "sessions"), // Caminho para armazenar os arquivos de sessão
    }),
    cookie: {
      secure: false, // Não envia o cookie em conexões HTTPS (deveria ser `true` em produção com HTTPS)
      maxAge: 360000, // Tempo de vida do cookie (em milissegundos, 6 minutos aqui)
      expires: new Date(Date.now() + 360000), // Data de expiração do cookie
      httpOnly: true, // Evita que o cookie seja acessível via JavaScript no navegador (proteção XSS)
    },
  })
);

// Middleware para mensagens flash (exibição de notificações entre requisições)
app.use(flash());

// Middleware para passar a sessão do usuário para as variáveis locais das views
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session; // Adiciona a sessão às variáveis locais se o usuário estiver logado
  }
  next(); // Continua para o próximo middleware ou rota
});

// Define as rotas da aplicação
app.use("/toughts", toughtsRoutes); // Rotas para os pensamentos
app.use("/", authRoutes); // Rotas de autenticação

// Define a rota da página inicial para exibir pensamentos
app.get("/", ToughtController.showToughts);

// Sincroniza a conexão com o banco de dados e inicia o servidor
conn
  //.sync({ force: true }) // Descomente para recriar tabelas a cada reinício (apaga dados)
  .sync() // Sincroniza o modelo com o banco sem destruir dados
  .then(() => {
    // Inicia o servidor na porta 3000
    app.listen(3000, () => {
      console.log("Aplicação iniciada com sucesso na porta 3000!");
    });
  })
  .catch((err) => console.error(err)); // Loga erros de conexão ao banco
