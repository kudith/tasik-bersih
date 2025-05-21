import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure nodemailer using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    }
});

// POST function for sending emails
export async function POST(req) {
    try {
        // Parse JSON data from request
        const { from, to, subject, text } = await req.json();

        // Validate input
        if (!from || !to || !subject || !text) {
            return NextResponse.json(
                { message: 'Invalid input: Missing required fields' },
                { status: 400 }
            );
        }

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { message: 'Invalid email format for recipient' },
                { status: 400 }
            );
        }

        // Debugging information
        console.log('Preparing to send email:', { from, to, subject, text });

        // Send email using nodemailer (HTML FORMAT)
        const info = await transporter.sendMail({
            from: `"TasikBersih Contact" <${process.env.EMAIL_SERVER_USER}>`,
            replyTo: from, // Use sender's email from user input as reply-to
            to, // Recipient email
            subject, // Email subject
            html: text, // Changed from "text" to "html"
        });

        // Log sending details
        console.log('Email sent successfully:', info);

        // Success response
        return NextResponse.json({ message: 'Email sent successfully', info }, { status: 200 });
    } catch (error) {
        // Log error for debugging
        console.error('Error sending email:', error);

        // Error response
        return NextResponse.json(
            {
                message: 'Failed to send email',
                error: error.message, // Main error message
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined, // Show stack only in development
            },
            { status: 500 }
        );
    }
}