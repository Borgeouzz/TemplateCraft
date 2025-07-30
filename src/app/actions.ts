"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        user_id: user.id,
        name: fullName,
        email: email,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        // Error handling without console.error
        return encodedRedirect(
          "error",
          "/sign-up",
          "Error updating user. Please try again.",
        );
      }
    } catch (err) {
      // Error handling without console.error
      return encodedRedirect(
        "error",
        "/sign-up",
        "Error updating user. Please try again.",
      );
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

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

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error) {
    return false;
  }

  return !!subscription;
};

export const generateEmailAction = async (formData: FormData) => {
  const prompt = formData.get("prompt")?.toString();
  const supabase = await createClient();

  if (!prompt) {
    return encodedRedirect("error", "/", "Prompt is required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // For non-authenticated users, check session storage for free generation count
    // This will be handled on the client side
    return { success: true, email: await simulateEmailGeneration(prompt) };
  }

  // For authenticated users, check their generation count
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const generatedEmail = await simulateEmailGeneration(prompt);
  return { success: true, email: generatedEmail };
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
    const transporter = nodemailer.createTransporter({
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
