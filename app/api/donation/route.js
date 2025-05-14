import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Dalam implementasi nyata, Anda akan mengirim data ke payment gateway
    // dan menyimpan data transaksi ke database
    console.log('Donation data received:', data);
    
    // Simulasi delay untuk menunjukkan proses
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response dengan id pembayaran fiktif
    return NextResponse.json({
      success: true,
      message: 'Donasi berhasil dikirim!',
      data: {
        transactionId: `DON-${Date.now()}`,
        status: 'PENDING',
        paymentUrl: 'https://example.com/payment/redirect', // URL fiktif untuk redirect ke pembayaran
        ...data
      }
    });
  } catch (error) {
    console.error('Error in donation processing:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat memproses donasi.'
    }, { status: 500 });
  }
} 