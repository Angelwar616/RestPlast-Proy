import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Scale } from 'lucide-react';

const NavbarDoble = ({ 
  categories, 
  activeCategory, 
  setActiveCategory,
  humedad,
  peso
}) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 bg-opacity-50 rounded-xl">
      <div className="flex space-x-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category.id)}
            className={`p-3 rounded-full transition-all ${activeCategory === category.id 
              ? `bg-${category.color}-500 bg-opacity-20 text-${category.color}-400` 
              : 'text-gray-400 hover:text-white'}`}
            title={category.title}
          >
            <category.icon size={24} />
          </motion.button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center space-x-6"
      >
        <div className="flex items-center space-x-2">
          <Droplet className="text-blue-400" size={20} />
          <div>
            <div className="text-sm text-gray-400">Humedad</div>
            <div className="text-lg font-semibold">{humedad}%</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Scale className="text-green-400" size={20} />
          <div>
            <div className="text-sm text-   gray-400">Peso</div>
            <div className="text-lg font-semibold">{peso} kg</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NavbarDoble;