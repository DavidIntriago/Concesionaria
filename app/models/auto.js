"use strict";

module.exports = (sequelize, DataTypes) => {
  const auto = sequelize.define('auto', {
    modelo:{type: DataTypes.STRING(100), defaultValue: "NONE"},
    marca:{type: DataTypes.STRING(100), defaultValue: "NONE"},
    anio:{type: DataTypes.INTEGER(4)},
    color:{type: DataTypes.STRING(20), defaultValue: "imagen.jpg"},
    precio:{type: DataTypes.FLOAT},
    foto:{type: DataTypes.STRING, defaultValue: "NONE"},
    estado:{type: DataTypes.BOOLEAN, defaultValue:false},
    external_id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
  }, {
    timestamps: false,
    freezeTableName:true
  });
  auto.associate = function (models) {
    auto.hasOne(models.venta, { foreignKey: 'id_auto', as: 'venta' });

  };
  return auto;
};
