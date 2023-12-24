"use strict";

module.exports = (sequelize, DataTypes) => {
  const cliente = sequelize.define(
    "cliente",
    {
      nombres: { type: DataTypes.STRING(100), defaultValue: "NONE" },
      apellidos: { type: DataTypes.STRING(100), defaultValue: "NONE" },
      direccion: { type: DataTypes.STRING, defaultValue: "NONE" },
      celular: { type: DataTypes.STRING(20), defaultValue: "NONE" },
      fecha_nac: { type: DataTypes.DATEONLY },
      external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  cliente.associate = function (models) {
    cliente.hasOne(models.venta, { foreignKey: "id_cliente", as: "venta" });
  };
  return cliente;
};
