import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Dalam implementasi nyata, Anda akan menyimpan data ke database
    // dan mengirim email konfirmasi
    console.log('Volunteer registration received:', data);
    
    // Simulasi delay untuk menunjukkan proses
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Pendaftaran volunteer berhasil dikirim!',
      data: {
        id: `VOL-${Date.now()}`,
        status: 'PENDING',
        ...data
      }
    });
  } catch (error) {
    console.error('Error in volunteer registration:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat memproses pendaftaran.'
    }, { status: 500 });
  }
} 