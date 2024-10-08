const { DataTypes } = require("sequelize"); // Importando DataTypes do sequelize

const db = require("../db/conn"); // Importando a conexão com o banco de dados

// Definindo o modelo User com três campos: name, email e senha
const User = db.define("users", {
  name: {
    type: DataTypes.STRING, // O campo name é do tipo STRING
    require: true, // Este campo é obrigatório
  },
  email: {
    type: DataTypes.STRING, // O campo email é do tipo STRING
    require: true, // Este campo é obrigatório
  },
  senha: {
    type: DataTypes.STRING, // O campo senha é do tipo STRING
    require: true, // Este campo é obrigatório
  },
});

module.exports = User; // Exportando o modelo User
