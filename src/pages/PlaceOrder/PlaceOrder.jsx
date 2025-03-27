import React, { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";
import { deliveryFee } from "../Cart/Cart";

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, user, food_list } = useContext(StoreContext);
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // ✅ Fetch userId from context or localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const finalUserId = user?.id || storedUser?.id;
    
    if (finalUserId) {
      setUserId(finalUserId);
    } else {
      console.error("❌ No user ID found! Make sure the user is logged in.");
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  // Handle order submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 🔥 Debugging logs
    console.log("User from Context:", user);
    console.log("User ID from LocalStorage:", JSON.parse(localStorage.getItem("user")));
    console.log("Final User ID:", userId);

    if (!userId) {
      setError("User ID is missing. Please log in.");
      setLoading(false);
      return;
    }

    // ✅ Ensure food items are formatted correctly
    const foodItems = Object.entries(cartItems)
      .filter(([id, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const item = food_list.find((product) => product._id === id);
        if (!item) {
          console.error(`❌ Item not found for ID: ${id}`);
          return null;
        }
        return {
          name: item.name,
          quantity,
          price: item.price,
        };
      })
      .filter((item) => item !== null); // Remove null values

    if (foodItems.length === 0) {
      setError("No valid food items in the cart.");
      setLoading(false);
      return;
    }

    const totalPrice = getTotalCartAmount() + (foodItems.length > 0 ? deliveryFee : 0);

    const orderData = {
      userId,
      foodItems,
      totalPrice,
      deliveryAddress: orderDetails,
    };

    // 🔥 Log order data before sending
    console.log("📦 Order Data:", orderData);

    try {
      const response = await fetch("http://localhost:5000/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to place order");
      }

      alert("🎉 Order placed successfully!");
      navigate("/order-confirmation");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="GoBack" onClick={() => navigate("/cart")}>
        ⬅️ Go Back to Cart Page
      </button>

      <form className="place-order" onSubmit={handlePlaceOrder}>
        <div className="place-order-left">
          <h2 className="title">Delivery Information</h2>
          <div className="multi-fields">
            <input type="text" name="firstName" placeholder="First Name" value={orderDetails.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name" value={orderDetails.lastName} onChange={handleChange} required />
          </div>
          <input type="email" name="email" placeholder="Email Address" value={orderDetails.email} onChange={handleChange} required />
          <input type="text" name="street" placeholder="Street" value={orderDetails.street} onChange={handleChange} required />
          <div className="multi-fields">
            <input type="text" name="city" placeholder="City" value={orderDetails.city} onChange={handleChange} required />
            <input type="text" name="state" placeholder="State" value={orderDetails.state} onChange={handleChange} required />
          </div>
          <div className="multi-fields">
            <input type="number" name="zipCode" placeholder="Zip Code" value={orderDetails.zipCode} onChange={handleChange} required />
            <input type="text" name="country" placeholder="Country" value={orderDetails.country} onChange={handleChange} required />
          </div>
          <input type="number" name="phone" placeholder="Phone" value={orderDetails.phone} onChange={handleChange} required />
        </div>

        <div className="place-order-right">
          <div className="cart-total">
            <h2 className="title">Cart Total</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${getTotalCartAmount() === 0 ? 0 : deliveryFee}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryFee}</b>
              </div>
            </div>
            <button type="submit" disabled={getTotalCartAmount() === 0 || loading}>
              {loading ? "Placing Order..." : "PROCEED TO PAYMENT"}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </form>
    </>
  );
};

export default PlaceOrder;
