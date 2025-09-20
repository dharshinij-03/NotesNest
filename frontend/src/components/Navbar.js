import React from "react";

function Navbar({ user }) {
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/logout", {
        method: "GET",
        credentials: "include", // send session cookie
      });
      // after successful logout, reload or redirect
      window.location.href = "http://localhost:3000";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm px-4 py-2">
      <a className="navbar-brand fw-bold fs-4" href="/">📝 NotesNest</a>

      <div className="ms-auto d-flex align-items-center">
        {user ? (
          <>
            <span className="text-light me-3">{user.displayName}</span>
            <button
              className="btn btn-light btn-sm rounded-pill px-3"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <a
            href="http://localhost:4000/auth/google"
            className="btn btn-light btn-sm rounded-pill px-3"
          >
            Login with Google
          </a>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
