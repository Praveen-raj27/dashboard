import { randomBytes, createHash } from "crypto";
import bcrypt from "bcrypt";
import { Resend } from "resend";

import { executeQuery } from "../config/snowflake.js";

const FRONTEND_URL = process.env.FRONTEND_URL;

const resend = new Resend(process.env.RESEND_API_KEY);

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const genericMessage =
    "If an account exists with this email, you will receive a password reset link shortly.";

  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    if (!process.env.RESEND_API_KEY || !FRONTEND_URL) {
      throw new Error("Resend API key or frontend URL is missing.");
    }

    const users = await executeQuery(
      `
        SELECT ID, NAME, EMAIL
        FROM USERS
        WHERE LOWER(EMAIL) = LOWER(?)
        LIMIT 1
      `,
      [email],
    );

    // Do not reveal whether the email is registered.
    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const user = users[0];

    // Invalidate older unused reset tokens.
    await executeQuery(
      `
        UPDATE PASSWORD_RESET_TOKENS
        SET USED_AT = CURRENT_TIMESTAMP()
        WHERE LOWER(EMAIL) = LOWER(?)
          AND USED_AT IS NULL
      `,
      [email],
    );

    // Generate secure reset token.
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);

    await executeQuery(
      `
        INSERT INTO PASSWORD_RESET_TOKENS (
          EMAIL,
          TOKEN_HASH,
          EXPIRES_AT,
          CREATED_AT
        )
        VALUES (
          ?,
          ?,
          DATEADD(MINUTE, 15, CURRENT_TIMESTAMP()),
          CURRENT_TIMESTAMP()
        )
      `,
      [email, tokenHash],
    );

    const resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

    const safeName = escapeHtml(user.NAME || "there");

    // Send password reset email using Resend.
    const { data, error } = await resend.emails.send({
     from: "Snowpify <onboarding@resend.dev>",
  to: ["snowpify.notifications@gmail.com"],
      subject: "Reset your Snowpify password",

      text: `
Hello ${user.NAME || "there"},

We received a request to reset your Snowpify account password.

Use the following link to reset your password:
${resetLink}

This link expires in 15 minutes and can only be used once.

If you didn't request this, you can safely ignore this email.

Snowpify
      `,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#25352f;">
          <h2 style="margin-bottom:12px;">Reset your password</h2>

          <p>Hello ${safeName},</p>

          <p>
            We received a request to reset your Snowpify account password.
          </p>

          <p style="margin:28px 0;">
            <a href="${resetLink}"
               style="background:#25352f;color:#fff;padding:13px 22px;text-decoration:none;border-radius:7px;display:inline-block;">
              Reset Password
            </a>
          </p>

          <p>
            This link expires in <strong>15 minutes</strong>
            and can only be used once.
          </p>

          <p>
            If you didn't request this, you can safely ignore this email.
          </p>

          <p style="margin-top:32px;color:#777;font-size:13px;">
            Snowpify
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error("Failed to send password reset email.");
    }

    console.log("Password reset email sent:", data?.id);

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to process your request right now. Please try again later.",
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const password = String(req.body.password || "");

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const tokenHash = hashToken(token);

    const records = await executeQuery(
      `
        SELECT EMAIL
        FROM PASSWORD_RESET_TOKENS
        WHERE TOKEN_HASH = ?
          AND USED_AT IS NULL
          AND EXPIRES_AT > CURRENT_TIMESTAMP()
        LIMIT 1
      `,
      [tokenHash],
    );

    if (!records.length) {
      return res.status(400).json({
        success: false,
        message:
          "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    const email = records[0].EMAIL;
    const hashedPassword = await bcrypt.hash(password, 12);

    await executeQuery(
      `
        UPDATE USERS
        SET PASSWORD = ?
        WHERE LOWER(EMAIL) = LOWER(?)
      `,
      [hashedPassword, email],
    );

    // Mark reset token as used.
    await executeQuery(
      `
        UPDATE PASSWORD_RESET_TOKENS
        SET USED_AT = CURRENT_TIMESTAMP()
        WHERE TOKEN_HASH = ?
          AND USED_AT IS NULL
      `,
      [tokenHash],
    );

    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully. Please sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password. Please try again.",
    });
  }
};
