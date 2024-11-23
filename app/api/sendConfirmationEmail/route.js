import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);

    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('id-ID', options);
}

export async function POST(req) {
    console.log("Menerima permintaan untuk mengirim email konfirmasi");

    try {
        const { email, fullName, event, date, time, location, imageUrl } = await req.json();
        console.log("Body permintaan yang diuraikan:", { email, fullName, event, date, time, location, imageUrl });

        const formattedDate = formatDate(date);
        const formattedTime = formatTime(time);

        console.log("Mencoba mengirim email ke:", email);

        const response = await resend.emails.send({
            from: 'admin@kalangsaripride.social',
            to: email,
            subject: '🌟 Selamat Datang di KalangsariPride! Konfirmasi Relawan Anda ✔',
            text: `Halo ${fullName},\n\nTerima kasih telah mendaftar untuk menjadi relawan di: ${event}.\n\nKami sangat senang Anda bergabung dengan kami!\n\nTanggal: ${formattedDate}\nWaktu: ${formattedTime}\nLokasi: ${location}\n\nKami berharap dapat membuat perbedaan bersama!\n\nSalam hangat,\nTim KalangsariPride`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; color: #333;">
                    <header style="text-align: center; padding-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 24px;">Komunitas KalangsariPride</h1>
                        <p style="font-size: 14px; color: #333; margin-top: 5px;">Memberdayakan Perubahan, Bersama</p>
                    </header>
                    
                    <main style="padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">
                        <div style="text-align: center;">
                            <img src="${imageUrl}" alt="Gambar Acara" style="max-width: 100%; height: auto; margin-bottom: 20px;"/>
                        </div>
                        <h2 style="font-size: 20px; color: #333;">Halo ${fullName},</h2>
                        <p>Kami sangat senang menyambut Anda ke komunitas pembuat perubahan kami! Terima kasih telah mendaftar untuk menjadi relawan di acara <strong>${event}</strong>. Partisipasi Anda sangat berarti bagi kami, dan kami tidak sabar untuk bekerja bersama Anda.</p>
                        <p>
                            <strong>Detail Acara:</strong><br>
                            Tanggal: ${formattedDate}<br>
                            Waktu: ${formattedTime}<br>
                            Lokasi: ${location}
                        </p>
                        <p>Dukungan Anda membantu kami membuat dampak yang berarti. Bersama-sama, kita tidak hanya menjadi relawan – kita membuat perbedaan, membangun masa depan yang lebih cerah untuk semua orang di Kalangsari.</p>
                        <p>Sampai jumpa, dan terima kasih atas dedikasi Anda yang luar biasa!</p>
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
            JSON.stringify({ message: 'Email konfirmasi relawan berhasil dikirim', messageId: response.id }),
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