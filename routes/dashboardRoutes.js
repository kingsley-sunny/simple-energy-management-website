const express = require("express");
const { Utils } = require("../utils/utils");
const { isSupervisor } = require("../middlewares/isSupervisor");
const { UserHouse, HouseAppliance, Product, UserProduct, User } = require("../models");
const { upload } = require("../multer");
const router = express.Router();

const layout = "./layout/dashboardLayout";

router.get("/", async (req, res) => {
  const user = req.session.user;
  const noOfDevices = await HouseAppliance.count({ where: { userHouseId: user.house.id } });
  const noOfDevicesOn = await HouseAppliance.count({
    where: { userHouseId: user.house.id, status: true },
  });
  const noOfWatts = await HouseAppliance.sum("watt", { where: { userHouseId: user.house.id } });
  const noOfWattsOn = await HouseAppliance.sum("watt", {
    where: { userHouseId: user.house.id, status: true },
  });
  const noOfGrids = await UserProduct.count({ where: { userId: user.id, approved: true } });
  const noOfGridsOn = await UserProduct.count({
    where: { userId: user.id, status: true, approved: true },
  });
  const batteryAmp = await UserProduct.sum("batteryRemaining", {
    where: { userId: user.id, approved: true },
  });
  const totalBatteryCapacity = await UserProduct.sum("amp", {
    where: { userId: user.id, approved: true },
  });
  const batteryPercent = (batteryAmp / totalBatteryCapacity) * 100;
  const batteryRemaining = Utils.calculateBatteryLife(batteryAmp, noOfWattsOn);
  const noOfSolarPanels = await UserProduct.count({
    where: { userId: user.id, type: "solar-panel", approved: true },
  });
  const noOfSolarPanelOn = await UserProduct.sum("watt", {
    where: { userId: user.id, type: "solar-panel", approved: true },
  });
  const userHouse = await UserHouse.findOne({
    where: {
      id: user.house.id,
    },
    include: HouseAppliance,
  });

  try {
    res.render("./dashboard/dashboard", {
      user,
      title: "Overview",
      layout: layout,
      noOfDevices,
      noOfDevicesOn,
      noOfWatts,
      noOfWattsOn,
      noOfGrids,
      noOfGridsOn,
      batteryAmp,
      totalBatteryCapacity,
      batteryPercent,
      batteryRemaining,
      noOfSolarPanels,
      noOfSolarPanelOn,
      userHouse,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/houses", async (req, res) => {
  const user = req.session.user;
  const userHouses = await UserHouse.findAll({
    where: {
      userId: user.id,
    },
  });

  try {
    res.render("./dashboard/houses", {
      user,
      title: "My - Houses",
      layout: layout,
      userHouses,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard",
      title: "Error",
      user: null,
    });
  }
});

// create a new house
router.get("/houses/new", async (req, res) => {
  const user = req.session.user;

  try {
    res.render("./dashboard/create-house", {
      user,
      title: "Create a new house",
      layout: layout,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard/houses",
      title: "Error",
      user: null,
    });
  }
});

router.post("/houses/new", upload.single("file"), async (req, res) => {
  const user = req.session.user;
  const { address, state, country, meterNo, name } = req.body;

  if (!req.file) {
    throw new Error("House Picture is Required");
  }

  console.log(req.file);

  try {
    const userHouse = await UserHouse.create({
      name,
      address,
      state,
      country,
      meterNo,
      photoUrl: req.file.filename,
      userId: user.id,
    });

    res.redirect(`/dashboard/houses`);
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard/houses/new",
      title: "Error",
      user: null,
    });
  }
});

// add a route for viewing a single house
router.get("/houses/:id", async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  try {
    const userHouse = await UserHouse.findOne({
      where: {
        id,
        userId: user.id,
      },
      include: HouseAppliance,
    });
    console.log(userHouse);

    if (!userHouse) {
      throw new Error("House not found");
    }

    res.render("./dashboard/house-details", {
      user,
      title: "House - " + userHouse.name,
      layout: layout,
      userHouse,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard/houses",
      title: "Error",
      user: null,
    });
  }
});

// add a route to get the form to add device to a specific house
router.get("/houses/:id/add-device", async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  try {
    const userHouse = await UserHouse.findOne({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!userHouse) {
      throw new Error("House not found");
    }

    res.render("./dashboard/add-device", {
      user,
      title: "Add Device",
      layout: layout,
      userHouse,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard/houses",
      title: "Error",
      user: null,
    });
  }
});

// add a route to add device to a specific house
router.post("/api/houses/:id/add-device", async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  const { name, watt, quantity, amp } = req.body;

  console.log(req.body);

  try {
    const userHouse = await UserHouse.findOne({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!userHouse) {
      throw new Error("House not found");
    }

    const device = await HouseAppliance.create({
      name,
      watt,
      quantity,
      amp,
      userHouseId: userHouse.id,
    });

    res.json({ device, status: "success", message: "Device added successfully" }).status(200);
  } catch (error) {
    console.log(error);
    res.json({ status: "error", message: error.message }, 500).status(500);
  }
});

// add a route to add device to a specific house
router.post("/api/houses/:id/toggle-device", async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  const { status, deviceId } = req.body;

  console.log(req.body);

  try {
    const userHouse = await UserHouse.findOne({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!userHouse) {
      throw new Error("House not found");
    }

    const device = await HouseAppliance.findOne({
      where: {
        id: deviceId,
        userHouseId: userHouse.id,
      },
    });

    if (!device) {
      throw new Error("Device not found");
    }

    const userProduct = await UserProduct.count({ where: { userId: user.id, status: true } });
    if (userProduct === 0) {
      throw new Error("INSTALL A SOLAR, IF INSTALLED, ON THE SOLAR GRID");
    }

    const val = await HouseAppliance.update(
      {
        status: status,
      },
      {
        where: {
          id: device.id,
        },
      }
    );
    console.log("🚀 ~~ router.post ~~ val:", val);

    res.json({ device, status: "success", message: `Device ${status} successfully` }).status(200);
  } catch (error) {
    console.log(error);
    res.json({ status: "error", message: error.message }, 500).status(500);
  }
});

router.get("/products", async (req, res) => {
  const user = req.session.user;
  try {
    const products = await Product.findAll({});

    res.render("./dashboard/products", {
      user,
      title: "My - Energy Grid Products",
      layout: layout,
      products,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard",
      title: "Error",
      user: null,
    });
  }
});

router.post("/products/:id/install-product", async (req, res) => {
  const user = req.session.user;
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    console.log("🚀 ~~ router.get ~~ product:", product);

    if (!product) {
      throw new Error("Product Not Found");
    }

    res.render("./dashboard/product-details", {
      user,
      title: "My - Products",
      layout: layout,
      product,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard",
      title: "Error",
      user: null,
    });
  }
});

router.post("/products/:id/install", async (req, res) => {
  const user = req.session.user;
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    console.log("🚀 ~~ router.get ~~ product:", product);

    if (!product) {
      throw new Error("Product Not Found");
    }

    // check if the user has already installed the product
    let userProduct = await UserProduct.findOne({
      where: {
        userId: user.id,
        productId: product.id,
      },
    });

    if (userProduct) {
      throw new Error("Product already installed");
    }

    userProduct = await UserProduct.create({
      userId: user.id,
      productId: product.id,
      type: product.dataValues.type,
      canCharge: product.dataValues.type === "solar-panel" ? true : false,
      watt: product.dataValues.watt,
      amp: product.dataValues.amp,
      batteryRemaining: product.dataValues.amp,
    });

    res.redirect("/dashboard/products");
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard",
      title: "Error",
      user: null,
    });
  }
});

router.post("/api/products/:id/toggle", async (req, res) => {
  const user = req.session.user;
  const { status } = req.body;
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });

    if (!product) {
      throw new Error("Product Not Found");
    }

    // check if the user has already installed the product
    let userProduct = await UserProduct.findOne({
      where: {
        userId: user.id,
        productId: product.id,
      },
    });

    if (!userProduct) {
      throw new Error("User Product Not found");
    }

    // check if the product loads is more than the grid
    const grid = await UserProduct.sum("watt", {
      where: {
        userId: user.id,
        approved: true,
      },
    });

    const loads = await HouseAppliance.sum("watt", {
      where: {
        userId: user.id,
        houseId: user.house.id,
      },
    });

    console.log("🚀 ~~ router.post ~~ loads:", loads, "grid:", grid);

    if (loads > grid) {
      throw new Error("Load is too much");
    }

    userProduct.status = status;
    await userProduct.save();

    if (userProduct.type !== "solar-panel" && status === false) {
      await HouseAppliance.update({ status: false }, { where: { userHouseId: user.house.id } });
    }

    res
      .json({ userProduct, status: "success", message: `Grid ${status} successfully` })
      .status(200);
  } catch (error) {
    console.log(error);
    res.json({ status: "error", message: error.message }, 500).status(500);
  }
});

router.get("/products/:id", async (req, res) => {
  const user = req.session.user;

  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
      include: {
        model: UserProduct,
        include: [
          { model: User, where: { id: user.id } },
          { model: Product, where: { id: req.params.id } },
        ],
      },
    });

    if (!product) {
      throw new Error("Product Not Found");
    }

    res.render("./dashboard/product-details", {
      user,
      title: "My - Products",
      layout: layout,
      product,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard",
      title: "Error",
      user: null,
    });
  }
});

router.get("/my-products", async (req, res) => {
  const user = req.session.user;

  try {
    const products = await Product.findAll({
      include: { model: UserProduct, where: { userId: user.id, approved: true } },
    });

    res.render("./dashboard/my-products", {
      user,
      title: "My - Energy Grid Products",
      layout: layout,
      products,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      message: error.message,
      redirectUrl: "/dashboard",
      title: "Error",
      user: null,
    });
  }
});

module.exports = router;
