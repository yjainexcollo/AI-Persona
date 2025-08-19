/**
 * AuthPage Component
 * 
 * Main authentication page that renders the login form.
 * This is the entry point for user authentication in the application.
 * 
 * Currently displays the LoginForm component, but can be extended
 * to include registration, password reset, or other auth flows.
 */

import React from "react";
import LoginForm from "../components/Auth/LoginForm";

/**
 * AuthPage Component
 * 
 * Renders the authentication interface, currently showing the login form.
 * This component serves as the main authentication entry point.
 */
const AuthPage: React.FC = () => <LoginForm />;

export default AuthPage; 