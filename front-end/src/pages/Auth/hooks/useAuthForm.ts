import { useState } from "react";
import { signIn, signUp } from "../../../api";

export const useAuthForm = (onLoginSuccess: (email: string, token: string) => void) => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Feedback state
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (step === 1) {
      if (!email) {
        setError("Please enter your email address.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setStep(2);
    } else {
      if (!code) {
        setError("Please enter the verification code.");
        return;
      }
      if (code.length < 4) {
        setError("Verification code must be at least 4 characters.");
        return;
      }

      setLoading(true);
      try {
        try {
          // 1. Try to sign in first
          const data = await signIn(email, code);
          setSuccess("Logged in successfully!");
          onLoginSuccess(email, data.token);
        } catch (signinErr) {
          // 2. If signin fails, try to sign up
          try {
            await signUp(email, code);
            // Auto sign in after sign up
            const signinData = await signIn(email, code);
            setSuccess("Account created and logged in!");
            onLoginSuccess(email, signinData.token);
          } catch (signupErr: any) {
            // If signup fails because user exists, it means the verificationCode was wrong
            if (
              signupErr.message.includes("exists") ||
              signupErr.message.includes("already")
            ) {
              throw new Error("Incorrect verification code.");
            } else {
              throw signupErr;
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    loading,
    error,
    success,
    handleSubmit,
  };
};
