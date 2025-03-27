import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  // 🔹 Save user in localStorage only when it’s valid
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getTotalQuantity = () =>
    Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const getTotalCartAmount = () =>
    Object.entries(cartItems).reduce((total, [id, qty]) => {
      const item = food_list.find((product) => product._id === id);
      return total + (item ? item.price * qty : 0);
    }, 0);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalQuantity,
    user, // 🔹 Provide user in context
    setUser, // 🔹 Allow updating user
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
