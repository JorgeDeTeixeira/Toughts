const { Sequelize } = require("sequelize");

// Inicializa uma instância do Sequelize, utilizando variáveis de ambiente para segurança
const sequelize = new Sequelize(
  process.env.DB_DATABASE, // Nome do banco de dados
  process.env.DB_USERNAME, // Usuário do banco de dados
  process.env.DB_PASSWORD, // Senha do banco de dados
  {
    host: process.env.DB_HOST, // Endereço do servidor do banco
    dialect: "mysql", // Dialeto, no caso MySQL, pode ser alterado para outro banco de dados
  }
);

// Autentica a conexão com o banco de dados e lida com erros
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully."); // Conexão bem-sucedida
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error); // Caso ocorra erro, é logado no console
  });

module.exports = sequelize; // Exporta a instância do Sequelize para ser utilizada em outros módulos
