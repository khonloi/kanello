import { useState } from "react";
import { sendOtp, verifyOtp } from "../../../api";

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

      setLoading(true);
      try {
        await sendOtp(email);
        setSuccess("OTP sent to your email.");
        setStep(2);
      } catch (err: any) {
        setError(err.message || "Failed to send OTP.");
      } finally {
        setLoading(false);
      }
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
        const data = await verifyOtp(email, code);
        setSuccess("Logged in successfully!");
        onLoginSuccess(data.email, data.token);
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
