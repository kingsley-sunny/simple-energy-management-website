const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../database.sqlite"),
  logging: false,
});

// User Model
const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    timestamps: true,
  }
);

// UserHouse Model
const UserHouse = sequelize.define(
  "userHouses",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meterNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isSolarInstalled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isLightOn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isSolarOn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

// HouseAppliance Model
const HouseAppliance = sequelize.define(
  "houseAppliances",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userHouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    watt: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amp: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true }
);

// Product Model
const Product = sequelize.define(
  "products",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amp: {
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    watt: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    model: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    serviceFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    photoUrl: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true }
);

// Contact Model
const Contact = sequelize.define(
  "contacts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { timestamps: true }
);

// Cart Model
const Cart = sequelize.define(
  "carts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { timestamps: true }
);

// CartItem Model
const CartItem = sequelize.define(
  "cartItems",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: true }
);

// UserProduct Model
const UserProduct = sequelize.define(
  "userProducts",
  {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    batteryRemaining: {
      type: DataTypes.INTEGER,
    },
    isCharging: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canCharge: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    watt: {
      type: DataTypes.INTEGER,
    },
    amp: {
      type: DataTypes.INTEGER,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true }
);

// Login Sessions Model
const LoginSession = sequelize.define(
  "loginSessions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: true }
);

// Associations
User.hasMany(UserHouse, { foreignKey: "userId" });
UserHouse.belongsTo(User, { foreignKey: "userId" });

UserHouse.hasMany(HouseAppliance, { foreignKey: "userHouseId" });
HouseAppliance.belongsTo(UserHouse, { foreignKey: "userHouseId" });

User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart);

CartItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(CartItem, { foreignKey: "productId" });

User.belongsToMany(Product, { through: UserProduct, foreignKey: "userId" });
Product.belongsToMany(User, { through: UserProduct, foreignKey: "productId" });

User.hasMany(UserProduct, { foreignKey: "userId" });
Product.hasMany(UserProduct, { foreignKey: "productId" });

UserProduct.hasOne(User, { sourceKey: "userId", foreignKey: "id" });
UserProduct.hasOne(Product, { sourceKey: "productId", foreignKey: "id" });

User.hasMany(LoginSession, { foreignKey: "userId" });
LoginSession.belongsTo(User, { foreignKey: "userId" });

// Sync all models
async function syncDatabase(force) {
  try {
    await sequelize.sync({ force: force });
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
}

module.exports = {
  sequelize,
  User,
  UserHouse,
  HouseAppliance,
  Product,
  Contact,
  Cart,
  CartItem,
  UserProduct,
  syncDatabase,
};
