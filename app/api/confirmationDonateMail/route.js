// File: `kalangsaripride-next/app/api/sendDonationConfirmationEmail/route.js`
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

export async function POST(req) {
    console.log("Received request to send donation confirmation email");

    try {
        const { email, fullName, donationAmount, date } = await req.json();
        console.log("Parsed request body:", { email, fullName, donationAmount, date });

        const formattedDate = formatDate(date);

        console.log("Attempting to send email to:", email);

        const response = await resend.emails.send({
            from: 'admin@kalangsaripride.social',
            to: email,
            subject: '🌟 Thank You for Your Donation to KalangsariPride!',
            text: `Hello ${fullName},\n\nThank you for your generous donation of IDR ${donationAmount.toLocaleString()}.\n\nWe are thrilled to have your support!\n\nDate: ${formattedDate}\n\nBest regards,\nThe KalangsariPride Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; color: #333;">
                    <header style="text-align: center; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 24px;">KalangsariPride Community</h1>
                        <p style="font-size: 14px; color: #333; margin-top: 5px;">Empowering Change, Together</p>
                    </header>
                    
                    <main style="padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">
                        <h2 style="font-size: 20px; color: #333;">Hello ${fullName},</h2>
                        <p>Thank you for your generous donation of <strong>IDR ${donationAmount.toLocaleString()}</strong>. Your support helps us make a meaningful impact in our community.</p>
                        <p>
                            <strong>Donation Details:</strong><br>
                            Date: ${formattedDate}
                        </p>
                        <p>Your contribution is greatly appreciated. Together, we’re making a difference and building a brighter future for everyone in Kalangsari.</p>
                        <p>Thank you for your incredible dedication!</p>
                    </main>

                    <footer style="margin-top: 30px; text-align: center; padding-top: 10px; color: #777; font-size: 12px;">
                        <p>Stay connected with KalangsariPride</p>
                        <p>© ${new Date().getFullYear()} KalangsariPride Community | All Rights Reserved</p>
                    </footer>
                </div>
            `
        });

        console.log("Message sent successfully:", response.id);

        return new Response(
            JSON.stringify({ message: 'Donation confirmation email sent successfully', messageId: response.id }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error('Error sending email:', error);

        return new Response(
            JSON.stringify({ message: 'Error sending email', error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}