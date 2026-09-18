// lib/hooks/usePersistedForm.ts
import { useReducer, useEffect, useCallback } from 'react';

// Definir el estado completo
type State<T> = {
  data: T;
  step: number;
  isRestored: boolean;
};

// Definir las acciones
type Action<T> =
  | { type: 'INIT'; payload: { data: T; step: number } }
  | { type: 'UPDATE_DATA'; payload: Partial<T> }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'CLEAR'; defaultData: T; initialStep: number }
  | { type: 'RESET'; defaultData: T; initialStep: number };

// Reducer para manejar todas las actualizaciones de forma atómica
function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'INIT':
      // Restaurar desde localStorage (una sola actualización)
      return {
        ...state,
        data: action.payload.data,
        step: action.payload.step,
        isRestored: true,
      };
    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
      };
    case 'CLEAR':
      return {
        data: action.defaultData,
        step: action.initialStep,
        isRestored: false,
      };
    case 'RESET':
      return {
        data: action.defaultData,
        step: action.initialStep,
        isRestored: false,
      };
    default:
      return state;
  }
}

export function usePersistedForm<T>(
  key: string,
  defaultData: T,
  initialStep: number = 1
) {
  // Estado inicial (sin restaurar)
  const [state, dispatch] = useReducer(reducer<T>, {
    data: defaultData,
    step: initialStep,
    isRestored: false,
  });

  // Cargar desde localStorage SOLO UNA VEZ al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // ÚNICA actualización: despachar una sola acción INIT
        dispatch({
          type: 'INIT',
          payload: {
            data: parsed.data,
            step: parsed.step || initialStep,
          },
        });
      }
    } catch (error) {
      console.warn('Error al cargar datos persistentes:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar

  // Guardar en localStorage cuando cambian data o step
  useEffect(() => {
    // Solo guardar si ya se restauró o si los datos no son los default
    // (evita guardar el estado inicial vacío)
    if (state.isRestored || JSON.stringify(state.data) !== JSON.stringify(defaultData)) {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            data: state.data,
            step: state.step,
          })
        );
      } catch (error) {
        console.warn('Error al guardar datos persistentes:', error);
      }
    }
  }, [state.data, state.step, key, state.isRestored, defaultData]);

  // Funciones para actualizar el estado (usando dispatch)
  const updateData = useCallback((newData: Partial<T>) => {
    dispatch({ type: 'UPDATE_DATA', payload: newData });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const clearPersistedData = useCallback(() => {
    localStorage.removeItem(key);
    dispatch({ type: 'CLEAR', defaultData, initialStep });
  }, [key, defaultData, initialStep]);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(key);
    dispatch({ type: 'RESET', defaultData, initialStep });
  }, [key, defaultData, initialStep]);

  return {
    data: state.data,
    updateData,
    step: state.step,
    setStep,
    isRestored: state.isRestored,
    clearPersistedData,
    resetToDefault,
  };
}