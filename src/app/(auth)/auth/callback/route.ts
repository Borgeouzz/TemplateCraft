import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const userId = requestUrl.searchParams.get("user_id");
  const email = requestUrl.searchParams.get("email");
  const redirect_to = requestUrl.searchParams.get("redirect_to") || "/dashboard";

  const response = NextResponse.redirect(new URL(redirect_to, requestUrl.origin));

  if (token) {
    // Salva il token in cookie HttpOnly
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: requestUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  // Store EmailRAG identifiers in a non-HttpOnly cookie so client can read
  if (userId) {
    response.cookies.set("emailrag_user_id", userId, {
      httpOnly: false,
      sameSite: "lax",
      secure: requestUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  if (email) {
    response.cookies.set("emailrag_email", email, {
      httpOnly: false,
      sameSite: "lax",
      secure: requestUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}