import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  const handleAuth0Login = () => {
    window.location.href = "http://localhost:8000/login";
  };

  const handleGoogleSignin = () => {
    window.location.href = "http://localhost:8000/google-signin";
  };

  return (
    <>
      <div className="box">
        <p>Log in with Auth0</p>

        <button onClick={handleAuth0Login}>Log in</button>
      </div>

      <div className="box">
        <p>Log in with Google OAuth</p>

        <button className="red-button" onClick={handleGoogleSignin}>
          Sign in
        </button>
      </div>
    </>
  );
}

function LoggedIn() {
  return (
    <div>
      <h1>You are logged in!</h1>
      <Link to="/">Go back</Link>
    </div>
  );
}

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/logged" element={<LoggedIn />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
