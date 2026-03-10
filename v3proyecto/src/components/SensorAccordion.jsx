import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Thermometer, Flame, Droplet } from 'lucide-react';
import Speedometer from 'react-d3-speedometer';

const SensorAccordion = ({ 
  temperature,
  humidity,
  termo1,
  termo2,
  gas,
  gas1,
  flame,
  flame1
}) => {
  const [activeSection, setActiveSection] = useState('temperature');

  const sections = [
    {
      id: 'temperature',
      title: 'Sensores de Temperatura',
      icon: Thermometer,
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
      icon: Flame,
      sensors: [
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
        }
      ]
    },
    {
      id: 'flame',
      title: 'Sensores de Llama',
      icon: Flame,
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
    }
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div 
          key={section.id}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 overflow-hidden"
        >
          <button
            className="w-full p-4 flex justify-between items-center hover:bg-gray-700 transition-colors"
            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
          >
            <div className="flex items-center">
              <section.icon className={`text-${section.sensors[0].iconColor}-400 mr-2`} size={20} />
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </div>
            {activeSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <AnimatePresence>
            {activeSection === section.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {section.sensors.map((sensor, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-800 bg-opacity-70 rounded-lg border border-gray-700 p-4"
                      whileHover={{ y: -3 }}
                    >
                      <div className="flex items-center mb-3">
                        <sensor.icon className={`text-${sensor.iconColor}-400 mr-2`} size={18} />
                        <h4 className="font-medium">{sensor.title}</h4>
                      </div>
                      <Speedometer
                        width={200}
                        height={120}
                        value={sensor.value}
                        minValue={sensor.min}
                        maxValue={sensor.max}
                        currentValueText={`${sensor.value} ${sensor.unit}`}
                        needleColor={sensor.needleColor}
                        startColor={sensor.startColor}
                        endColor={sensor.endColor}
                        segments={5}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default SensorAccordion;