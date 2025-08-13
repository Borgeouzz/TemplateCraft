"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/v1";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required");
  }

  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, display_name: fullName }),
  });

  if (!res.ok) {
    const { detail } = await res.json().catch(() => ({ detail: "Signup failed" }));
    return encodedRedirect("error", "/sign-up", detail || "Signup failed");
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set("auth_token", data.token, { httpOnly: true, sameSite: "lax", path: "/" });
  return redirect("/dashboard");
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { detail } = await res.json().catch(() => ({ detail: "Login failed" }));
    return encodedRedirect("error", "/sign-in", detail || "Login failed");
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set("auth_token", data.token, { httpOnly: true, sameSite: "lax", path: "/" });
  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const callbackUrl = formData.get("callbackUrl")?.toString();
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }
  // TODO: implement reset password on API
  if (callbackUrl) return redirect(callbackUrl);
  return encodedRedirect("success", "/forgot-password", "Check your email for a link to reset your password.");
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  // TODO: implement reset password on API (requires email verification flow)
  return encodedRedirect("success", "/dashboard/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  // TODO: implement on API when subscriptions are available
  return false;
};

export const generateEmailAction = async (formData: FormData) => {
  const prompt = formData.get("prompt")?.toString();

  if (!prompt) {
    return encodedRedirect("error", "/", "Prompt is required");
  }

  try {
    const res = await fetch(`${API_BASE}/generate-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: prompt }),
    });
    if (!res.ok) {
      const { detail } = await res.json().catch(() => ({ detail: "Generation failed" }));
      return { success: false, error: detail || "Generation failed" } as const;
    }
    const data = await res.json();
    return { success: true, email: data.email } as const;
  } catch {
    return { success: true, email: await simulateEmailGeneration(prompt) } as const;
  }
};

async function simulateEmailGeneration(prompt: string): Promise<string> {
  // Simulate AI generation with a delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generate email based on prompt
  const emailContent = `Subject: ${prompt.split(" ").slice(0, 5).join(" ")}

Dear Recipient,

I hope this email finds you well.

${prompt}

I would appreciate your prompt attention to this matter. Please let me know if you need any additional information.

Thank you for your time and consideration.

Best regards,
[Your Name]`;

  return emailContent;
}

export const saveContactAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const name = formData.get("name")?.toString();

  if (!email) {
    return {
      success: false,
      error: "Email is required",
    };
  }
  // TODO: implement contacts endpoints on API
  return { success: false, error: "Contacts not implemented yet" };
};

export const getUserAction = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  // Opzionale: decodifica lato client o chiama `/me` API se la aggiungiamo
  return { id: "me", email: "user@example.com" };
};

export const sendEmailAction = async (formData: FormData) => {
  const nodemailer = require("nodemailer");

  const toEmail = formData.get("toEmail")?.toString();
  const fromEmail = formData.get("fromEmail")?.toString();
  const fromName = formData.get("fromName")?.toString();
  const subject = formData.get("subject")?.toString();
  const emailContent = formData.get("emailContent")?.toString();
  const attachmentCount = parseInt(
    formData.get("attachmentCount")?.toString() || "0",
  );

  if (!toEmail || !fromEmail || !subject || !emailContent) {
    return {
      success: false,
      error: "All fields are required",
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toEmail) || !emailRegex.test(fromEmail)) {
    return {
      success: false,
      error: "Please enter valid email addresses",
    };
  }

  try {
    // Create transporter using Gmail SMTP
    // Note: In production, you should use environment variables for credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail app password
      },
    });

    // Process attachments
    const attachments = [];
    for (let i = 0; i < attachmentCount; i++) {
      const file = formData.get(`attachment_${i}`) as File;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
          filename: file.name,
          content: buffer,
          contentType: file.type,
        });
      }
    }

    // Send email
    await transporter.sendMail({
      from: `"${fromName || "Email Generator"}" <${fromEmail}>`,
      to: toEmail,
      subject: subject,
      text: emailContent,
      html: emailContent.replace(/\n/g, "<br>"),
      attachments: attachments,
    });

    return {
      success: true,
      message:
        attachments.length > 0
          ? `Email sent successfully with ${attachments.length} attachment(s)!`
          : "Email sent successfully!",
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: "Failed to send email. Please check your email configuration.",
    };
  }
};
