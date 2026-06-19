import { apiFetch } from "./client";

export interface SignInResponse {
  token: string;
}

export interface SignUpResponse {
  user: {
    _id: string;
    email: string;
  };
}

export async function signIn(
  email: string,
  code: string,
): Promise<SignInResponse> {
  return apiFetch("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, verificationCode: code }),
  }).catch((err) => {
    throw new Error(err.message === "Request failed" ? "Incorrect verification code." : err.message);
  });
}

export async function signUp(
  email: string,
  code: string,
): Promise<SignUpResponse> {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, verificationCode: code }),
  }).catch((err) => {
    throw new Error(err.message === "Request failed" ? "Failed to sign up." : err.message);
  });
}
