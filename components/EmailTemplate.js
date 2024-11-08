import React from 'react';

// Template untuk Email Konfirmasi
const EmailTemplate = ({ fullName, event }) => {
    const eventDate = new Date(event.date);
    const formattedDate = `${eventDate.toLocaleDateString()} ${eventDate.toLocaleTimeString()}`;

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', margin: '0', padding: '20px' }}>
            <table style={{ width: '100%', maxWidth: '600px', margin: '0 auto', border: '0' }}>
                <tr>
                    <td style={{ textAlign: 'center', paddingBottom: '20px' }}>
                        <h1 style={{ color: '#3498db' }}>Event Confirmation</h1>
                    </td>
                </tr>
                <tr>
                    <td style={{ textAlign: 'center', paddingBottom: '20px' }}>
                        <img
                            src={event.image.url}
                            alt={event.event_name}
                            style={{ width: '100%', height: 'auto', maxWidth: '600px' }}
                        />
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '20px 0', fontSize: '16px', lineHeight: '1.5' }}>
                        <p><strong>Hello {fullName},</strong></p>
                        <p>Thank you for registering for the event:</p>
                        <h2>{event.event_name}</h2>
                        <p><strong>Location:</strong> {event.location}</p>
                        <p><strong>Date:</strong> {formattedDate}</p>
                        <p><strong>Description:</strong> {event.description}</p>
                    </td>
                </tr>
                <tr>
                    <td style={{ paddingTop: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '14px', color: '#999' }}>We are excited to have you with us!</p>
                        <p style={{ fontSize: '14px', color: '#999' }}>If you have any questions, feel free to reach out.</p>
                    </td>
                </tr>
            </table>
        </div>
    );
};

export default EmailTemplate;
