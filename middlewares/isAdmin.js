const { User } = require("../models");

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId);

    if (user?.dataValues?.type !== "admin") {
      return res.redirect("/login");
    }

    return next();
  } catch (error) {
    // res.render("error", {
    //   message: error.message,
    //   redirectUrl: "/login",
    //   title: "Error",
    //   user: null,
    // });

    console.log("🚀 ~~ isAdmin ~~ error:", error);
    res.redirect("/login");
  }
};

module.exports.isAdmin = isAdmin;
