const { Sequelize , DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DBNAME , process.env.DB_USERNAME , process.env.DB_PASSWORD, {
    dialect:"mysql",
    host:process.env.DB_HOST,
    logging: false 
});

(async () => {
    try {
      await sequelize.authenticate();
      console.log('Connected to the database.');
  
      // Sync the models with the database
    //   await sequelize.sync({ alter: true });
  
      // Your application logic here
  
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  })();

  const Model = sequelize.define('datas', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true
    },
    cable: {
      type: DataTypes.STRING,
    },
    timestamp: {
        type: DataTypes.DATE,
      },
    inverse_velocity: {
        type: DataTypes.DOUBLE,
      },
    deformation: {
        type: DataTypes.DOUBLE,
      },
  });
  
  module.exports = Model;