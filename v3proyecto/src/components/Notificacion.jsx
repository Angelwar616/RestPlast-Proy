import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database"; 

const AlertaOperacion = () => {
  const [operacionEnCurso, setOperacionEnCurso] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const operacionRef = ref(db, 'Control/ContP'); 
    onValue(operacionRef, (snapshot) => {
      const data = snapshot.val();
      if (data === 1) {
        setOperacionEnCurso(true); 
      } else {
        setOperacionEnCurso(false); 
      }
    });
  }, []);

  return (
    <div className={`p-4 rounded-md shadow-md 
      ${operacionEnCurso ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700' : 'hidden'}`}>
      {operacionEnCurso && (
        <div className="flex items-center">
          <svg className="h-6 w-6 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M4 4l16 16" />
          </svg>
          <p>Operación en proceso.</p>
        </div>
      )}
    </div>
  );
};

export default AlertaOperacion;