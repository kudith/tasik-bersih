import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Konfigurasi nodemailer untuk Titan Email
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'curtis.doyle20@ethereal.email',
        pass: 'EQtwx4M5smwaEdWRcv'
    }
});

// Fungsi POST untuk mengirim email
export async function POST(req) {
    try {
        // Parsing data JSON dari permintaan
        const { from, to, subject, text } = await req.json();

        // Validasi input
        if (!from || !to || !subject || !text) {
            return NextResponse.json(
                { message: 'Invalid input: Missing required fields' },
                { status: 400 }
            );
        }

        // Validasi format email menggunakan regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { message: 'Invalid email format for recipient' },
                { status: 400 }
            );
        }

        // Informasi untuk debugging
        console.log('Preparing to send email:', { from, to, subject, text });

        // Kirim email menggunakan nodemailer (FORMAT HTML)
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER, // Gunakan email yang terautentikasi
            replyTo: from, // Gunakan email pengirim yang diinput oleh pengguna sebagai reply-to
            to, // Email penerima
            subject, // Subjek email
            html: text, // <== Ubah dari "text" ke "html"
        });

        // Log detail pengiriman
        console.log('Email sent successfully:', info);

        // Respon sukses
        return NextResponse.json({ message: 'Email sent successfully', info }, { status: 200 });
    } catch (error) {
        // Log error untuk debugging
        console.error('Error sending email:', error);

        // Respon gagal
        return NextResponse.json(
            {
                message: 'Failed to send email',
                error: error.message, // Pesan error utama
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined, // Tampilkan stack hanya di development
            },
            { status: 500 }
        );
    }
}
