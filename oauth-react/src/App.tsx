import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  const handleLogin = () => {
    window.location.href = "http://localhost:8000/login";
  };

  return (
    <>
      <div>
        <p>Log in with Auth0</p>

        <button onClick={handleLogin}>Log in</button>
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
