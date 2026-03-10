import React from 'react';
import { Droplet, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

const NavbarLateral = ({ humedad, peso }) => {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full lg:w-48 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 p-4 flex lg:flex-col justify-between"
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center p-3"
      >
        <Droplet className="text-blue-400" size={24} />
        <span className="text-2xl font-bold mt-2">{humedad}%</span>
        <span className="text-sm text-gray-400">Humedad</span>
      </motion.div>
      
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center p-3"
      >
        <Scale className="text-green-400" size={24} />
        <span className="text-2xl font-bold mt-2">{peso} kg</span>
        <span className="text-sm text-gray-400">Peso</span>
      </motion.div>
    </motion.div>
  );
};

export default NavbarLateral;