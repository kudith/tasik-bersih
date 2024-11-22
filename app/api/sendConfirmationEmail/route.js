import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);

    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options);
}

export async function POST(req) {
    console.log("Received request to send confirmation email");

    try {
        const { email, fullName, event, date, time, location, imageUrl } = await req.json();
        console.log("Parsed request body:", { email, fullName, event, date, time, location, imageUrl });

        const formattedDate = formatDate(date);
        const formattedTime = formatTime(time);

        console.log("Attempting to send email to:", email);

        const response = await resend.emails.send({
            from: 'admin@kalangsaripride.social',
            to: email,
            subject: '🌟 Welcome to KalangsariPride! Your Volunteer Confirmation ✔',
            text: `Hello ${fullName},\n\nThank you for signing up to volunteer at: ${event}.\n\nWe are thrilled to have you join us!\n\nDate: ${formattedDate}\nTime: ${formattedTime}\nLocation: ${location}\n\nLooking forward to making a difference together!\n\nBest regards,\nThe KalangsariPride Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; color: #333;">
                    <header style="text-align: center; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 24px;">KalangsariPride Community</h1>
                        <p style="font-size: 14px; color: #333; margin-top: 5px;">Empowering Change, Together</p>
                    </header>
                    
                    <main style="padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">
                        <div style="text-align: center;">
                            <img src="${imageUrl}" alt="Event Image" style="max-width: 100%; height: auto; margin-bottom: 20px;"/>
                        </div>
                        <h2 style="font-size: 20px; color: #333;">Hello ${fullName},</h2>
                        <p>We’re excited to welcome you to our community of change-makers! Thank you for signing up to volunteer at the <strong>${event}</strong> event. Your participation means a lot to us, and we can’t wait to work alongside you.</p>
                        <p>
                            <strong>Event Details:</strong><br>
                            Date: ${formattedDate}<br>
                            Time: ${formattedTime}<br>
                            Location: ${location}
                        </p>
                        <p>Your support helps us make a meaningful impact. Together, we’re not just volunteering – we’re making a difference, building a brighter future for everyone in Kalangsari.</p>
                        <p>See you soon, and thank you for your incredible dedication!</p>
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
            JSON.stringify({ message: 'Volunteer confirmation email sent successfully', messageId: response.id }),
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
