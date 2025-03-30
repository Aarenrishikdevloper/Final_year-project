// src/app/api/send-certificate-email/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Rate limiting configuration
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // Max 5 requests per minute

export async function POST(request) {
  try {
    // Rate limiting check
    const ip = request.headers.get("x-forwarded-for") || request.ip;
    const currentTime = Date.now();

    if (rateLimit.has(ip)) {
      const userData = rateLimit.get(ip);
      if (currentTime - userData.lastRequest < RATE_LIMIT_WINDOW) {
        if (userData.count >= RATE_LIMIT_MAX) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
          );
        }
        userData.count += 1;
      } else {
        rateLimit.set(ip, { lastRequest: currentTime, count: 1 });
      }
    } else {
      rateLimit.set(ip, { lastRequest: currentTime, count: 1 });
    }

    // Validate input data
    const {
      recipient,
      candidateName,
      instituteName,
      certificateId,
      certificateLink,
    } = await request.json();

    if (
      !recipient ||
      !candidateName ||
      !instituteName ||
      !certificateId ||
      !certificateLink
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      return NextResponse.json(
        { error: "Invalid recipient email format" },
        { status: 400 }
      );
    }

    // Configure email transporter with secure options
    const transporter = nodemailer.createTransport({
      service: "gmail",
      pool: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Should be an app password without spaces
      },
      tls: {
        rejectUnauthorized: true, // Important for production
      },
      logger: true, // Enable logging
    });

    // Verify connection configuration
    await transporter.verify();

    // Send email with improved security headers
    const mailOptions = {
      from: `"${instituteName}" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `Your Certificate from ${instituteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a5276;">Certificate Issued Successfully</h2>
          <p>Dear ${candidateName},</p>
          <p>We are pleased to inform you that ${instituteName} has issued your certificate.</p>
          <p>Certificate ID: <strong>${certificateId}</strong></p>
          <p>You can view and download your certificate using the following link:</p>
          <p><a href="${certificateLink}" style="color: #2874a6; text-decoration: none;">View Your Certificate</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br/>${instituteName}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      `,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        messageId: info.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);

    let errorMessage = "Failed to send email";
    let statusCode = 500;

    if (error.code === "EAUTH") {
      errorMessage = "Authentication failed. Please check email credentials.";
      statusCode = 401;
    } else if (error.code === "EENVELOPE") {
      errorMessage = "Invalid email parameters";
      statusCode = 400;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}
