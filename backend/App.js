import express from "express";
//import db from "./config/database.js";
import productRoutes from "./routes/index.js"; // Rutas combinadas
import mysql from 'mysql2';
import cors from "cors";

const app = express();
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "proy_database",
    port: "3306",
  });

//try {
//    await db.authenticate();
 //   console.log('Database connected...');
//} catch (error) {
 //   console.error('Connection error:', error);
//}
//app.get('/', (req, res)=>{
//    res.send('HOLA MUNDO')
//})

app.use(cors());
app.use(express.json());
app.get('/api/datos', (req, res) => {   
    
    const query = 'SELECT * FROM proceso_principal ORDER BY id DESC LIMIT 1;';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener datos:', err);
        res.status(500).send('Error en el servidor');
        return;
      }
      res.json(results);
    });
  });

app.use('/', productRoutes); 
app.listen(5000, () => console.log('Server running at port 5000'));