const Tought = require("../models/Tought");
const User = require("../models/User");
const { Op } = require("sequelize");

module.exports = class ToughtController {
  // Exibe os pensamentos na página principal com suporte para busca e ordenação
  static async showToughts(req, res) {
    let search = "";

    // Verifica se há um parâmetro de busca na query string
    if (req.query.search) {
      search = req.query.search;
    }

    // Define a ordenação baseada no parâmetro 'order' da query string
    let order = "DESC";
    if (req.query.order === "old") {
      order = "ASC"; // Ordena por mais antigo
    }

    // Consulta os pensamentos no banco, incluindo os dados do usuário que os criou
    const toughtsData = await Tought.findAll({
      include: User,
      where: {
        title: { [Op.like]: `%${search}%` }, // Busca parcial pelo título
      },
      order: [["createdAt", order]], // Ordena pela data de criação
    });

    // Converte os resultados para objetos simples
    const toughts = toughtsData.map((result) => result.get({ plain: true }));

    // Conta o número de pensamentos encontrados
    let toughtsQty = toughts.length;

    // Se não houver pensamentos, define como falso para exibição
    if (toughtsQty === 0) {
      toughtsQty = false;
    }

    // Renderiza a página inicial com os pensamentos e parâmetros de busca
    res.render("toughts/home", { toughts, search, toughtsQty });
  }

  // Exibe o dashboard do usuário com seus pensamentos
  static async dashboards(req, res) {
    const userId = req.session.userid; // Obtém o ID do usuário da sessão

    // Busca o usuário e seus pensamentos
    const user = await User.findOne({
      where: { id: userId },
      include: Tought,
      plain: true, // Retorna um único objeto ao invés de array
    });

    // Se o usuário não estiver logado, redireciona para a página de login
    if (!user) {
      return res.redirect("/login");
    }

    // Mapeia os pensamentos do usuário
    const toughts = user.toughts.map((result) => result.dataValues);

    // Verifica se o usuário não tem pensamentos
    let emptyToughts = false;
    if (toughts.length === 0) {
      emptyToughts = true;
    }

    // Renderiza o dashboard com os pensamentos do usuário
    res.render("toughts/dashboard", { toughts, emptyToughts });
  }

  // Renderiza a página de criação de novos pensamentos
  static createTought(req, res) {
    res.render("toughts/create");
  }

  // Salva o novo pensamento no banco de dados
  static async createToughtSave(req, res) {
    const tought = {
      title: req.body.title,
      userId: req.session.userid, // Associa o pensamento ao usuário logado
    };

    try {
      // Cria o novo pensamento no banco
      await Tought.create(tought);

      req.flash("message", "Pensamento criado com sucesso!");

      // Salva a sessão e redireciona para o dashboard
      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.error(err); // Logger adequado pode ser utilizado aqui
    }
  }

  // Remove um pensamento do banco de dados
  static async removeTought(req, res) {
    const id = req.body.id;
    const userId = req.session.userid; // Assegura que o pensamento a ser deletado pertence ao usuário logado

    try {
      // Exclui o pensamento com base no ID e no userId
      await Tought.destroy({ where: { id: id, userId: userId } });

      req.flash("message", "Pensamento removido com sucesso!");

      // Salva a sessão e redireciona para o dashboard
      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.error(err); // Logger apropriado
    }
  }

  // Renderiza a página de edição de um pensamento específico
  static async updateTougth(req, res) {
    const id = req.params.id;

    // Busca o pensamento pelo ID
    const tought = await Tought.findOne({ where: { id: id }, raw: true });

    // Renderiza a página de edição com o pensamento
    res.render("toughts/edit", { tought });
  }

  // Atualiza o pensamento no banco de dados
  static async updateTougthSave(req, res) {
    const id = req.body.id;

    const tought = {
      title: req.body.title, // Atualiza apenas o título
    };

    try {
      // Atualiza o pensamento no banco de dados
      await Tought.update(tought, { where: { id: id } });

      req.flash("Message", "Pensamento atualizado com sucesso!");

      // Salva a sessão e redireciona para o dashboard
      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.err(err); // O correto seria `console.error`
    }
  }
};
