"use strict";

module.exports = (sequelize, DataTypes) => {
  const venta = sequelize.define('venta', {
    
    fecha:{type: DataTypes.DATEONLY},
    precio:{type: DataTypes.FLOAT},
    porcentajeIva:{type: DataTypes.INTEGER, defaultValue: 14},
    recargo:{type: DataTypes.BOOLEAN, defaultValue:false},
    external_id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
  }, {
    timestamps: false,
    freezeTableName:true
  });
  venta.associate = function (models) {
    venta.belongsTo(models.auto, {foreignKey:'id_auto'})
    venta.belongsTo(models.cliente, {foreignKey:'id_cliente'})
    venta.belongsTo(models.persona, {foreignKey:'id_vendedor'})

  };
  return venta;
};
