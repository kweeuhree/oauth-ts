import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const handleRedirect = (url: string) => {
  window.location.href = `http://localhost:8000/auth/${url}`;
};

function App() {
  return (
    <>
      {/* <div className="box">
        <p>Log in with Auth0</p>

        <button onClick={handleAuth0Login}>Log in</button>
      </div> */}

      <div className="box">
        <p>Sign in with Google OAuth</p>
        <button className="red-button" onClick={() => handleRedirect("google")}>
          Sign in
        </button>
      </div>

      <div className="box">
        <p>Sign in with GitHub OAuth</p>
        <button onClick={() => handleRedirect("github")}>Sign in</button>
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
