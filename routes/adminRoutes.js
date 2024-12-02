const express = require("express");
const { Product, UserProduct, User, sequelize, UserHouse } = require("../models");
const { upload } = require("../multer");

const router = express.Router();

const layoutPath = "./layout/adminDashboardLayout";

router.get("/", async (req, res) => {
  const user = req.session.user;
  const noOfUsers = await User.count({});
  const noOfUsersOn = await User.count({});
  const noOfProducts = await Product.count({});
  const noOfProductsBought = await UserProduct.count({ where: { approved: true } });

  const [[{ amountMade }]] = await sequelize.query(
    "SELECT sum(products.price + products.serviceFee) as amountMade FROM userProducts INNER JOIN products on id"
  );
  const [[{ totalAmountMadeService }]] = await sequelize.query(
    "SELECT sum(products.price) as totalAmountMadeService FROM userProducts INNER JOIN products on id"
  );
  console.log("🚀 ~~ router.get ~~ noOfProductsBought:", totalAmountMadeService);
  const users = await User.findAll({});

  try {
    res.render("./adminDashboard/dashboard", {
      user,
      title: "Admin - Dashboard",
      layout: layoutPath,
      noOfUsers,
      noOfUsersOn,
      noOfProducts,
      noOfProductsBought,
      amountMade,
      totalAmountMadeService,
      users,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/products", async (req, res) => {
  const user = req.session.user;

  const products = await Product.findAll({});

  try {
    res.render("./adminDashboard/products", {
      user,
      title: "Products",
      layout: layoutPath,
      products,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/products/create", async (req, res) => {
  const user = req.session.user;

  try {
    res.render("./adminDashboard/createProduct", {
      user,
      title: "Create a product",
      layout: layoutPath,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/products/create", upload.single("file"), async (req, res) => {
  const user = req.session.user;

  try {
    if (req.file) {
      req.body.photoUrl = req.file.path;
    }

    const product = await Product.create(req.body);

    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
});

router.get("/products/:id/edit", async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      throw new Error("Product not found");
    }

    res.render("./adminDashboard/editProduct", {
      user,
      title: "Edit Product - " + product.name,
      layout: layoutPath,
      product,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/admin/products",
      title: "Error",
      user: null,
    });
  }
});

router.post("/products/:id/edit", upload.single("file"), async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  try {
    let product = await Product.findByPk(id);

    if (req.file) {
      product.photoUrl = req.file.path;
    }

    product.quantity = req.body.quantity;
    product.price = req.body.price;
    product.name = req.body.name;

    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
});

router.get("/products/:id", async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      throw new Error("Product not found");
    }

    res.render("./adminDashboard/viewProduct", {
      user,
      title: "Product - " + product.name,
      layout: layoutPath,
      product,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/admin/products",
      title: "Error",
      user: null,
    });
  }
});

router.get("/installation-requests", async (req, res) => {
  const user = req.session.user;

  try {
    const userProducts = await UserProduct.findAll({ include: [User, Product] });

    res.render("./adminDashboard/installation-requests", {
      user,
      title: "Installation Requests - " + userProducts.name,
      layout: layoutPath,
      userProducts,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/admin/products",
      title: "Error",
      user: null,
    });
  }
});

router.post("/installation-requests/approve", async (req, res) => {
  const user = req.session.user;
  const { userId, productId } = req.body;

  try {
    const userProducts = await UserProduct.findOne({ where: { userId, productId } });

    if (!userProducts) {
      throw new Error("Product not found");
    }

    const userHouse = await UserHouse.findOne({ where: { userId } });

    if (!userHouse) {
      throw new Error("House not found");
    }

    userHouse.isSolarInstalled = true;
    userProducts.approved = true;

    await userProducts.save();
    await userHouse.save();

    res.redirect("/admin/installation-requests");
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/admin/installation-requests",
      title: "Error",
      user: null,
    });
  }
});

module.exports.adminRoutes = router;
