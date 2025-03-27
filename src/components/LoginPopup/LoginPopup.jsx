import React, { useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";

const LoginPopup = ({ setShowLogin }) => {
  const [currentState, setCurrentState] = useState("Sign up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
  
    const url =
      currentState === "Login"
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register"; // Adjust signup API if needed
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
  
      // ✅ Save user data in localStorage & sessionStorage
      if (currentState === "Login") {
        localStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("user", JSON.stringify(data.user));
        console.log("User saved:", data.user);
      }
  
      alert(`Success! ${currentState} complete.`);
      setShowLogin(false); // Close popup after success
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            src={assets.cross_icon}
            alt="close"
            onClick={() => setShowLogin(false)}
          />
        </div>

        <div className="login-popup-inputs">
          {currentState === "Sign up" && (
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {currentState === "Sign up" && (
            <input
              type="tel"
              name="phone"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">
          {currentState === "Sign up" ? "Create Account" : "Login"}
        </button>

        {currentState === "Sign up" && (
          <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy</p>
          </div>
        )}

        <p>
          {currentState === "Login"
            ? "Create a new account?"
            : "Already have an account?"}{" "}
          <span
            onClick={() =>
              setCurrentState(currentState === "Login" ? "Sign up" : "Login")
            }
          >
            {currentState === "Login" ? "Click here" : "Login here"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPopup;
