const { Sequelize , DataTypes } = require('sequelize');

// mysql://root:''@localhost:3306/sci_db

const sequelize = new Sequelize("sci_db" , "root" , "", {
    dialect:"mysql",
    host:"localhost",
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
  });
  
  module.exports = Model;