import { NextApiRequest, NextApiResponse } from 'next';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY; // Store your server key in .env.local

// Export the POST method
export async function POST(req) {
    const { donationAmount, fullName, phoneNumber, email } = await req.json();

    const order_id = `order-${Date.now()}`; // Generate a unique order ID

    const payload = {
        transaction_details: {
            order_id,
            gross_amount: donationAmount,
        },
        credit_card: {
            secure: true,
        },
        customer_details: {
            first_name: fullName.split(' ')[0], // First name from full name
            last_name: fullName.split(' ')[1] || '', // Last name from full name
            email,
            phone: phoneNumber,
        },
    };

    try {
        const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({ error: data.message }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
