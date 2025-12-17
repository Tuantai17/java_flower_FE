import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial State
const initialState = {
    cart: [],
    favorites: [],
    user: null,
    isAuthenticated: false,
    loading: false,
    notification: null,
};

// Action Types
const ActionTypes = {
    // Cart
    ADD_TO_CART: 'ADD_TO_CART',
    REMOVE_FROM_CART: 'REMOVE_FROM_CART',
    UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',

    // Favorites
    ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
    REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
    CLEAR_FAVORITES: 'CLEAR_FAVORITES',

    // User
    SET_USER: 'SET_USER',
    LOGOUT: 'LOGOUT',

    // UI
    SET_LOADING: 'SET_LOADING',
    SET_NOTIFICATION: 'SET_NOTIFICATION',
    CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
};

// Reducer
const appReducer = (state, action) => {
    switch (action.type) {
        // Cart Actions
        case ActionTypes.ADD_TO_CART: {
            const existingItem = state.cart.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    cart: state.cart.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
                            : item
                    ),
                };
            }
            return {
                ...state,
                cart: [...state.cart, { ...action.payload, quantity: action.payload.quantity || 1 }],
            };
        }

        case ActionTypes.REMOVE_FROM_CART:
            return {
                ...state,
                cart: state.cart.filter(item => item.id !== action.payload),
            };

        case ActionTypes.UPDATE_CART_QUANTITY:
            return {
                ...state,
                cart: state.cart.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };

        case ActionTypes.CLEAR_CART:
            return {
                ...state,
                cart: [],
            };

        // Favorites Actions
        case ActionTypes.ADD_TO_FAVORITES:
            if (state.favorites.find(item => item.id === action.payload.id)) {
                return state;
            }
            return {
                ...state,
                favorites: [...state.favorites, action.payload],
            };

        case ActionTypes.REMOVE_FROM_FAVORITES:
            return {
                ...state,
                favorites: state.favorites.filter(item => item.id !== action.payload),
            };

        case ActionTypes.CLEAR_FAVORITES:
            return {
                ...state,
                favorites: [],
            };

        // User Actions
        case ActionTypes.SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
            };

        case ActionTypes.LOGOUT:
            localStorage.removeItem('accessToken');
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                cart: [],
            };

        // UI Actions
        case ActionTypes.SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            };

        case ActionTypes.SET_NOTIFICATION:
            return {
                ...state,
                notification: action.payload,
            };

        case ActionTypes.CLEAR_NOTIFICATION:
            return {
                ...state,
                notification: null,
            };

        default:
            return state;
    }
};

// Context
const AppContext = createContext(null);

// Provider
export const AppProvider = ({ children }) => {
    // Load initial state from localStorage
    const loadInitialState = () => {
        try {
            const savedCart = localStorage.getItem('cart');
            const savedFavorites = localStorage.getItem('favorites');

            return {
                ...initialState,
                cart: savedCart ? JSON.parse(savedCart) : [],
                favorites: savedFavorites ? JSON.parse(savedFavorites) : [],
            };
        } catch {
            return initialState;
        }
    };

    const [state, dispatch] = useReducer(appReducer, initialState, loadInitialState);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.cart));
    }, [state.cart]);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(state.favorites));
    }, [state.favorites]);

    // Actions
    const actions = {
        // Cart
        addToCart: (product, quantity = 1) => {
            dispatch({ type: ActionTypes.ADD_TO_CART, payload: { ...product, quantity } });
        },
        removeFromCart: (productId) => {
            dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: productId });
        },
        updateCartQuantity: (productId, quantity) => {
            dispatch({ type: ActionTypes.UPDATE_CART_QUANTITY, payload: { id: productId, quantity } });
        },
        clearCart: () => {
            dispatch({ type: ActionTypes.CLEAR_CART });
        },

        // Favorites
        addToFavorites: (product) => {
            dispatch({ type: ActionTypes.ADD_TO_FAVORITES, payload: product });
        },
        removeFromFavorites: (productId) => {
            dispatch({ type: ActionTypes.REMOVE_FROM_FAVORITES, payload: productId });
        },
        toggleFavorite: (product) => {
            if (state.favorites.find(item => item.id === product.id)) {
                dispatch({ type: ActionTypes.REMOVE_FROM_FAVORITES, payload: product.id });
            } else {
                dispatch({ type: ActionTypes.ADD_TO_FAVORITES, payload: product });
            }
        },
        clearFavorites: () => {
            dispatch({ type: ActionTypes.CLEAR_FAVORITES });
        },
        isFavorite: (productId) => {
            return state.favorites.some(item => item.id === productId);
        },

        // User
        setUser: (user) => {
            dispatch({ type: ActionTypes.SET_USER, payload: user });
        },
        logout: () => {
            dispatch({ type: ActionTypes.LOGOUT });
        },

        // UI
        setLoading: (loading) => {
            dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
        },
        showNotification: (notification) => {
            dispatch({ type: ActionTypes.SET_NOTIFICATION, payload: notification });
            // Auto clear after 5 seconds
            setTimeout(() => {
                dispatch({ type: ActionTypes.CLEAR_NOTIFICATION });
            }, 5000);
        },
        clearNotification: () => {
            dispatch({ type: ActionTypes.CLEAR_NOTIFICATION });
        },
    };

    // Calculated values
    const cartTotal = state.cart.reduce((total, item) => {
        const price = item.salePrice || item.price;
        return total + (price * item.quantity);
    }, 0);

    const cartCount = state.cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <AppContext.Provider value={{
            state,
            ...actions,
            cartTotal,
            cartCount,
            favoritesCount: state.favorites.length
        }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom Hook
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext;
