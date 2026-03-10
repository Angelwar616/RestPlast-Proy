import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Product = db.define('proceso_principal', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    peso_inicio: {
        type: DataTypes.DOUBLE
    },
    peso_final: {
        type: DataTypes.DOUBLE
    },
    hora_inicio: {
        type: DataTypes.TIME
    },
    hora_fin: {
        type: DataTypes.TIME
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    }
}, {
    freezeTableName: true
});

export default Product;
