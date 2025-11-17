const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    task: {
      type: DataTypes.STRING,
      allowNull: false, // Az oszlop nem lehet null
    },
    // Hozzáadhatunk egy "completed" mezőt is:
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    // Ezzel kikapcsoljuk az automatikus 'createdAt' és 'updatedAt' mezők létrehozását
    timestamps: false 
  });

  return Task;
};