import React from "react";
import { useNavigate } from "react-router-dom";
import { toggleDarkMode } from "../utils/darkMode";
import "./Header.css";

const Header = ({
  isDarkMode,
  setIsDarkMode,
  isAuthenticated,
  user,
  username,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/");
  };

  const handleToggleDarkMode = () => {
    const newMode = toggleDarkMode();
    setIsDarkMode(newMode);
  };

  return (
    <header className="header">
      <div className="header-main">
        <div className="logo-section">
          <span className="material-symbols-outlined logo-icon">devices</span>
          <h2 className="logo-text">Refurbished</h2>
        </div>
        <div className="nav-section">
          <div className="nav-links">
            <a href="/categories">Shop by Category</a>
            <a href="/how-it-works">How it Works</a>
            <a href="/about">About Us</a>
          </div>
        </div>
        <div className="action-buttons">
          {isAuthenticated ? (
            // Authenticated user UI
            <>
              <div className="user-welcome">
                <span className="welcome-text">Welcome, {username}</span>
              </div>
              <button className="btn btn-primary" onClick={handleCreatePost}>
                <span className="material-symbols-outlined">add_circle</span>
                <span>Create Post</span>
              </button>
              <button className="btn btn-icon">
                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
              <button className="btn btn-secondary" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span>
                <span>Logout</span>
              </button>
              <button className="btn-icon" onClick={handleToggleDarkMode}>
                <span className="material-symbols-outlined">
                  {isDarkMode ? "light_mode" : "dark_mode"}
                </span>
              </button>
            </>
          ) : (
            // Unauthenticated user UI
            <>
              <button className="btn btn-primary" onClick={handleSignIn}>
                <span>Sign In</span>
              </button>
              <button className="btn btn-secondary" onClick={handleSignUp}>
                <span>Sign Up</span>
              </button>
              <button className="btn-icon">
                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
              <button className="btn-icon" onClick={handleToggleDarkMode}>
                <span className="material-symbols-outlined">
                  {isDarkMode ? "light_mode" : "dark_mode"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
