import { apiFetch } from "./client";

export interface VerifyOtpResponse {
  token: string;
  email: string;
}

export async function sendOtp(email: string): Promise<{ message: string }> {
  return apiFetch("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  }).catch((err) => {
    throw new Error(err.message === "Request failed" ? "Failed to send OTP." : err.message);
  });
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<VerifyOtpResponse> {
  return apiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  }).catch((err) => {
    throw new Error(err.message === "Request failed" ? "Incorrect verification code or code expired." : err.message);
  });
}

export async function getGithubAuthUrl(): Promise<{ url: string }> {
  return apiFetch("/auth/github/url");
}

export async function handleGithubCallback(code: string): Promise<{ token: string; email: string }> {
  return apiFetch("/auth/github/callback", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
