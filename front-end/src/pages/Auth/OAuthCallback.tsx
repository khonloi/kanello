import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleGithubCallback } from "../../api/auth";

export default function OAuthCallback({ onLoginSuccess }: { onLoginSuccess: (email: string, token: string) => void }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No authorization code found in URL.");
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    handleGithubCallback(code)
      .then((data) => {
        onLoginSuccess(data.email, data.token);
        navigate("/");
      })
      .catch((err) => {
        setError(err.message || "Failed to authenticate with GitHub.");
      });
  }, [searchParams, navigate, onLoginSuccess]);

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
        <div className="alert alert-danger" style={{ maxWidth: "400px" }}>
          <h4 className="alert-heading">Authentication Error</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger mt-3" onClick={() => navigate("/")}>
            Go back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Authenticating with GitHub...</p>
      </div>
    </div>
  );
}
