const { DataTypes } = require("sequelize"); // Importando DataTypes do sequelize para definir os tipos de dados do modelo

const db = require("../db/conn"); // Importando a conexão com o banco de dados

const User = require("./User"); // Importando o modelo User para estabelecer relacionamentos

// Definindo o modelo Tought com um único campo 'title'
const Tought = db.define("toughts", {
  title: {
    type: DataTypes.STRING, // O campo title é do tipo STRING
    allowNull: false, // O campo title não pode ser nulo
    require: true, // O campo title é obrigatório
  },
});

// Estabelecendo relacionamentos entre os modelos Tought e User
Tought.belongsTo(User); // Cada Tought pertence a um único User
User.hasMany(Tought); // Um User pode ter muitos Toughts

module.exports = Tought; // Exportando o modelo Tought para uso em outras partes da aplicação
