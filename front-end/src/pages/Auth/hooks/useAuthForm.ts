import { useState, useEffect } from "react";
import { auth } from "../../../firebase";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

export const useAuthForm = (onLoginSuccess: (email: string, token: string) => void) => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem("emailForSignIn");
      if (!savedEmail) {
        savedEmail = window.prompt("Please provide your email for confirmation");
      }
      
      if (savedEmail) {
        setLoading(true);
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem("emailForSignIn");
            const token = await result.user.getIdToken();
            onLoginSuccess(result.user.email || savedEmail!, token);
          })
          .catch((err) => {
            setError(err.message || "Failed to sign in with email link.");
            setLoading(false);
          });
      }
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setSuccess("Magic link sent to your email! Click it to log in.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    email,
    setEmail,
    loading,
    error,
    success,
    handleSubmit,
  };
};
