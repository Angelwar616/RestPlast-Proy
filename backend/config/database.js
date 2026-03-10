import { Sequelize } from "sequelize";
 
const db = new Sequelize('proy_database', 'root', '', {
    host: "localhost",
    dialect: "mysql"
});
 
export default db;