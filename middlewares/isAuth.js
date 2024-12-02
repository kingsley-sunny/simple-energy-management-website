const { UserHouse } = require("../models");

const isAuth = async (req, res, next) => {
  if (req.session?.userId && req.session?.user) {
    const house = await UserHouse.findOne({
      where: {
        userId: req.session.userId,
      },
    });

    if (house) {
      req.session.user.house = house;
    }

    return next();
  }

  res.redirect("/login");
  // next();
};

module.exports.isAuth = isAuth;
