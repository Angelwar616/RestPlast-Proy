import Product from "../models/Model.js";
import ProcesoSecundario from "../models/Proceso_secundarioModel.js";

export const getAllProcesosPrincipales = async (req, res) => {
    try {
        const procesos = await Product.findAll();
        res.json(procesos);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getProcesoPrincipalById = async (req, res) => {
    try {
        const proceso = await Product.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(proceso[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}


export const createProcesoPrincipal = async (req, res) => {
    try {
        // Crear el proceso principal
        const proceso = await Product.create(req.body);
        
        // Devuelve el mensaje junto con el id del nuevo proceso
        res.json({
            message: "Proceso Principal Creado",
            id: proceso.id // El id generado automáticamente
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const updateProcesoPrincipal = async (req, res) => {
    try {
        await Product.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Proceso Principal Actualizado"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const deleteProcesoPrincipal = async (req, res) => {
    try {
        await Product.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Proceso Principal Eliminado"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}


// Funciones para el proceso secundario
export const getAllProcesosSecundarios = async (req, res) => {
    try {
        const procesosSecundarios = await ProcesoSecundario.findAll();
        res.json(procesosSecundarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }  
}

export const getProcesoSecundarioById = async (req, res) => {
    try {
        const procesoSecundario = await ProcesoSecundario.findAll({
            where: {
                id: req.params.id 
            }
        });

        if (!procesoSecundario.length) {
            return res.status(404).json({ message: "Proceso Secundario no encontrado" });
        }

        res.json(procesoSecundario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }  
}

export const createProcesoSecundario = async (req, res) => {
    try {
        const procesoSecundario = await ProcesoSecundario.create(req.body);
        res.status(201).json({
            "message": "Proceso Secundario Creado",
            "data": procesoSecundario
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }  
}

export const updateProcesoSecundario = async (req, res) => {
    try {
        const [updated] = await ProcesoSecundario.update(req.body, {
            where: {
                id: req.params.id
            }
        });

        if (!updated) {
            return res.status(404).json({ message: "Proceso Secundario no encontrado" });
        }

        res.json({
            "message": "Proceso Secundario Actualizado"
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }  
}

export const deleteProcesoSecundario = async (req, res) => {
    try {
        const deleted = await ProcesoSecundario.destroy({
            where: {
                id: req.params.id
            }
        });

        if (!deleted) {
            return res.status(404).json({ message: "Proceso Secundario no encontrado" });
        }

        res.json({
            "message": "Proceso Secundario Eliminado"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }  
}