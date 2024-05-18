import React, { createContext, useState } from 'react';
import getState from './flux';

export const Context = createContext(null);

const injectContext = (PassedComponent) => {
  const StoreWrapper = (props) => {
    const [state, setState] = useState(getState({
      setStore: (newState) => setState(prevState => ({
        ...prevState,
        store: { ...prevState.store, ...newState }
      })),
    }));

    return (
      <Context.Provider value={state}>
        <PassedComponent {...props} />
      </Context.Provider>
    );
  };

  return StoreWrapper;
};

export default injectContext;