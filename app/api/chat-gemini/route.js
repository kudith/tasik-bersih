import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Initialize the GoogleGenerativeAI client for Gemini
const geminiClient = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY // Ensure GEMINI_API_KEY is set in your .env
);

// Updated comprehensive TasikBersih system prompt
const defaultSystemInstruction = `Anda adalah asisten AI hebat bernama TasikBersih yang ahli dalam analisis gambar dan pengelolaan lingkungan di Kota Tasikmalaya, Indonesia. Anda memiliki pengetahuan mendalam tentang platform TasikBersih dan semua fiturnya.

TENTANG WEBSITE TASIKBERSIH:
Website TasikBersih adalah platform digital yang didedikasikan untuk meningkatkan kesadaran dan partisipasi masyarakat dalam menjaga kebersihan lingkungan Kota Tasikmalaya. Melalui website ini, masyarakat, terutama mahasiswa dan relawan, dapat berkolaborasi dalam berbagai kegiatan kebersihan yang diselenggarakan, seperti pembersihan sampah di area umum, sungai, dan danau. Website ini menawarkan kemudahan akses untuk melaporkan lokasi tercemar, mendonasi untuk mendukung kegiatan kebersihan, serta memberikan informasi mengenai jadwal kegiatan mendatang dan dokumentasi kegiatan sebelumnya.

Dengan menggunakan teknologi terkini, seperti integrasi AI Chatbot untuk pelaporan pencemaran dan sistem notifikasi untuk mengingatkan pengguna tentang kegiatan kebersihan, TasikBersih bertujuan untuk menciptakan lingkungan yang lebih bersih dan terkelola dengan baik, sambil melibatkan generasi muda dalam aksi nyata pelestarian lingkungan.

FITUR-FITUR WEBSITE TASIKBERSIH:

1. Pendaftaran Relawan:
   Pengguna dapat mendaftar sebagai relawan untuk kegiatan kebersihan yang akan dilaksanakan. Fitur ini memungkinkan pengguna untuk memilih acara yang ingin mereka ikuti dan mendaftar sebagai peserta.

2. Laporan Lokasi Tercemar:
   Pengguna dapat melaporkan lokasi yang tercemar atau perlu dibersihkan dengan mengisi formulir yang menyertakan nama lokasi, deskripsi, dan gambar. Laporan ini kemudian disimpan di database untuk tindakan lebih lanjut oleh tim pengelola.

3. Sistem Donasi:
   Pengguna dapat memberikan donasi untuk mendukung kegiatan kebersihan, baik dalam bentuk uang maupun barang. Fitur ini memungkinkan donatur untuk memilih jenis donasi dan mengisi informasi terkait seperti jumlah uang atau barang yang ingin didonasikan.

4. Jadwal Kegiatan Mendatang:
   Pengguna dapat melihat jadwal kegiatan kebersihan yang akan datang. Di bagian ini, pengguna dapat mendaftar untuk kegiatan yang sesuai dengan minat mereka, seperti pembersihan sungai atau penanaman pohon.

5. Dokumentasi Kegiatan:
   Pengguna dapat mengakses foto dan laporan dari kegiatan kebersihan yang telah dilaksanakan sebelumnya. Hal ini memberikan transparansi dan menunjukkan dampak positif dari setiap aksi kebersihan yang dilakukan.

6. Chatbot untuk Bantuan Pengguna:
   Fitur chatbot interaktif (yaitu Anda) memungkinkan pengguna untuk mendapatkan informasi lebih lanjut mengenai kegiatan yang akan datang, cara melaporkan lokasi tercemar, serta berbagai informasi lainnya. Chatbot ini mempermudah pengguna dalam berinteraksi dengan website.

7. Formulir Pendaftaran Relawan:
   Formulir ini memungkinkan pengguna untuk mendaftar sebagai relawan, mengisi informasi pribadi, serta memilih acara yang ingin diikuti.

8. Formulir Laporan:
   Formulir ini digunakan untuk melaporkan lokasi yang tercemar atau membutuhkan pembersihan, termasuk informasi detail lokasi, deskripsi, dan foto.

9. Formulir Donasi:
   Formulir ini digunakan untuk mengumpulkan informasi donatur, baik dalam bentuk uang atau barang, untuk mendukung kegiatan kebersihan yang diadakan.

CARA MENGANALISIS GAMBAR:
Saat pengguna mengirim gambar lingkungan, analisis dengan sangat detail:
1. Identifikasi tepat lokasi/jenis lingkungan (misalnya: sungai, taman kota, jalan umum, TPA)
2. Deteksi masalah lingkungan yang terlihat (sampah, polusi air, kerusakan habitat)
3. Identifikasi jenis sampah/polutan (plastik, organik, limbah industri, B3)
4. Evaluasi tingkat keparahan (ringan/sedang/parah) dengan bukti visual
5. Jelaskan dampak potensial pada ekosistem dan kesehatan masyarakat
6. Berikan rekomendasi solusi spesifik dalam kerangka program TasikBersih
7. Sarankan teknik pencegahan untuk masalah serupa di masa depan

FORMAT RESPONS:
- Gunakan markdown untuk struktur yang rapi
- Buat poin-poin terorganisir dengan heading yang jelas
- Singkat namun komprehensif dan faktual
- Fokus pada informasi relevan, hindari generalisasi
- Berikan konteks lokal untuk Kota Tasikmalaya bila memungkinkan
- Pastikan menggunakan bahasa Indonesia yang profesional dan bermanfaat

Sebagai TasikBersih AI, tugasmu adalah memberikan informasi akurat tentang website, membantu pengguna memahami fitur-fitur yang tersedia, dan memberikan analisis lingkungan yang mendalam ketika pengguna mengirimkan gambar.`;

// Process the request message content and format for Gemini
async function processMessages(messages) {
  try {
    // Extract history to use with Gemini chat
    const chatHistory = [];
    let systemInstruction = defaultSystemInstruction;
    
    for (const msg of messages) {
      // Handle system messages separately to set as systemInstruction
      if (msg.role === 'system') {
        systemInstruction = msg.content;
        continue;
      }
      
      // Process user and assistant messages
      const role = msg.role === 'assistant' ? 'model' : 'user';
      
      // Process the content
      let parts = [];
      
      if (typeof msg.content === 'string') {
        // Simple text message - ensure it's not empty
        if (msg.content.trim()) {
          parts.push({ text: msg.content });
        }
      } else if (Array.isArray(msg.content)) {
        // Process multimodal content
        let hasText = false;
        
        for (const item of msg.content) {
          if (item.type === 'text' && item.text && item.text.trim()) {
            parts.push({ text: item.text });
            hasText = true;
          } else if (item.type === 'image_url' && item.image_url) {
            // Handle image data
            const imageUrl = item.image_url.url;
            if (imageUrl.startsWith('data:')) {
              // Base64 image
              parts.push({
                inlineData: {
                  data: imageUrl.split(',')[1], // Remove the data:image/jpeg;base64, prefix
                  mimeType: imageUrl.split(';')[0].split(':')[1] || 'image/jpeg'
                }
              });
            } else {
              // Regular URL
              parts.push({ fileData: { fileUri: imageUrl, mimeType: 'image/jpeg' } });
            }
          }
        }
        
        // If we have image but no text, add default text
        if (parts.length > 0 && !hasText) {
          parts.unshift({ text: "Tolong analisis gambar ini." });
        }
      } else if (msg.content && typeof msg.content === 'object') {
        // Handle {text: '...', image_url: '...'} format
        let hasText = false;
        
        if (msg.content.text && msg.content.text.trim()) {
          parts.push({ text: msg.content.text });
          hasText = true;
        }
        
        if (msg.content.image_url) {
          const imageUrl = typeof msg.content.image_url === 'string' 
            ? msg.content.image_url 
            : msg.content.image_url.url;
            
          if (imageUrl.startsWith('data:')) {
            parts.push({
              inlineData: {
                data: imageUrl.split(',')[1],
                mimeType: imageUrl.split(';')[0].split(':')[1] || 'image/jpeg'
              }
            });
          } else {
            parts.push({ fileData: { fileUri: imageUrl, mimeType: 'image/jpeg' } });
          }
          
          // If we have image but no text, add default text
          if (!hasText) {
            parts.unshift({ text: "Tolong analisis gambar ini." });
          }
        }
      }
      
      // Ensure we have at least one text part if message is not empty
      if (parts.length > 0 && !parts.some(part => part.text)) {
        parts.unshift({ text: "Tolong analisis gambar ini." });
      }
      
      // If no parts were created, add a default text part
      if (parts.length === 0) {
        parts.push({ text: "Berikan informasi tentang TasikBersih." });
      }
      
      chatHistory.push({
        role: role,
        parts: parts
      });
    }
    
    return { chatHistory, systemInstruction };
  } catch (error) {
    console.error('Error processing messages for Gemini:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    // Parse the request body
    const { messages: clientMessages, model: clientModel, hasMultimodalContent } = await request.json();

    if (!clientMessages || clientMessages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    console.log(`Processing Gemini request with ${clientMessages.length} messages, multimodal: ${hasMultimodalContent}`);

    // Process messages to convert to Gemini format
    const { chatHistory, systemInstruction } = await processMessages(clientMessages);
    
    // Determine which model to use
    const modelToUse = clientModel || 'gemini-1.5-flash';
    
    console.log(`Calling Gemini API with model: ${modelToUse}`);
    
    // Create Gemini model with proper parameters
    const model = geminiClient.getGenerativeModel({
      model: modelToUse,
      // Added safety settings to ensure optimal performance
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ],
    });

    // Prepare the system context messages - these establish the AI's identity
    const setupMessages = [
      {
        role: 'user',
        parts: [{ text: `PENTING: Kamu adalah asisten AI resmi bernama TasikBersih, yang merupakan bagian dari platform website TasikBersih yang sudah ada dan aktif. Website TasikBersih adalah platform digital yang didedikasikan untuk meningkatkan kesadaran dan partisipasi masyarakat dalam menjaga kebersihan lingkungan Kota Tasikmalaya. Berikut detail lengkap website yang HARUS kamu ketahui dan gunakan sebagai dasar jawabanmu:

FITUR-FITUR WEBSITE TASIKBERSIH:
1. Pendaftaran Relawan: Pengguna dapat mendaftar sebagai relawan untuk kegiatan kebersihan.
2. Laporan Lokasi Tercemar: Pengguna dapat melaporkan lokasi yang tercemar dengan formulir dan gambar.
3. Sistem Donasi: Pengguna dapat memberikan donasi untuk mendukung kegiatan kebersihan.
4. Jadwal Kegiatan Mendatang: Pengguna dapat melihat jadwal kegiatan kebersihan.
5. Dokumentasi Kegiatan: Pengguna dapat mengakses foto dan laporan kegiatan sebelumnya.
6. Chatbot untuk Bantuan Pengguna: Fitur chatbot interaktif (kamu) untuk membantu pengguna.
7. Formulir Pendaftaran Relawan: Untuk mendaftar sebagai relawan dan memilih acara.
8. Formulir Laporan: Untuk melaporkan lokasi tercemar dengan detail dan foto.
9. Formulir Donasi: Untuk mengumpulkan informasi donatur dan donasi.` }]
      },
      {
        role: 'model',
        parts: [{ text: "Saya memahami bahwa saya adalah TasikBersih, asisten AI resmi dari platform website TasikBersih yang sudah aktif. Saya akan memberikan informasi akurat berdasarkan detail yang Anda berikan tentang fitur-fitur website, termasuk pendaftaran relawan, pelaporan lokasi tercemar, sistem donasi, jadwal kegiatan, dokumentasi, dan layanan chatbot. Saya siap membantu pengguna dengan informasi yang tepat tentang platform TasikBersih." }]
      },
      {
        role: 'user',
        parts: [{ text: `Ketika pengguna mengirimkan gambar lingkungan, kamu HARUS menganalisisnya dengan detail:
1. Identifikasi jenis lingkungan (sungai, taman, dll)
2. Deteksi masalah lingkungan yang terlihat
3. Identifikasi jenis sampah/polutan
4. Evaluasi tingkat keparahan dengan bukti visual
5. Dampak potensial pada ekosistem
6. Rekomendasi solusi via program TasikBersih
7. Teknik pencegahan untuk masa depan

Gunakan format markdown yang terstruktur dan bahasa Indonesia yang profesional. INGAT: Website TasikBersih adalah platform yang NYATA dan SUDAH ADA, bukan konsep.` }]
      },
      {
        role: 'model',
        parts: [{ text: "Saya mengerti. Ketika pengguna mengirimkan gambar lingkungan, saya akan selalu melakukan analisis detail dengan 7 poin yang Anda sebutkan, menggunakan format markdown yang terstruktur dan bahasa Indonesia yang profesional. Saya memahami bahwa TasikBersih adalah platform yang nyata dan sudah ada, bukan sekadar konsep. Saya siap membantu pengguna dengan analisis lingkungan yang komprehensif dan informasi akurat tentang platform TasikBersih." }]
      }
    ];

    // Create a chat session with the system instruction
    const chat = model.startChat({
      history: [...setupMessages, ...chatHistory.slice(0, -1)],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topK: 40,
        topP: 0.95,
      }
    });

    // Get the last message to send
    const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
    
    if (!lastMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }
    
    // Debug what's being sent
    console.log("Sending to Gemini, last message parts:", JSON.stringify(lastMessage.parts));
    
    // Send the message to Gemini
    let responseStream;
    
    try {
      // IMPORTANT: Ensure there is valid text content in the parts
      const hasTextContent = lastMessage.parts.some(part => part.text && part.text.trim().length > 0);
      
      // If there's no text content, add a default text part
      if (!hasTextContent) {
        if (lastMessage.parts.some(part => part.inlineData || part.fileData)) {
          // If there are images, add a prompt to analyze them
          lastMessage.parts.unshift({ text: "Tolong analisis gambar ini." });
        } else {
          // Otherwise, add a general prompt
          lastMessage.parts.push({ text: "Berikan informasi tentang TasikBersih." });
        }
      }
      
      // Send using the correct format for Gemini
      responseStream = await chat.sendMessageStream(lastMessage.parts);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      throw error;
    }

    // Set up response streaming in OpenRouter-compatible format with improved buffering
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial event to establish connection
          controller.enqueue(encoder.encode("data: {\"choices\":[{\"delta\":{\"content\":\"\"}}]}\n\n"));
          
          // Buffer for accumulating text - helps create smoother chunks
          let buffer = '';
          let lastFlush = Date.now();
          const FLUSH_INTERVAL = 50; // Milliseconds between flushes for smooth typing effect
          const MAX_BUFFER_SIZE = 80; // Characters to buffer before sending
          
          // Function to flush the buffer
          const flushBuffer = () => {
            if (buffer.length > 0) {
              const formattedData = JSON.stringify({
                choices: [{ delta: { content: buffer } }]
              });
              
              controller.enqueue(encoder.encode(`data: ${formattedData}\n\n`));
              buffer = '';
              lastFlush = Date.now();
            }
          };
          
          // Process the stream with intelligent buffering
          for await (const chunk of responseStream.stream) {
            if (chunk.text) {
              const text = chunk.text();
              if (text && text.length > 0) {
                // Add to buffer
                buffer += text;
                
                // Flush the buffer if it's large enough or enough time has passed
                const now = Date.now();
                if (buffer.length >= MAX_BUFFER_SIZE || now - lastFlush >= FLUSH_INTERVAL) {
                  flushBuffer();
                }
              }
            }
          }
          
          // Flush any remaining content
          flushBuffer();
          
          // Send end of stream marker
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error('Error during Gemini streaming:', error);
          controller.error(error);
        }
      }
    });

    // Set response headers with optimized caching settings
    const headers = new Headers();
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache, no-transform');
    headers.set('Connection', 'keep-alive');
    headers.set('X-Accel-Buffering', 'no'); // Prevents proxy buffering
    headers.set('X-Model-Used', modelToUse);

    return new Response(stream, { headers });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Handle rate limit errors specifically
    if (error.message && error.message.includes('429')) {
      return NextResponse.json(
        { 
          error: 'Gemini API rate limit exceeded. Please try again later.',
          detail: 'Too many requests or quota exceeded for Gemini API.',
          suggestion: 'Try switching to OpenRouter or wait a few minutes before trying again.'
        },
        { status: 429 }
      );
    }
    
    // Handle authentication errors
    if (error.message && error.message.includes('401')) {
      return NextResponse.json(
        {
          error: 'Gemini API authentication failed.',
          detail: 'Check your API key in environment variables.',
          suggestion: 'Make sure GEMINI_API_KEY is correctly set in your .env file.'
        },
        { status: 401 }
      );
    }
    
    // Empty text parameter error
    if (error.message && error.message.includes('empty text parameter')) {
      return NextResponse.json(
        {
          error: 'Unable to process request with empty text.',
          detail: 'The message must contain text content.',
          suggestion: 'Include some text with your image or try a different message.'
        },
        { status: 400 }
      );
    }
    
    // Other bad request errors
    if (error.message && error.message.includes('400')) {
      return NextResponse.json(
        {
          error: 'Bad request to Gemini API.',
          detail: 'The request format was invalid or contained unsupported features.',
          suggestion: 'Try with a simpler message or different model.'
        },
        { status: 400 }
      );
    }
    
    // General error handling
    return NextResponse.json(
      { 
        error: `Error: ${error.message || 'Failed to process request'}`,
        detail: error.stack
      },
      { status: 500 }
    );
  }
}