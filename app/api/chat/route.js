import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import axios from 'axios';

// Inisialisasi klien OpenAI dengan API OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://tasikbersih.org', // Sesuaikan dengan URL website Anda
    'X-Title': 'TasikBersih Chat Assistant', // Nama untuk OpenRouter analytics
    'Content-Type': 'application/json'
  },
});

// Function to fetch events from Strapi API
async function fetchEvents(locale = 'id') {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/events?locale=${locale}&populate=*`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Function to encode image to base64
async function encodeImageToBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const base64Image = buffer.toString('base64');
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error("Error encoding image:", error);
    return null;
  }
}

// Format events for AI consumption
function formatEvents(events) {
  if (!events || events.length === 0) {
    return "Tidak ada event yang akan datang dalam waktu dekat.";
  }

  const formattedEvents = events.map(event => {
    // Parse date
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    
    // Parse time if available
    let formattedTime = "Waktu belum ditentukan";
    if (event.time) {
      try {
        const timeOnly = new Date(`1970-01-01T${event.time}`);
        formattedTime = timeOnly.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        console.error("Error formatting time:", e);
      }
    }
    
    // Get image URL if available
    let imageUrl = "";
    try {
      if (event.image && event.image.length > 0) {
        if (event.image[0].formats && event.image[0].formats.medium) {
          imageUrl = event.image[0].formats.medium.url;
        } else if (event.image[0].url) {
          imageUrl = event.image[0].url;
        }
      }
    } catch (e) {
      console.error("Error processing image:", e);
    }

    return `
### ${event.event_name}
- Tanggal: ${formattedDate}
- Waktu: ${formattedTime}
- Lokasi: ${event.location || 'Lokasi belum ditentukan'}
${imageUrl ? `- [Lihat Gambar](${imageUrl})` : ''}
`;
  }).join("\n");

  return `Berikut adalah daftar event TasikBersih yang akan datang:\n${formattedEvents}`;
}

// Format events as structured data for AI context
function formatEventsForAI(events) {
  if (!events || events.length === 0) {
    return [{
      name: "Tidak ada event",
      date: "-",
      time: "-",
      location: "-",
      description: "Saat ini tidak ada event yang akan datang."
    }];
  }

  return events.map(event => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    
    let formattedTime = "Belum ditentukan";
    if (event.time) {
      try {
        const timeOnly = new Date(`1970-01-01T${event.time}`);
        formattedTime = timeOnly.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        console.error("Error formatting time:", e);
      }
    }

    return {
      name: event.event_name,
      date: formattedDate,
      time: formattedTime,
      location: event.location || 'Lokasi belum ditentukan',
      description: event.description || 'Tidak ada deskripsi tambahan'
    };
  });
}

// Check if a message is asking about events
function isAskingAboutEvents(message) {
  // Use more specific phrases that clearly indicate an event question
  const eventPhrases = [
    'jadwal event', 'jadwal acara', 'daftar event', 'daftar acara',
    'kapan ada event', 'kapan acara', 'event berikutnya', 'acara berikutnya', 
    'kegiatan berikutnya', 'jadwal kegiatan', 'agenda kegiatan',
    'event yang akan datang', 'acara yang akan datang', 'kegiatan yang akan datang'
  ];

  // General keywords that might indicate event interest but need to be more careful with
  const generalEventKeywords = [
    'tanggal berapa', 'di mana', 'lokasi acara', 'lokasi event',
    'lokasi kegiatan', 'detail event', 'detail acara', 'informasi event'
  ];
  
  // Terms related to event activities but that shouldn't trigger event detection on their own
  const activityTerms = [
    'pembersihan', 'sungai', 'sampah', 'lingkungan'
  ];
  
  // Extract text from various message formats
  const extractText = (msg) => {
    if (Array.isArray(msg)) {
      const textParts = msg.filter(part => part.type === 'text');
      return textParts.map(part => part.text || '').join(' ').toLowerCase();
    } else if (msg && typeof msg === 'object' && msg.text) {
      return msg.text.toLowerCase();
    } else if (typeof msg === 'string') {
      return msg.toLowerCase();
    }
    return '';
  };
  
  const text = extractText(message);
  if (!text) return false;
  
  // If the message contains a specific event phrase, it's definitely about events
  if (eventPhrases.some(phrase => text.includes(phrase))) {
    return true;
  }
  
  // If the message contains general event keywords with activity terms, it might be about events
  if (generalEventKeywords.some(keyword => text.includes(keyword)) && 
      activityTerms.some(term => text.includes(term))) {
    return true;
  }
  
  // If message contains words like "event" or "acara" in a question context, it might be about events
  const questionWords = ['apa', 'kapan', 'dimana', 'di mana', 'siapa', 'bagaimana', 'mengapa', 'berapa'];
  const eventWords = ['event', 'acara', 'kegiatan', 'aktivitas', 'agenda'];
  
  // Check for combination of question words with event words for a higher confidence detection
  const hasQuestionContext = questionWords.some(word => text.includes(word));
  const hasEventTerm = eventWords.some(word => text.includes(word));
  
  if (hasQuestionContext && hasEventTerm) {
    return true;
  }
  
  // Default to false - more conservative approach to avoid false positives
  return false;
}

// Process a single message content that may contain text or image
async function processMessageContent(content) {
  try {
    // If content is already in the OpenRouter expected format, return as is
    if (Array.isArray(content)) {
      // Validate each item in the array has the required format
      const isValidContent = content.every(item => 
        (item.type === 'text' && typeof item.text === 'string') ||
        (item.type === 'image_url' && item.image_url && typeof item.image_url.url === 'string')
      );
      
      if (isValidContent) {
        // Untuk Llama 4 Maverick, log tipe gambar yang diproses untuk debugging
        content.forEach(item => {
          if (item.type === 'image_url' && item.image_url) {
            const url = item.image_url.url || '';
            const isBase64 = url.startsWith('data:');
            console.log(`Image format: ${isBase64 ? 'base64' : 'URL'}, starts with: ${url.substring(0, 30)}...`);
          }
        });
        return content;
      } else {
        console.log('Content array has invalid format, attempting to fix:', 
          Array.isArray(content) ? `Array with ${content.length} items` : typeof content);
        
        // Try to fix the format
        return content.map(item => {
          if (item.type === 'text' && typeof item.text === 'string') {
            return item;
          } else if (item.type === 'image_url' && item.image_url) {
            // Ensure the URL is properly formatted for base64 images
            let imageUrl = typeof item.image_url === 'string' 
              ? item.image_url 
              : (item.image_url.url || '');
              
            // For Llama 4 Maverick, ensure correct base64 format
            if (imageUrl.startsWith('data:')) {
              // Llama 4 Maverick supports all standard image formats
              console.log('Processing base64 image for Llama 4 Maverick');
              return {
                type: 'image_url',
                image_url: { url: imageUrl }
              };
            } else {
              // If not a data URL, make sure it's still properly formatted
              console.log('Processing URL image for Llama 4 Maverick');
              return {
                type: 'image_url',
                image_url: { url: imageUrl }
              };
            }
          } else if (typeof item === 'string') {
            return { type: 'text', text: item };
          } else {
            return { type: 'text', text: JSON.stringify(item) };
          }
        });
      }
    }
    
    // If content is a string, return as text
    if (typeof content === 'string') {
      return [{ type: 'text', text: content }];
    }
    
    // Handle case where content might be an array-like structure but not a proper array
    if (content && typeof content === 'object' && content.length !== undefined) {
      try {
        // Convert to proper array if possible
        const contentArray = Array.from(content);
        return await processMessageContent(contentArray); // Process the converted array
      } catch (e) {
        console.error("Error converting content to array:", e);
      }
    }
    
    // If content has only image_url property (from frontend)
    if (content && content.image_url && !content.text) {
      const imageUrl = typeof content.image_url === 'string' 
        ? content.image_url 
        : (content.image_url.url || '');
      
      // For InternVL3, ensure correct image format
      return [
        { type: 'image_url', image_url: { url: imageUrl } }
      ];
    }
    
    // If content has both text and image
    if (content && content.text && content.image_url) {
      const imageUrl = typeof content.image_url === 'string' 
        ? content.image_url 
        : (content.image_url.url || '');
      
      // InternVL3 expects text first, then image
      return [
        { type: 'text', text: content.text },
        { type: 'image_url', image_url: { url: imageUrl } }
      ];
    }
    
    // If content is structured with type and text fields directly
    if (content && content.type === 'text' && content.text) {
      return [{ type: 'text', text: content.text }];
    }
    
    // If content is structured with type and image_url fields directly
    if (content && content.type === 'image_url' && content.image_url) {
      const imageUrl = typeof content.image_url === 'string' 
        ? content.image_url 
        : (content.image_url.url || '');
      
      return [{ type: 'image_url', image_url: { url: imageUrl } }];
    }
    
    // Default fallback - try to convert to string
    console.log('Using fallback for content format:', typeof content, content);
    return [{ type: 'text', text: String(content || '') }];
  } catch (error) {
    console.error("Error in processMessageContent:", error);
    return [{ type: 'text', text: 'Error processing message content' }];
  }
}

// Default system prompt untuk TasikBersih
const defaultSystemPrompt = {
  role: "system",
  content: `Anda adalah asisten AI hebat bernama TasikBersih yang ahli dalam analisis gambar dan pengelolaan lingkungan di Kota Tasikmalaya, Indonesia. Tugas utama Anda adalah memberikan informasi akurat dan analisis gambar lingkungan yang detail.

TENTANG TASIKBERSIH:
TasikBersih adalah platform digital untuk meningkatkan partisipasi masyarakat dalam menjaga kebersihan lingkungan di Tasikmalaya. Platform ini menawarkan fitur pendaftaran relawan, pelaporan lokasi tercemar, sistem donasi, jadwal kegiatan, dokumentasi kegiatan, dan chatbot AI untuk menjawab pertanyaan pengguna.

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
- Jangan gunakan kata-kata yang tidak sesuai atau tidak profesional
- Pastikan respons selalu detail dan akurat

Jika tidak ada gambar, fokus pada memberikan informasi platform TasikBersih dengan detail yang relevan dan bermanfaat.`
};

// Sistem prompt untuk pertanyaan tentang relawan
const volunteerSystemPrompt = {
  role: "system",
  content: `Anda adalah asisten AI TasikBersih yang memberikan informasi tentang cara menjadi relawan dan proses pendaftaran relawan di platform TasikBersih.

CARA MENJADI RELAWAN TASIKBERSIH:
Untuk menjadi relawan TasikBersih, pengguna dapat:

1. Kunjungi situs web TasikBersih dan cari bagian "Volunteer" atau "Relawan"
2. Isi formulir pendaftaran dengan informasi pribadi lengkap (nama, alamat, nomor telepon, email)
3. Pilih jenis pendaftaran:
   - Individu: Daftar sebagai relawan perorangan
   - Kelompok: Daftar sebagai kelompok/komunitas dengan menyertakan jumlah anggota
4. Pilih event atau kegiatan yang ingin diikuti dari daftar yang tersedia
5. Berikan motivasi untuk menjadi relawan
6. Konfirmasi pendaftaran dan tunggu email konfirmasi

JAWAB PERTANYAAN PENGGUNA:
- Berikan panduan langkah demi langkah yang jelas
- Fokus pada proses pendaftaran relawan yang praktis
- Jelaskan manfaat menjadi relawan jika relevan
- Jangan menganalisis gambar atau topik yang tidak terkait dengan pendaftaran relawan

FORMAT RESPONS:
- Gunakan format yang rapi dengan poin-poin terstruktur
- Berikan informasi konkret dan praktis
- Sampaikan jawaban dengan ramah dan memotivasi`
};

// Check if a message is asking about volunteering
function isVolunteerQuestion(message) {
  // Volunteer-related keywords
  const volunteerKeywords = [
    'relawan', 'menjadi relawan', 'cara menjadi relawan', 'bagaimana cara mendaftar',
    'pendaftaran relawan', 'mendaftar relawan', 'bagaimana cara menjadi',
    'volunteer', 'jadi relawan', 'ikut relawan'
  ];
  
  // Helper to check text against keywords
  const containsVolunteerKeyword = (text) => {
    const lowerText = typeof text === 'string' ? text.toLowerCase() : '';
    return volunteerKeywords.some(keyword => lowerText.includes(keyword));
  };
  
  // Check if message is an array (multimodal message with images)
  if (Array.isArray(message)) {
    // Extract text parts from the message array
    const textParts = message.filter(part => part.type === 'text');
    if (textParts.length === 0) return false; // No text content to check
    
    // Check each text part
    return textParts.some(part => containsVolunteerKeyword(part.text));
  }
  
  // Check if message is an object with text property
  if (message && typeof message === 'object' && message.text) {
    return containsVolunteerKeyword(message.text);
  }
  
  // For plain string messages
  if (typeof message === 'string') {
    return containsVolunteerKeyword(message);
  }
  
  // Default fallback - if we can't determine
  return false;
}

// Menambahkan beberapa model alternatif yang bisa digunakan
const freeModels = {
  primary: 'meta-llama/llama-4-maverick:free',      // Model utama yang mendukung gambar dan streaming
  fallback1: 'deepseek/deepseek-chat-v3-0324:free',  // Fallback jika internvl3 rate limit
  textOnly: 'deepseek/deepseek-chat-v3-0324:free'       // Untuk pertanyaan teks saja
};

// Fungsi untuk mengelola error dan mencoba dengan model alternatif
async function createChatCompletionWithFallback(messages, isMultimodal = false) {
  let attemptedModels = [];
  let lastError = null;
  
  // Tentukan urutan model yang akan dicoba berdasarkan konten multimodal atau tidak
  const modelPriority = isMultimodal 
    ? [freeModels.primary, freeModels.fallback1]  // Untuk konten dengan gambar
    : [freeModels.primary, freeModels.fallback1, freeModels.textOnly]; // Untuk teks saja
  
  for (const model of modelPriority) {
    try {
      attemptedModels.push(model);
      console.log(`Mencoba model: ${model}`);
      
      // Konfigurasi yang dioptimalkan untuk Llama 4 Maverick
      let config = {
        model: model,
        messages: messages,
        stream: true,
      };
      
      // Konfigurasi yang dioptimalkan untuk Llama 4 Maverick
      if (model === freeModels.primary) {
        config = {
          ...config,
          temperature: 0.65,          
          max_tokens: 5000,           
          top_p: 0.95,                
          frequency_penalty: 0.2,     
          presence_penalty: 0.2,     
        };
      } else {
        // Default untuk model lain
        config = {
          ...config,
          temperature: 0.7,
          max_tokens: 8000,
        };
      }
      
      const response = await openai.chat.completions.create(config);
      
      // Simpan model yang berhasil digunakan dalam global response info
      response.modelUsed = model;
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Error dengan model ${model}:`, error.message || error);
      
      // Jika bukan rate limit (429), langsung lempar error
      if (error.code !== 429) {
        throw error;
      }
      
      // Log rate limit dan coba model berikutnya
      console.log(`Rate limit tercapai untuk model ${model}, mencoba model alternatif...`);
      // Tunggu sebentar sebelum mencoba model berikutnya
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Jika semua model gagal, kembalikan error terakhir
  console.error(`Semua model gagal: ${attemptedModels.join(', ')}`);
  throw lastError;
}

export async function POST(request) {
  try {
    // Parse the request as formData if it's multipart/form-data, otherwise as JSON
    let messages = [];
    let hasMultimodalContent = false;
    let rawData;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with potential file uploads
      const formData = await request.formData();
      rawData = formData.get('data');
      
      if (rawData) {
        try {
          const parsedData = JSON.parse(rawData);
          messages = parsedData.messages || [];
          hasMultimodalContent = parsedData.hasMultimodalContent || false;
        } catch (e) {
          console.error("Error parsing form data:", e);
          return NextResponse.json(
            { error: 'Invalid JSON in form data' },
            { status: 400 }
          );
        }
      }
    } else {
      // Handle regular JSON requests
      const jsonData = await request.json();
      messages = jsonData.messages || [];
      hasMultimodalContent = jsonData.hasMultimodalContent || false;
    }
    
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }
    
    console.log(`Processing request with ${messages.length} messages, multimodal content: ${hasMultimodalContent}`);
    
    // Get the last user message
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    
    // Process messages to handle multimodal content
    const processedMessages = await Promise.all(messages.map(async (msg) => {
      // Keep system messages as is
      if (msg.role === 'system') {
        return msg;
      }
      
      // Untuk user message, log jika ada gambar untuk debugging
      if (msg.role === 'user') {
        const hasImage = Array.isArray(msg.content) && 
          msg.content.some(item => item.type === 'image_url');
        
        if (hasImage) {
          console.log('User message contains image, content structure:', 
            Array.isArray(msg.content) ? 
              `Array with ${msg.content.length} items` : 
              typeof msg.content
          );
          
          // Log hanya beberapa informasi dari gambar untuk debugging
          if (Array.isArray(msg.content)) {
            msg.content.forEach((item, i) => {
              if (item.type === 'image_url' && item.image_url) {
                const url = item.image_url.url || '';
                console.log(`Image ${i} type: ${item.type}, starts with: ${url.substring(0, 30)}...`);
              }
            });
          }
        }
      }
      
      // For user and assistant messages, process content which may include images
      try {
        const processedContent = await processMessageContent(msg.content);
        return {
          ...msg,
          content: processedContent
        };
      } catch (error) {
        console.error("Error processing message content:", error);
        // Return the original message if processing fails
        return msg;
      }
    }));
    
    // Check if user is asking about volunteering - check both raw and processed content
    let isVolunteerInquiry = false;
    if (lastUserMessage) {
      // Find the processed version of the last user message
      const lastUserIndex = messages.indexOf(lastUserMessage);
      const processedUserMessage = lastUserIndex >= 0 ? processedMessages[lastUserIndex] : null;
      
      if (processedUserMessage) {
        isVolunteerInquiry = isVolunteerQuestion(processedUserMessage.content);
      } else {
        isVolunteerInquiry = isVolunteerQuestion(lastUserMessage.content);
      }
    }
    
    // Fetch events for context regardless of question
    const events = await fetchEvents();
    const formattedEventsForDisplay = formatEvents(events);
    const formattedEventsForAI = formatEventsForAI(events);
    
    // Extract event images for visual context if available
    const eventImagesBase64 = [];
    try {
      // Get up to 2 event images to include as visual context
      for (const event of events.slice(0, 2)) {
        if (event.image && event.image.length > 0) {
          let imageUrl = '';
          if (event.image[0].formats && event.image[0].formats.small) {
            imageUrl = event.image[0].formats.small.url;
          } else if (event.image[0].url) {
            imageUrl = event.image[0].url;
          }
          
          if (imageUrl) {
            const base64Image = await encodeImageToBase64(imageUrl);
            if (base64Image) {
              eventImagesBase64.push(base64Image);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing event images:", error);
    }
    
    // Check if user is asking about events
    let isEventQuestion = false;
    if (lastUserMessage && !isVolunteerInquiry) {
      // Only check for event questions if it's not a volunteer question
      const lastUserIndex = messages.indexOf(lastUserMessage);
      const processedUserMessage = lastUserIndex >= 0 ? processedMessages[lastUserIndex] : null;
      
      if (processedUserMessage) {
        isEventQuestion = isAskingAboutEvents(processedUserMessage.content);
      } else {
        isEventQuestion = isAskingAboutEvents(lastUserMessage.content);
      }
    }
    
    // Handle volunteer-related questions with specific prompt
    if (isVolunteerInquiry) {
      try {
        console.log("Detected volunteer-related question, using volunteer specific approach...");
        
        // Create messages with volunteer-specific system prompt
        const messagesWithVolunteerContext = [
          volunteerSystemPrompt,
          ...processedMessages
        ];
        
        // Use the fallback function to try multiple models
        const response = await createChatCompletionWithFallback(
          messagesWithVolunteerContext, 
          false // Volunteer questions are typically text-only
        );
        
        // Stream response
        const encoder = new TextEncoder();
        const modelInfo = response.modelUsed || freeModels.primary;
        
        // Create headers and add model information
        const headers = new Headers();
        headers.set('Content-Type', 'text/event-stream');
        headers.set('Cache-Control', 'no-cache');
        headers.set('Connection', 'keep-alive');
        headers.set('X-Model-Used', modelInfo);
        
        const stream = new ReadableStream({
          async start(controller) {
            try {
              let closed = false; // Flag to track if controller has been closed
              
              // Process streaming from OpenRouter (same as OpenAI API)
              for await (const chunk of response) {
                // If controller is already closed, don't try to enqueue more
                if (closed) break;
                
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  // Send chunk to client
                  controller.enqueue(encoder.encode(content));
                }
              }
              
              // Only close if not already closed
              if (!closed) {
                closed = true;
                controller.close();
              }
            } catch (error) {
              console.error('Error during streaming:', error);
              controller.error(error);
            }
          }
        });
        
        // Return response as stream with custom headers
        return new Response(stream, { headers });
      }
      catch (error) {
        console.error("Error handling volunteer query:", error);
        // Fall back to generic AI response if there's an error
      }
    }
    
    if (isEventQuestion) {
      try {
        // Option 1: Hybrid approach - Provide direct answer for clear event questions
        console.log("Detected event-related question, using hybrid approach...");
        
        // Add event data to context for the model
        const eventContext = {
          role: "system",
          content: `INFORMASI EVENT TERBARU:
${formattedEventsForDisplay}

Gunakan informasi di atas untuk menjawab pertanyaan pengguna tentang event/acara/kegiatan yang akan datang.`
        };
        
        // Create messages with both text context and image context if available
        const messagesWithEventData = [
          defaultSystemPrompt,
          eventContext,
          ...processedMessages
        ];
        
        // Add event images as visual context if available and the last message doesn't already have images
        if (eventImagesBase64.length > 0 && 
            !lastUserMessage.content?.some?.(item => item.type === 'image_url')) {
          // Create a assistant message introducing the images
          messagesWithEventData.push({
            role: "assistant",
            content: "Berikut adalah gambar dari beberapa event yang akan datang:"
          });
          
          // Add images as separate user messages
          for (const base64Image of eventImagesBase64) {
            messagesWithEventData.push({
              role: "user",
              content: [
                { 
                  type: "image_url", 
                  image_url: { url: base64Image }
                }
              ]
            });
          }
          
          // Add a follow-up question to process the images
          messagesWithEventData.push({
            role: "user",
            content: "Berdasarkan gambar-gambar event di atas, mohon berikan informasi lebih detail tentang event-event tersebut."
          });
        }
        
        // Periksa apakah ada gambar dalam pesan
        const hasImage = messagesWithEventData.some(msg => 
          Array.isArray(msg.content) && 
          msg.content.some(item => item.type === 'image_url')
        );
        
        // Gunakan fungsi fallback untuk mencoba beberapa model
        const response = await createChatCompletionWithFallback(
          messagesWithEventData, 
          hasImage || eventImagesBase64.length > 0
        );
        
        // Stream response
        const encoder = new TextEncoder();
        const modelInfo = response.modelUsed || freeModels.primary;
        
        // Buat header dan tambahkan informasi model
        const headers = new Headers();
        headers.set('Content-Type', 'text/event-stream');
        headers.set('Cache-Control', 'no-cache');
        headers.set('Connection', 'keep-alive');
        headers.set('X-Model-Used', modelInfo);
        
        const stream = new ReadableStream({
          async start(controller) {
            try {
              let closed = false; // Flag to track if controller has been closed
              
              // Proses streaming dari OpenRouter (sama seperti OpenAI API)
              for await (const chunk of response) {
                // If controller is already closed, don't try to enqueue more
                if (closed) break;
                
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  // Kirim chunk ke client
                  controller.enqueue(encoder.encode(content));
                }
              }
              
              // Only close if not already closed
              if (!closed) {
                closed = true;
                controller.close();
              }
            } catch (error) {
              console.error('Error during streaming:', error);
              controller.error(error);
            }
          }
        });
        
        // Return response sebagai stream dengan header custom
        return new Response(stream, { headers });
      }
      catch (error) {
        console.error("Error handling event query:", error);
        // Fall back to generic AI response if there's an error
      }
    }
    
    // For non-event questions, add event data as context but with lower prominence
    try {
      const eventDataAsContext = {
        role: "system",
        content: `Berikut adalah informasi event TasikBersih terbaru yang dapat Anda gunakan jika pengguna bertanya tentang event: ${JSON.stringify(formattedEventsForAI)}`
      };
      
      // Build messages with event context
      const messagesWithContext = [
        defaultSystemPrompt,
        eventDataAsContext,
        ...processedMessages
      ];
      
      // Periksa apakah ada gambar dalam pesan
      const hasImage = messagesWithContext.some(msg => 
        Array.isArray(msg.content) && 
        msg.content.some(item => item.type === 'image_url')
      );
      
      // Gunakan fungsi fallback untuk mencoba beberapa model
      const response = await createChatCompletionWithFallback(
        messagesWithContext, 
        hasImage
      );
      
      // Stream response
      const encoder = new TextEncoder();
      const modelInfo = response.modelUsed || freeModels.primary;
      
      // Buat header dan tambahkan informasi model
      const headers = new Headers();
      headers.set('Content-Type', 'text/event-stream');
      headers.set('Cache-Control', 'no-cache');
      headers.set('Connection', 'keep-alive');
      headers.set('X-Model-Used', modelInfo);
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let closed = false; // Flag to track if controller has been closed
            
            // Proses streaming dari OpenRouter (sama seperti OpenAI API)
            for await (const chunk of response) {
              // If controller is already closed, don't try to enqueue more
              if (closed) break;
              
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                // Kirim chunk ke client
                controller.enqueue(encoder.encode(content));
              }
            }
            
            // Only close if not already closed
            if (!closed) {
              closed = true;
              controller.close();
            }
          } catch (error) {
            console.error('Error during streaming:', error);
            controller.error(error);
          }
        }
      });
      
      // Return response sebagai stream dengan header custom
      return new Response(stream, { headers });
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      
      // Jika error adalah rate limit (429), berikan pesan yang lebih user-friendly
      if (error.code === 429) {
        return NextResponse.json(
          { 
            error: 'Model AI sedang sibuk. Silakan coba lagi dalam beberapa saat.',
            detail: 'Batas penggunaan API tercapai. Sistem mencoba beberapa model alternatif namun semua mencapai batas permintaan.',
            suggestion: 'Coba lagi dalam beberapa menit atau gunakan pertanyaan tanpa gambar.'
          },
          { status: 429 }
        );
      }
      
      // Jika ada kesalahan saat streaming, kirim respons error
      if (error.response) {
        return NextResponse.json(
          { error: `OpenRouter API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}` },
          { status: error.response.status }
        );
      }
      
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}