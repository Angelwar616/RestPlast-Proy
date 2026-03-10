import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const ProcesoSecundario = db.define('proceso_secundario', {
    id: {  
        type: DataTypes.INTEGER,       
    },
    idSc: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    gas1: {
        type: DataTypes.DOUBLE,
    },
    gas2: {
        type: DataTypes.DOUBLE,
    },
    hum: {
        type: DataTypes.INTEGER,
    },
    llama1: {
        type: DataTypes.INTEGER,
    },
    llama2: {
        type: DataTypes.INTEGER,
    },
    temp: {
        type: DataTypes.DOUBLE,   
        
    },
    termocupla1: {
        type: DataTypes.DOUBLE,
    },
    termocupla2: {
        type: DataTypes.DOUBLE,        
    },
    Peso_pr: {
        type: DataTypes.DOUBLE
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,      
    }
}, {
    freezeTableName: true
});

export default ProcesoSecundario;
