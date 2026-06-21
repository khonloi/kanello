import "./Auth.css";
import { useAuthForm } from "./hooks/useAuthForm";
import logo from "../../assets/logo.png";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import { getGithubAuthUrl } from "../../api/auth";

interface AuthPageProps {
  onLoginSuccess: (email: string, token: string) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    loading,
    error,
    success,
    handleSubmit,
  } = useAuthForm(onLoginSuccess);

  const handleGithubLogin = async () => {
    try {
      const { url } = await getGithubAuthUrl();
      window.location.href = url;
    } catch (err) {
      alert("Failed to initialize GitHub Login");
    }
  };

  return (
    <div className="auth-container-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="card auth-flat-card border-0 text-center">
        {step === 1 ? (
          /* STEP 1: Email Form */
          <>
            <div className="d-flex justify-content-center mb-2">
              <img src={logo} alt="Kanello Logo" width="54" height="54" />
            </div>

            <p className="auth-title-step1 mb-2 mt-2">Log in to continue</p>
          </>
        ) : (
          /* STEP 2: Verification Form */
          <>
            <h2 className="auth-title-step2 fw-bold mb-3 mt-2">
              Email Verification
            </h2>
            <p className="auth-subtitle-step2 mb-2">
              Please enter your code that send to your email address
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
        <form onSubmit={handleSubmit} noValidate>
          {step === 1 ? (
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
          ) : (
            <div className="mb-2">
              <Input
                type="text"
                variant="none"
                className="auth-input-field text-center"
                placeholder="Enter code verification"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                disabled={loading}
                required
              />
            </div>
          )}

          {/* Action button */}
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="auth-submit-btn border-0 fw-medium"
              isLoading={loading}
            >
              {loading ? "Please wait..." : step === 1 ? "Continue" : "Submit"}
            </Button>
          </div>
        </form>

        <div className="d-flex align-items-center my-1">
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
