import "./Auth.css";
import { useAuthForm } from "./hooks/useAuthForm";
import logo from "../../assets/logo.png";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import { auth } from "../../firebase";
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { apiFetch } from "../../api/client";

interface AuthPageProps {
  onLoginSuccess: (email: string, token: string) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const {
    step,
    email,
    setEmail,
    loading,
    error,
    success,
    handleSubmit,
  } = useAuthForm(onLoginSuccess);

  const handleGithubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('repo'); 
      const result = await signInWithPopup(auth, provider);
      
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = await result.user.getIdToken();
      
      // Save githubAccessToken to database via Express backend
      if (credential?.accessToken) {
        localStorage.setItem("token", token);
        await apiFetch("/auth/github-token", {
          method: "POST",
          body: JSON.stringify({
            githubAccessToken: credential.accessToken,
          }),
        });
      }
      
      onLoginSuccess(result.user.email || "", token);
    } catch (err: any) {
      alert("Failed to login with GitHub: " + err.message);
    }
  };

  return (
    <div className="auth-container-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="card auth-flat-card border-0 text-center">
        {step === 1 ? (
          <>
            <div className="d-flex justify-content-center mb-2">
              <img src={logo} alt="Kanello Logo" width="54" height="54" />
            </div>
            <p className="auth-title-step1 mb-2 mt-2">Log in to continue</p>
          </>
        ) : (
          <>
            <h2 className="auth-title-step2 fw-bold mb-3 mt-2">
              Check your email
            </h2>
            <p className="auth-subtitle-step2 mb-2">
              We've sent a magic link to {email}. Click the link to log in.
            </p>
          </>
        )}

        {/* Feedback Messages */}
        {error && (
          <div
            className="alert alert-danger py-2 px-3 small rounded-1 mb-3 text-start"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        {success && (
          <div
            className="alert alert-success py-2 px-3 small rounded-1 mb-3 text-start"
            role="alert"
          >
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </div>
        )}

        {/* Main Auth Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-2">
              <Input
                type="email"
                variant="none"
                className="auth-input-field text-center"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="auth-submit-btn border-0 fw-medium"
                isLoading={loading}
              >
                {loading ? "Please wait..." : "Continue"}
              </Button>
            </div>
          </form>
        )}

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted small">OR</span>
          <hr className="flex-grow-1" />
        </div>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          className="auth-github-btn fw-medium d-flex align-items-center justify-content-center gap-2 mb-3"
          onClick={handleGithubLogin}
        >
          <i className="bi bi-github"></i> Continue with GitHub
        </Button>

        {/* Privacy Policy Footer */}
        <div>
          <p className="auth-footer-link text-decoration-none mb-0">
            Privacy Policy
          </p>
          <p className="auth-footer-disclosure text-muted mt-1">
            This site is protected by reCAPTCHA and the Google{" "}
            <a className="text-decoration-none">Privacy Policy</a> and{" "}
            <a className="text-decoration-none">Terms of Service</a> apply.
          </p>
        </div>
      </div>
    </div>
  );
}
