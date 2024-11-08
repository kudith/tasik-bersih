import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    console.log("Received request to send confirmation email");

    try {
        // Parse the JSON body
        const { email, fullName, event, date, location, imageUrl } = await req.json();
        console.log("Parsed request body:", { email, fullName, event, date, location, imageUrl });

        // Attempt to send the email
        console.log("Attempting to send email to:", email);

        const response = await resend.emails.send({
            from: 'volunteer@resend.dev',
            to: email,
            subject: 'Volunteer Confirmation ✔',
            text: `Hello ${fullName},\n\nThank you for signing up to volunteer at: ${event}.\n\nWe are thrilled to have you join us!\n\nDate: ${date}\nLocation: ${location}\n\nLooking forward to making a difference together!`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="text-align: center;">
                        <img src="${imageUrl}" alt="Event Image" style="max-width: 100%; height: auto; border-radius: 8px;"/>
                    </div>
                    <h2 style="color: #333;">Hello ${fullName},</h2>
                    <p>Thank you for signing up to volunteer at: <strong>${event}</strong>.</p>
                    <p>We are thrilled to have you join us!</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p>Looking forward to making a difference together!</p>
                    <p>Best regards,<br>The Volunteer Team</p>
                </div>
            `
        });

        console.log("Message sent successfully:", response.id);

        // Return success response
        return new Response(
            JSON.stringify({ message: 'Volunteer confirmation email sent successfully', messageId: response.id }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error('Error sending email:', error);

        // Return error response
        return new Response(
            JSON.stringify({ message: 'Error sending email', error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
