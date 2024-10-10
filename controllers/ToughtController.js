const Tought = require("../models/Tought");
const User = require("../models/User");

module.exports = class ToughtController {
  static async showToughts(req, res) {
    const toughtsData = await Tought.findAll({
      include: User,
    });

    const toughts = toughtsData.map((result) => result.get({ plain: true }));

    res.render("toughts/home", { toughts });
  }

  static async dashboards(req, res) {
    const userId = req.session.userid;

    const user = await User.findOne({
      where: { id: userId },
      include: Tought,
      plain: true,
    });

    if (!user) {
      res.redirect("/login");
    }

    const toughts = user.toughts.map((result) => result.dataValues);

    let emptyToughts = false;

    if (toughts.length === 0) {
      emptyToughts = true;
    }

    res.render("toughts/dashboard", { toughts, emptyToughts });
  }

  static createTought(req, res) {
    res.render("toughts/create");
  }

  static async createToughtSave(req, res) {
    const tought = {
      title: req.body.title,
      userId: req.session.userid,
    };

    try {
      await Tought.create(tought);
      req.flash("message", "Pensamento criado com sucesso!");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.error(err);
    }
  }

  static async removeTought(req, res) {
    const id = req.body.id;
    const userId = req.session.userid;

    try {
      await Tought.destroy({ where: { id: id, userId: userId } });

      req.flash("message", "Pensamento removido com sucesso!");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.error(err);
    }
  }

  static async updateTougth(req, res) {
    const id = req.params.id;

    const tought = await Tought.findOne({ where: { id: id }, raw: true });

    res.render("toughts/edit", { tought });
  }

  static async updateTougthSave(req, res) {
    const id = req.body.id;

    const tought = {
      title: req.body.title,
    };

    try {
      await Tought.update(tought, { where: { id: id } });
      req.flash("Message", "Pensamento atualizado com sucesso!");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.err(err);
    }
  }
};
