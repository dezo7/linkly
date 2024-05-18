const getState = ({ getStore, setStore, getActions }) => {
  return {
    store: {
      isAuthenticated: false, // Estado inicial de autenticación
      user: null, // Datos del usuario autenticado
      token: null, // Token de autenticación
    },
    actions: {
      login: (username, token) => {
        setStore({
          isAuthenticated: true,
          user: username,
          token: token // Guardar el token en el store
        });
        console.log('Estado establecido en login:', { isAuthenticated: true, user: username, token: token });
      },
      logout: () => {
        localStorage.removeItem('access_token'); // Limpiar el token del localStorage
        setStore({
          isAuthenticated: false,
          user: null,
          token: null // Limpiar el token del store
        });
      },
      validateToken: (token) => {
        return new Promise((resolve, reject) => {
          fetch('http://127.0.0.1:5000/validate_token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
            .then(response => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error('Token validation failed');
              }
            })
            .then(data => {
              if (data.valid) {
                setStore({
                  isAuthenticated: true,
                  user: data.user,
                  token: token
                });
                resolve(data);
              } else {
                throw new Error('Token not valid');
              }
            })
            .catch(error => {
              console.error('Error validating token:', error);
              localStorage.removeItem('access_token'); // Limpiar el token del localStorage
              setStore({
                isAuthenticated: false,
                user: null,
                token: null // Limpiar el token del store
              });
              reject(error);
            });
        });
      }
    }
  };
};

export default getState;