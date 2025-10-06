import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in on app start and token expiry
    const token = authService.getToken();
    const user = authService.getCurrentUser();

    console.log('AuthContext useEffect - token from localStorage:', token);
    console.log('AuthContext useEffect - user from localStorage:', user);

    if (token && user) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        const now = Math.floor(Date.now() / 1000);
        console.log('AuthContext useEffect - token payload exp:', payload.exp, 'current time:', now);
        // If token expired, clear auth state
        if (payload.exp && payload.exp < now) {
          console.log('AuthContext useEffect - token expired, logging out');
          authService.logout();
          dispatch({ type: 'LOGOUT' });
          return;
        }
        console.log('AuthContext useEffect - token valid, dispatching LOGIN_SUCCESS');
      } catch (e) {
        // If error parsing token, logout
        console.log('AuthContext useEffect - error parsing token, logging out', e);
        authService.logout();
        dispatch({ type: 'LOGOUT' });
        return;
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await authService.login(email, password);

      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });

      return response;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.error || 'Login failed'
      });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const isAdmin = () => {
    return state.user && state.user.role === 'admin';
  };

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    isAdmin
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
