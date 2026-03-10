import express from "express";
import { 
    getAllProcesosPrincipales, 
    getProcesoPrincipalById, 
    createProcesoPrincipal, 
    updateProcesoPrincipal, 
    deleteProcesoPrincipal,
    getAllProcesosSecundarios, 
    getProcesoSecundarioById, 
    createProcesoSecundario, 
    updateProcesoSecundario, 
    deleteProcesoSecundario,    
} from "../controllers/Products.js"; 

const router = express.Router();



// Rutas para Proceso Principal
router.get('/proceso_principal', getAllProcesosPrincipales);                        
router.get('/proceso_principal/:id', getProcesoPrincipalById);                      
router.post('/proceso_principal', createProcesoPrincipal);                              
router.patch('/proceso_principal/:id', updateProcesoPrincipal);                   
router.delete('/proceso_principal/:id', deleteProcesoPrincipal);                  

// Rutas para Proceso Secundario
router.get('/proceso_secundario', getAllProcesosSecundarios);                       
router.get('/proceso_secundario/:id', getProcesoSecundarioById);                   
router.post('/proceso_secundario', createProcesoSecundario);                       
router.patch('/proceso_secundario/:id', updateProcesoSecundario);                 
router.delete('/proceso_secundario/:id', deleteProcesoSecundario);                 

export default router;

