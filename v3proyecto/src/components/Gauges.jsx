import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Speedometer from 'react-d3-speedometer';
import { Thermometer, Droplet, Flame, Zap, Activity, Scale } from 'lucide-react';

const SensoresGauges = ({
  temperature,
  humidity,
  gas,
  flame,
  termo1,
  termo2,
  gas1,
  flame1,
  peso
}) => {
  const [activeCategory, setActiveCategory] = useState('temperature');

  const categories = [
    {
      id: 'temperature',
      title: 'Sensores de Temperatura',
      icon: Thermometer,
      color: 'red',
      sensors: [
        {
          title: 'Temperatura Circuito',
          value: temperature,
          min: 0,
          max: 50,
          unit: '°C',
          icon: Thermometer,
          iconColor: 'red',
          needleColor: 'red',
          startColor: 'green',
          endColor: 'red'
        },
        {
          title: 'Termocupla 1',
          value: termo1,
          min: 0,
          max: 400,
          unit: '°C',
          icon: Thermometer,
          iconColor: 'purple',
          needleColor: 'purple',
          startColor: 'lightpurple',
          endColor: 'darkpurple'
        },
        {
          title: 'Termocupla 2',
          value: termo2,
          min: 0,
          max: 40,
          unit: '°C',
          icon: Thermometer,
          iconColor: 'yellow',
          needleColor: 'yellow',
          startColor: 'lightyellow',
          endColor: 'orange'
        }
      ]
    },
    {
      id: 'gas',
      title: 'Sensores de Gas',
      icon: Zap,
      color: 'green',
      sensors: [
        {
          title: 'Cont. Calentado',
          value: gas,
          min: 0,
          max: 680,
          unit: 'ppm',
          icon: Flame,
          iconColor: 'green',
          needleColor: 'green',
          startColor: 'lightgreen',
          endColor: 'darkgreen'
        },
        {
          title: 'Cont. Enfriado',
          value: gas1,
          min: 0,
          max: 400,
          unit: 'ppm',
          icon: Flame,
          iconColor: 'blue',
          needleColor: 'blue',
          startColor: 'lightblue',
          endColor: 'darkblue'
        }
      ]
    },
    {
      id: 'flame',
      title: 'Sensores de Llama',
      icon: Flame,
      color: 'orange',
      sensors: [
        {
          title: 'Cont. Calentado (Llama)',
          value: flame,
          min: 0,
          max: 4095,
          unit: '',
          icon: Flame,
          iconColor: 'orange',
          needleColor: 'orange',
          startColor: 'yellow',
          endColor: 'red'
        },
        {
          title: 'Cont. Enfriado (Llama)',
          value: flame1,
          min: 0,
          max: 4095,
          unit: '',
          icon: Flame,
          iconColor: 'pink',
          needleColor: 'pink',
          startColor: 'lightpink',
          endColor: 'deeppink'
        }
      ]
    },
    {
      id: 'all',
      title: 'Todos los Sensores',
      icon: Activity,
      color: 'blue',
      sensors: [
        {
          title: 'Temperatura Circuito',
          value: temperature,
          min: 0,
          max: 50,
          unit: '°C',
          icon: Thermometer,
          iconColor: 'red',
          needleColor: 'red',
          startColor: 'green',
          endColor: 'red'
        },
        {
          title: 'Humedad',
          value: humidity,
          min: 20,
          max: 90,
          unit: '%',
          icon: Droplet,
          iconColor: 'blue',
          needleColor: 'blue',
          startColor: 'lightblue',
          endColor: 'darkblue'
        },
        {
          title: 'Cont. Calentado (MQ4)',
          value: gas,
          min: 0,
          max: 680,
          unit: 'ppm',
          icon: Flame,
          iconColor: 'green',
          needleColor: 'green',
          startColor: 'lightgreen',
          endColor: 'darkgreen'
        },
        {
          title: 'Cont. Calentado (Llama)',
          value: flame,
          min: 0,
          max: 4095,
          unit: '',
          icon: Flame,
          iconColor: 'orange',
          needleColor: 'orange',
          startColor: 'yellow',
          endColor: 'red'
        },
        {
          title: 'Termocupla 1',
          value: termo1,
          min: 0,
          max: 400,
          unit: '°C',
          icon: Thermometer,
          iconColor: 'yellow',
          needleColor: 'yellow',
          startColor: 'lightyellow',
          endColor: 'orange'
        },
        {
          title: 'Termocupla 2',
          value: termo2,
          min: 0,
          max: 40,
          unit: '°C',
          icon: Thermometer,
          iconColor: 'yellow',
          needleColor: 'yellow',
          startColor: 'lightyellow',
          endColor: 'orange'
        },
        {
          title: 'Cont. Enfriado (MQ5)',
          value: gas1,
          min: 0,
          max: 400,
          unit: 'ppm',
          icon: Flame,
          iconColor: 'teal',
          needleColor: 'teal',
          startColor: 'lightteal',
          endColor: 'darkteal'
        },
        {
          title: 'Cont. Enfriado (Llama)',
          value: flame1,
          min: 0,
          max: 4095,
          unit: '',
          icon: Flame,
          iconColor: 'pink',
          needleColor: 'pink',
          startColor: 'lightpink',
          endColor: 'deeppink'
        }
      ]
    }
  ];

  const selectedCategory = categories.find(cat => cat.id === activeCategory) || categories[0];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-t-xl border-b border-gray-700">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={`p-2 rounded-lg transition-all flex items-center ${activeCategory === category.id 
                ? `bg-${category.color}-500 bg-opacity-20 text-${category.color}-400` 
                : 'text-gray-400 hover:text-white'}`}
              title={category.title}
            >
              <category.icon size={20} className="mr-2" />
              <span className="text-sm hidden sm:inline">{category.title}</span>
            </motion.button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-700 bg-opacity-50 px-3 py-1 rounded-lg">
            <Droplet className="text-blue-400" size={18} />
            <div>
              <div className="text-xs text-gray-300">Humedad</div>
              <div className="font-semibold">{humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-700 bg-opacity-50 px-3 py-1 rounded-lg">
            <Scale className="text-green-400" size={18} />
            <div>
              <div className="text-xs text-gray-300">Peso</div>
              <div className="font-semibold">0.1 kg</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-800 bg-opacity-50 rounded-b-xl border border-gray-700 border-t-0 overflow-hidden">
        <div className="sticky top-0 z-10 bg-gray-800 bg-opacity-90 px-6 py-3 border-b border-gray-700 flex items-center">
          <selectedCategory.icon className={`text-${selectedCategory.color}-400 mr-3`} size={20} />
          <h2 className="text-lg font-semibold">{selectedCategory.title}</h2>
          <div className="ml-auto text-sm text-gray-400">
            {selectedCategory.sensors.length} sensores
          </div>
        </div>

        <div className="h-[calc(100%-56px)] overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {selectedCategory.sensors.map((sensor, index) => (
                <motion.div
                  key={`${activeCategory}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-4 flex flex-col shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <div className="flex items-center mb-3 min-h-[40px] px-2">
                    <sensor.icon className={`text-${sensor.iconColor}-400 mr-3`} size={20} />
                    <h4 className="font-medium text-sm text-gray-100">{sensor.title}</h4>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center items-center min-h-[220px] relative">
                    <div className="w-full h-[180px] flex justify-center">
                      <Speedometer
                        width={250}
                        height={180}
                        value={sensor.value}
                        minValue={sensor.min}
                        maxValue={sensor.max}
                        currentValueText={`${sensor.value} ${sensor.unit}`}
                        needleColor={sensor.needleColor}
                        startColor={sensor.startColor}
                        endColor={sensor.endColor}
                        segments={5}
                        textColor="#ffffff"
                        valueTextFontWeight="500"
                        valueTextFontSize="16px"
                        paddingHorizontal={30}
                        paddingVertical={30}
                        needleTransition="easeElastic"
                        needleTransitionDuration={2000}
                      />
                    </div>
                    {/*<div className="mt-2 text-sm text-gray-300">
                      Rango: {sensor.min} - {sensor.max} {sensor.unit}
                    </div>*/}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensoresGauges;