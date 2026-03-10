import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gauge, Power, ArrowLeft } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebase'; 

const RULES = {
  'gas-MQ4': { type: 'range', min: 0, max: 500, color: 'red', msg: 'Concentración alta de gas (MQ4).', okWindow: 30 },
  'gas-MQ5': { type: 'range', min: 0, max: 600, color: 'red', msg: 'Concentración alta de gas (MQ5).', okWindow: 30 },
  'llama-S1': { type: 'lessThan', threshold: 200, color: 'red', msg: 'Fuego detectado en el contenedor de calentamiento (llama-S1).', okWindow: 30 },
  'llama-S2': { type: 'lessThan', threshold: 200, color: 'red', msg: 'Fuego detectado en el contenedor de enfriamiento (llama-S2).', okWindow: 30 },
  'temp': { type: 'range', min: 0, max: 38, color: 'red', msg: 'Temperatura de componentes electrónicos muy alta.', okWindow: 30 },
  'hum': { type: 'greaterThan', threshold: 70, color: 'blue', msg: 'Ventiladores activados.', autoDismiss: 15 },
  'termocupla1': { type: 'termocupla', color: 'green', msg: 'Desactivando fuego.', autoDismiss: 10 },
  'termocupla2': { type: 'termocupla', color: 'green', msg: 'Desactivando fuego.', autoDismiss: 10 },
  'Peso_pr': { type: 'weight' }
};

const SENSOR_META = {
  'Peso_pr':   { name: "Sensor de Peso", unit: "kg",  path: 'Sensor/Peso_pr' },
  'gas-MQ4':   { name: "Gas MQ4",        unit: "ppm", path: 'Sensor/gas-MQ4' },
  'gas-MQ5':   { name: "Gas MQ5",        unit: "ppm", path: 'Sensor/gas-MQ5' },
  'hum':       { name: "Humedad",        unit: "%",   path: 'Sensor/hum' },
  'llama-S1':  { name: "Sensor de Llama 1", unit: "", path: 'Sensor/llama-S1' },
  'llama-S2':  { name: "Sensor de Llama 2", unit: "", path: 'Sensor/llama-S2' },
  'temp':      { name: "Temperatura",    unit: "°C",  path: 'Sensor/temp' },
  'termocupla1': { name: "Termocupla 1", unit: "°C",  path: 'Sensor/termocupla1' },
  'termocupla2': { name: "Termocupla 2", unit: "°C",  path: 'Sensor/termocupla2' }
};

const SensorPage = () => {
  const { sensorKey } = useParams();
  const navigate = useNavigate();
  const meta = SENSOR_META[sensorKey];
  const rule = RULES[sensorKey];
  const [simulation, setSimulation] = useState(false);
  const [sensorValue, setSensorValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertColor, setAlertColor] = useState('red'); 
  const [alertTime, setAlertTime] = useState('');
  const [ackEnabled, setAckEnabled] = useState(false);
  const [ackSecondsLeft, setAckSecondsLeft] = useState(30);
  const [dismissed, setDismissed] = useState(false); 
  const ackIntervalRef = useRef(null);
  const autoDismissTimeoutRef = useRef(null);
  const prevValueRef = useRef(null);

  useEffect(() => {
    if (!meta) {
      setError(`Sensor no encontrado: ${sensorKey}`);
      setLoading(false);
      return;
    }

    const simAllowed = !(rule && rule.type === 'weight');

    if (!simulation || !simAllowed) {
      setLoading(true);
      setError(null);

      const db = getDatabase(app);
      const sensorRef = ref(db, meta.path);
      const unsubscribe = onValue(
        sensorRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data !== null && data !== undefined) {
            const numericValue =
              typeof data === 'string'
                ? parseFloat(String(data).replace(',', '.'))
                : Number(data);
            if (!isNaN(numericValue)) {
              setSensorValue(numericValue);
              setError(null);
            } else {
              setError(`Valor inválido: ${data}`);
            }
          } else {
            setError('No hay datos disponibles');
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error de Firebase:', err);
          setError(`Error de conexión: ${err.message || err}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [simulation, sensorKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = String(inputValue).trim().replace(',', '.');
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const clamped = Math.max(0, parsed);
      setSensorValue(clamped);
      setInputValue('');
    }
  };

  const getGaugeColor = () => {
    if (error) return '#6b7280';
    if (sensorValue === null) return '#3b82f6';
    if (rule) {
      if (rule.type === 'range') {
        const out = sensorValue < rule.min || sensorValue > rule.max;
        return out ? '#ef4444' : '#3b82f6';
      }
      if (rule.type === 'lessThan') {
        const out = sensorValue < rule.threshold;
        return out ? '#ef4444' : '#3b82f6';
      }
      if (rule.type === 'greaterThan') {
        const out = sensorValue > rule.threshold;
        return out ? '#3b82f6' : '#3b82f6';
      }
    }
    return '#3b82f6';
  };

  const calculateGaugePercentage = () => {
    if (sensorValue === null || error) return 0;

    if (rule) {
      if (rule.type === 'range' && typeof rule.max === 'number' && rule.max > 0) {
        return Math.min(100, Math.max(0, (sensorValue / rule.max) * 100));
      }
      if (rule.type === 'lessThan') {
        return Math.min(100, Math.max(0, (sensorValue / 4060) * 100));
      }
      if (rule.type === 'greaterThan' && typeof rule.threshold === 'number') {
        return Math.min(100, Math.max(0, sensorValue));
      }
      if (rule.type === 'termocupla') {
        return Math.min(100, Math.max(0, (sensorValue / 400) * 100));
      }
    }

    switch (sensorKey) {
      case 'Peso_pr': return Math.min(100, (sensorValue / 50) * 100);
      default: return Math.min(100, Math.max(0, sensorValue));
    }
  };

  const clearAckTimer = () => {
    if (ackIntervalRef.current) {
      clearInterval(ackIntervalRef.current);
      ackIntervalRef.current = null;
    }
  };
  const clearAutoDismiss = () => {
    if (autoDismissTimeoutRef.current) {
      clearTimeout(autoDismissTimeoutRef.current);
      autoDismissTimeoutRef.current = null;
    }
  };
  useEffect(() => () => { clearAckTimer(); clearAutoDismiss(); }, []);

  const startOkWindow = (seconds) => {
    clearAckTimer();
    setAckSecondsLeft(seconds);
    setAckEnabled(true);
    ackIntervalRef.current = setInterval(() => {
      setAckSecondsLeft((prev) => {
        if (prev <= 1) {
          clearAckTimer();
          setAckEnabled(false); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showAlert = ({ text, color, okSeconds, autoDismissSeconds }) => {
    setAlertMsg(text);
    setAlertColor(color);
    setAlertTime(new Date().toLocaleTimeString());
    setAlertVisible(true);

    clearAutoDismiss();
    clearAckTimer();
    setAckEnabled(false);

    if (okSeconds) startOkWindow(okSeconds);
    if (autoDismissSeconds) {
      autoDismissTimeoutRef.current = setTimeout(() => {
        setAlertVisible(false);
        setDismissed(false); 
      }, autoDismissSeconds * 1000);
    }
  };

  const hideAlert = () => {
    setAlertVisible(false);
    clearAckTimer();
    clearAutoDismiss();
  };

  useEffect(() => {
    if (!meta || sensorValue === null || isNaN(sensorValue)) {
      hideAlert();
      setDismissed(false);
      prevValueRef.current = sensorValue;
      return;
    }

    if (rule && rule.type === 'weight') {
      hideAlert();
      setDismissed(false);
      prevValueRef.current = sensorValue;
      return;
    }

    const nowOutOfRange = (() => {
      if (!rule) return false;

      if (rule.type === 'range') {
        return sensorValue < rule.min || sensorValue > rule.max;
      }
      if (rule.type === 'lessThan') {
        return sensorValue < rule.threshold;
      }
      if (rule.type === 'greaterThan') {
        return sensorValue > rule.threshold;
      }
      if (rule.type === 'termocupla') {
        const prev = prevValueRef.current;
        return (prev === null || typeof prev !== 'number' || prev <= 0) && sensorValue > 0;
      }
      return false;
    })();

    const isBackInRange = (() => {
      if (!rule) return true;
      if (rule.type === 'range') return sensorValue >= rule.min && sensorValue <= rule.max;
      if (rule.type === 'lessThan') return sensorValue >= rule.threshold;
      if (rule.type === 'greaterThan') return sensorValue <= rule.threshold;
      if (rule.type === 'termocupla') {
        return true;
      }
      return true;
    })();

    if (isBackInRange) {
      if (rule.type !== 'termocupla') {
        if (alertVisible) hideAlert();
        setDismissed(false);
      }
    }

    if (!rule) {
      // sin reglas
    } else if (rule.type === 'termocupla') {
      if (nowOutOfRange) {
        showAlert({ text: rule.msg, color: 'green', autoDismissSeconds: rule.autoDismiss || 10 });
      }
    } else if (rule.type === 'greaterThan') {
      const prev = prevValueRef.current;
      const crossedUp = !(typeof prev === 'number' && prev > rule.threshold) && sensorValue > rule.threshold;
      if (crossedUp) {
        showAlert({ text: rule.msg, color: 'blue', autoDismissSeconds: rule.autoDismiss || 15 });
      }
    } else {
      if (nowOutOfRange) {
        if (!dismissed) {
          showAlert({ text: rule.msg, color: 'red', okSeconds: rule.okWindow || 30 });
        } else {
          if (alertVisible) hideAlert();
        }
      } else {
      }
    }

    prevValueRef.current = sensorValue;
  }, [sensorValue, sensorKey]);

  const handleOkClick = () => {
    setDismissed(true);
    hideAlert();
  };

  if (!meta) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <p>Sensor no encontrado: {sensorKey}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-400">Volver</button>
        </div>
      </div>
    );
  }

  const renderRangeText = () => {
    if (!rule) return null;
    if (rule.type === 'range') return `Rango permitido: ${rule.min} - ${rule.max}${SENSOR_META[sensorKey].unit}`;
    if (rule.type === 'lessThan') return `Alerta si < ${rule.threshold}${SENSOR_META[sensorKey].unit}`;
    if (rule.type === 'greaterThan') return `Alerta si > ${rule.threshold}${SENSOR_META[sensorKey].unit}`;
    return null;
  };

  const alertBgClass =
    alertColor === 'red' ? 'bg-red-500' :
    alertColor === 'blue' ? 'bg-blue-500' :
    'bg-green-600';

  const simAllowed = !(rule && rule.type === 'weight');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft size={20} />
          Volver al panel
        </button>

        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Gauge className="text-blue-400" />
            {meta.name}
            {loading && !simulation && (
              <span className="text-sm text-yellow-400 ml-2">Cargando datos...</span>
            )}
            {error && (
              <span className="text-sm text-red-400 ml-2">{error}</span>
            )}
          </h1>

          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-32">
              <div className="absolute w-full h-full border-4 border-gray-600 rounded-t-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                  style={{
                    height: `${calculateGaugePercentage()}%`,
                    background: getGaugeColor()
                  }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pt-16">
                <span className="text-4xl font-bold text-white">
                  {sensorValue !== null
                    ? `${typeof sensorValue === 'number' ? sensorValue.toFixed(2) : sensorValue}${SENSOR_META[sensorKey].unit}`
                    : '--'}
                </span>
              </div>
            </div>

            {renderRangeText() && (
              <p className="text-sm text-gray-400">{renderRangeText()}</p>
            )}

            {simAllowed ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <div className="flex items-center gap-3 w-full justify-between">
                  <Power
                    size={24}
                    className={simulation ? 'text-green-500' : 'text-gray-500'}
                  />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={simulation}
                      onChange={() => {
                        setSimulation(!simulation);
                        if (simulation) setInputValue('');
                      }}
                    />
                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-lg font-medium text-gray-300">
                      {simulation ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>

                {simulation ? (
                  <form onSubmit={handleSubmit} className="w-full mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Ingrese valor (${SENSOR_META[sensorKey].unit})`}
                        required
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Aplicar
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      Modo simulación activado - Ingrese valores manuales
                    </p>
                  </form>
                ) : (
                  <div className="text-center mt-2">
                    <p className="text-gray-400">
                      {loading ? 'Conectando con el sensor...' :
                        error ? 'Error en la conexión' : 'Mostrando datos en tiempo real'}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
            {alertVisible && (
              <div className="w-full bg-[#424150] rounded-lg p-4 shadow-md max-h-40 overflow-y-auto mt-2">
                <div className={`${alertBgClass} text-white p-3 rounded-lg shadow-lg text-sm flex items-center justify-between`}>
                  <div>
                    <div>{alertMsg}</div>
                    <div className="text-[11px] text-white/80 mt-1">Detectado: {alertTime}</div>
                  </div>
                  {ackEnabled && (
                    <button
                      onClick={handleOkClick}
                      className="ml-4 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs"
                      title="Descartar"
                    >
                      OK ({ackSecondsLeft})
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorPage;