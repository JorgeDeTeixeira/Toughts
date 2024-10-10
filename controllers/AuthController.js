const User = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports = class AuthController {
  // Renderiza a página de login
  static login(req, res) {
    res.render("auth/login");
  }

  // Método para processar o login
  static async loginPost(req, res) {
    const { email, password } = req.body;

    // Busca o usuário pelo email
    const user = await User.findOne({ where: { email: email } });

    // Se o usuário não for encontrado, exibe uma mensagem de erro
    if (!user) {
      req.flash("message", "Usuário não encontrado!");
      res.render("auth/login");
      return;
    }

    // Verifica se a senha é válida usando bcrypt
    const passwordMatch = bcrypt.compareSync(password, user.password);

    // Se a senha for incorreta, exibe uma mensagem de erro
    if (!passwordMatch) {
      req.flash("message", "Senha incorreta!");
      res.render("auth/login");
      return;
    }

    // Armazena o ID do usuário na sessão
    req.session.userid = user.id;

    req.flash("message", "Login realizado com sucesso!");

    // Salva a sessão antes de redirecionar para garantir que foi atualizada corretamente
    req.session.save(() => {
      res.redirect("/");
    });
  }

  // Renderiza a página de registro
  static register(req, res) {
    res.render("auth/register");
  }

  // Método para processar o registro de novos usuários
  static async registerPost(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    // Verifica se as senhas coincidem
    if (password !== confirmpassword) {
      req.flash("message", "As senhas não conferem, tente novamente!");
      res.render("auth/register");
      return;
    }

    // Verifica se o usuário já existe pelo email
    const checkIfUserExists = await User.findOne({ where: { email: email } });

    // Se o usuário já existe, exibe uma mensagem de erro
    if (checkIfUserExists) {
      req.flash("message", "O email já está em uso!");
      res.render("auth/register");
      return;
    }

    // Gera o hash da senha com bcrypt
    const salt = bcrypt.genSaltSync(10); // Aqui o "10" é o fator de complexidade, considere ajustá-lo para melhorar a segurança
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Cria o objeto usuário a ser salvo no banco
    const user = {
      name,
      email,
      password: hashedPassword,
    };

    try {
      // Cria o usuário no banco de dados
      const createdUser = await User.create(user);

      // Armazena o ID do novo usuário na sessão
      req.session.userid = createdUser.id;

      req.flash("message", "Cadastro realizado com sucesso!");

      // Salva a sessão antes de redirecionar
      req.session.save(() => {
        res.redirect("/");
      });
    } catch (err) {
      console.error(err); // Melhor prática: Adicionar um logger profissional (ex: Winston) para tratamento de logs
    }
  }

  // Método para logout do usuário
  static async logout(req, res) {
    // Destroi a sessão do usuário e redireciona para a página de login
    req.session.destroy();
    res.redirect("/login");
  }
};
