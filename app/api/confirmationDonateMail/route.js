import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
}

export async function POST(req) {
    console.log("Menerima permintaan untuk mengirim email konfirmasi donasi");

    try {
        const { email, fullName, donationAmount, date } = await req.json();
        console.log("Body permintaan yang diuraikan:", { email, fullName, donationAmount, date });

        const formattedDate = formatDate(date);

        console.log("Mencoba mengirim email ke:", email);

        const response = await resend.emails.send({
            from: 'admin@kalangsaripride.social',
            to: email,
            subject: '🌟 Terima Kasih atas Donasi Anda ke KalangsariPride!',
            text: `Halo ${fullName},\n\nTerima kasih atas donasi Anda sebesar IDR ${donationAmount.toLocaleString()}.\n\nKami sangat senang dengan dukungan Anda!\n\nTanggal: ${formattedDate}\n\nSalam hangat,\nTim KalangsariPride`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; color: #333;">
                    <header style="text-align: center; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 24px;">Komunitas KalangsariPride</h1>
                        <p style="font-size: 14px; color: #333; margin-top: 5px;">Memberdayakan Perubahan, Bersama</p>
                    </header>

                    <main style="padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">
                        <h2 style="font-size: 20px; color: #333;">Halo ${fullName},</h2>
                        <p>Terima kasih atas donasi Anda sebesar <strong>IDR ${donationAmount.toLocaleString()}</strong>. Dukungan Anda membantu kami membuat dampak yang berarti di komunitas kami.</p>
                        <p>
                            <strong>Detail Donasi:</strong><br>
                            Tanggal: ${formattedDate}
                        </p>
                        <p>Kontribusi Anda sangat dihargai. Bersama-sama, kita membuat perbedaan dan membangun masa depan yang lebih cerah untuk semua orang di Kalangsari.</p>
                        <p>Terima kasih atas dedikasi Anda yang luar biasa!</p>
                    </main>

                    <footer style="margin-top: 30px; text-align: center; padding-top: 10px; color: #777; font-size: 12px;">
                        <p>Tetap terhubung dengan KalangsariPride</p>
                        <p>© ${new Date().getFullYear()} Komunitas KalangsariPride | Semua Hak Dilindungi</p>
                    </footer>
                </div>
            `
        });

        console.log("Pesan berhasil dikirim:", response.id);

        return new Response(
            JSON.stringify({ message: 'Email konfirmasi donasi berhasil dikirim', messageId: response.id }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error('Kesalahan mengirim email:', error);

        return new Response(
            JSON.stringify({ message: 'Kesalahan mengirim email', error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}