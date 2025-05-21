'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend, IoCopyOutline, IoCheckmarkDone, IoImage, IoClose } from 'react-icons/io5';
import { FiUser } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { HiLightningBolt, HiStop } from 'react-icons/hi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { clsx } from 'clsx';
import { tasikBersihSystemPrompt } from '../utils/systemPrompts';

export default function ChatMessage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [streamedResponse, setStreamedResponse] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isGenerationStopped, setIsGenerationStopped] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentModel, setCurrentModel] = useState('Llama 4 Maverick');

  // Remove selectedApi state and just keep Gemini models
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash-preview-04-17'); // Default Gemini model

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const streamReaderRef = useRef(null);

  // Available Gemini models
  const geminiModels = [
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash Preview 04-17' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro' },
    { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro 002' },
  ];

  // Auto-scroll as new content is generated
  useEffect(() => {
    if (autoScroll && chatContainerRef.current && (streamedResponse || isLoading || messages.length > 0)) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamedResponse, isLoading, autoScroll]);

  // Check if user has scrolled away from bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // If scrolled up more than a threshold, disable auto-scroll
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 120;

      // Only change autoScroll if needed to avoid unnecessary re-renders
      if (isScrolledUp && autoScroll) {
        setAutoScroll(false);
      } else if (!isScrolledUp && !autoScroll && isLoading) {
        // Re-enable auto-scroll when user scrolls back to bottom during loading
        setAutoScroll(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [autoScroll, isLoading]);

  // Focus input on initial load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cleanup resources on component unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  // Clean up all resources related to streaming
  const cleanupResources = () => {
    // Cancel any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Release stream reader resources if it exists
    if (streamReaderRef.current && typeof streamReaderRef.current.cancel === 'function') {
      streamReaderRef.current.cancel();
      streamReaderRef.current = null;
    }
  };

  const handleSubmit = async (e, suggestionText = null) => {
    e?.preventDefault();

    // Use suggestion text if provided, otherwise use input
    const message = suggestionText || input;

    if ((!message.trim() && !selectedImage) || isLoading) return;

    // Reset error state and enable auto-scroll
    setError('');
    setAutoScroll(true);
    setIsGenerationStopped(false);

    // Prepare user message content
    let userMessageContent = message;

    // If there's an image, prepare content as a structured object
    if (selectedImage) {
      setIsUploadingImage(true);
      try {
        // Convert image to base64
        const base64Image = await imageToBase64(selectedImage);

        // Format content as expected by the API - for messages with both text and image
        if (message.trim()) {
          userMessageContent = [
            { type: 'text', text: message },
            { type: 'image_url', image_url: { url: base64Image } }
          ];
        } else {
          // Only image, no text
          userMessageContent = [
            { type: 'image_url', image_url: { url: base64Image } }
          ];
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Gagal memproses gambar. Silakan coba lagi.');
        setIsUploadingImage(false);
        return;
      }
    }

    // Add user message to state
    const userMessage = {
      role: 'user',
      content: userMessageContent,
      timestamp: new Date().getTime(),
      hasImage: !!selectedImage, // Flag to indicate if message contains image
      imagePreview: previewUrl // Store preview for display in UI
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamedResponse(""); // Reset streamed response
    setSelectedImage(null);
    setPreviewUrl('');
    setIsUploadingImage(false);

    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    // Focus back to input after sending message
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.height = 'auto';
    }

    // Clean up any existing resources
    cleanupResources();

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // Prepare message history with system prompt
      const allMessages = [
        { role: 'system', content: tasikBersihSystemPrompt },
        ...messages,
        userMessage
      ];

      // Set the API endpoint to Gemini only
      const apiUrl = '/api/chat-gemini';

      // Prepare request body for Gemini
      const requestBody = {
        messages: allMessages,
        hasMultimodalContent: !!selectedImage,
        model: geminiModel
      };

      // Call API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal, // Add abort signal to fetch
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.detail) {
          // Jika ada error terstruktur dari API
          throw new Error(`${errorData.error} ${errorData.suggestion || ''}`);
        } else {
          throw new Error(errorData.error || 'Failed to get response');
        }
      }

      // Set model name based on Gemini model selected
      setCurrentModel(geminiModel);

      // Handle streaming response
      const reader = response.body.getReader();
      streamReaderRef.current = reader; // Store reader reference for cleanup
      const decoder = new TextDecoder();

      let done = false;
      let accumulatedResponse = "";
      let buffer = "";

      while (!done) {
        try {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          // Check if the request was aborted before continuing
          if (signal.aborted) {
            break;
          }

          if (done) break;

          // Decode the chunk and append to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines from buffer (SSE format)
          while (true) {
            const lineEnd = buffer.indexOf('\n');
            if (lineEnd === -1) break;

            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);

            // Skip comment lines (OpenRouter processing messages)
            if (line.startsWith(':')) continue;

            // Process data lines
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              // Handle end of stream
              if (data === '[DONE]') {
                done = true;
                break;
              }

              try {
                // Check if data is an error message
                if (data.includes('"error"')) {
                  const errorJson = JSON.parse(data);
                  if (errorJson.error) {
                    throw new Error(errorJson.error);
                  }
                }

                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  accumulatedResponse += content;
                  setStreamedResponse(accumulatedResponse);
                }
              } catch (parseError) {
                // If it's an error message, throw it
                if (parseError.message !== "Unexpected token" &&
                  parseError.message !== "Unexpected end of JSON input") {
                  throw parseError;
                }
                // Otherwise, ignore invalid JSON - could be non-JSON comments from OpenRouter
                console.log("Non-JSON data in stream, ignoring");
              }
            }
          }
        } catch (readError) {
          // If the error is due to abortion, just break the loop without throwing
          if (readError.name === 'AbortError' || signal.aborted) {
            done = true;
            break;
          }
          // For other errors, throw them to be caught by outer try/catch
          throw readError;
        }
      }

      // Process any remaining buffer data
      if (buffer.trim() && !signal.aborted) {
        console.log("Processing remaining buffer:", buffer);
      }

      // If not aborted, add the complete message to chat history
      if (!signal.aborted) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: accumulatedResponse,
            timestamp: new Date().getTime()
          }
        ]);
        setStreamedResponse("");
      }

    } catch (error) {
      // Only log and show errors that aren't related to abortion
      if (error.name !== 'AbortError' && !signal.aborted) {
        console.error('Error:', error);

        // Handle rate limit errors
        if (error.message && error.message.includes('429')) {
          setError(`Model AI sedang sibuk. Silakan coba lagi dalam beberapa saat atau gunakan pertanyaan tanpa gambar.`);
        } else if (error.message && error.message.includes('Provider returned')) {
          setError(`Layanan AI tidak tersedia saat ini. Silakan coba lagi dalam beberapa saat.`);
        } else {
          // For other errors
          setError(`Error: ${error.message}`);
        }
      }
    } finally {
      // If this was a stopped generation and we have streamed content,
      // add it as a partial response
      if (isGenerationStopped && streamedResponse) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: streamedResponse + "\n\n*Generasi teks dihentikan oleh pengguna.*",
            timestamp: new Date().getTime(),
            isPartial: true
          }
        ]);
        setStreamedResponse("");
      }

      // Reset state regardless of how we ended up here
      setIsLoading(false);
      setIsGenerationStopped(false);
      setIsUploadingImage(false);
      abortControllerRef.current = null;
      streamReaderRef.current = null;
    }
  };

  // Handle stopping text generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      setIsGenerationStopped(true);
      abortControllerRef.current.abort();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape' && isLoading) {
      handleStopGeneration();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setInput(e.target.value);

    // Reset height to auto to get the correct scrollHeight for new content
    e.target.style.height = '38px';

    // Set the height based on content, with a maximum height
    if (e.target.value.includes('\n') || e.target.scrollHeight > 38) {
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    }
  };

  // Prevent click propagation
  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Copy code to clipboard
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Custom components for ReactMarkdown
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (!inline && language) {
        return (
          <div className="relative group code-block">
            <div className="absolute top-2 right-2 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded py-1 px-2 text-xs font-mono text-gray-600 dark:text-gray-300">
              {language}
            </div>
            <button
              onClick={() => copyToClipboard(String(children).replace(/\n$/, ''), node.position?.start.line)}
              className="absolute top-2 right-16 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded py-1 px-2 text-xs flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Copy code"
            >
              {copiedIndex === node.position?.start.line ? (
                <>
                  <IoCheckmarkDone className="text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <IoCopyOutline className="text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-600 dark:text-gray-300">Copy</span>
                </>
              )}
            </button>
            <SyntaxHighlighter
              language={language}
              style={coldarkDark}
              className="rounded-lg text-sm my-2 !bg-gray-800"
              showLineNumbers={language !== 'markdown' && language !== 'text'}
              wrapLongLines={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                borderRadius: '0.5rem',
              }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        return (
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-teal-600 dark:bg-gray-800 dark:text-teal-400 font-mono" {...props}>
            {children}
          </code>
        );
      }
    },
    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2 space-y-1 text-left" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2 space-y-1 text-left" {...props} />,
    li: ({ node, ...props }) => <li className="my-1 text-left" {...props} />,
    h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-4 border-b pb-2 dark:border-gray-700 text-left" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-3 text-left" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-base font-bold my-2 text-left" {...props} />,
    p: ({ node, ...props }) => <p className="my-3 leading-relaxed text-left" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-teal-300 pl-4 italic my-3 text-gray-600 dark:text-gray-400 text-left" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
    tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50" {...props} />,
    th: ({ node, ...props }) => <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300" {...props} />,
    td: ({ node, ...props }) => <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200" {...props} />,
  };

  // Handle image selection and preview
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.match('image.*')) {
      setError('Hanya file gambar yang diperbolehkan (.jpg, .jpeg, .png, .webp)');
      return;
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 4MB');
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Trigger image input click
  const handleImageButtonClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  // Convert image to base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      console.log('Converting image to base64, file type:', file.type);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // reader.result already includes the data:image/jpeg;base64 prefix
        const result = reader.result;
        console.log('Base64 conversion complete, image starts with:', result.substring(0, 50) + '...');
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error('Error converting image to base64:', error);
        reject(error);
      };
    });
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-130px)] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900"
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between bg-white dark:bg-gray-800 backdrop-blur supports-backdrop-blur:bg-white/80 dark:supports-backdrop-blur:bg-gray-800/80 sticky top-0 z-10">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 grid place-items-center shadow-md">
            <RiRobot2Line className="text-white text-lg" />
          </div>
          <div className="ml-3 flex flex-col">
            <h1 className="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100">TasikBersih</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? 'Sedang memproses...' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Gemini Model Selector */}
          <div className="hidden sm:flex items-center space-x-2">
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1"
              disabled={isLoading}
            >
              {geminiModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>

          <motion.div
            animate={{ scale: isLoading ? 1 : 0.8, opacity: isLoading ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
            className={`h-2 w-2 rounded-full ${isLoading ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}
          />
          <div className="inline-flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Powered by</span>
            <span className="text-xs font-medium bg-gradient-to-r from-blue-500 to-teal-500 text-white px-2 py-0.5 rounded-full">Gemini</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mx-4 mt-2 rounded-md border border-red-100 dark:border-red-800/50 flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="bg-red-100 dark:bg-red-800/50 p-1 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Gemini Model Selection - replacing API selection */}
      <div className="sm:hidden border-b border-gray-200 dark:border-gray-800 p-2 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 dark:text-gray-400">Gemini Model:</div>
          <div className="flex space-x-2">
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1"
              disabled={isLoading}
            >
              {geminiModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 overscroll-contain"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col h-full items-start justify-center py-16 px-4">
              <div className="max-w-2xl mx-auto w-full">
                <div className="flex flex-col items-center mb-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 mb-6 grid place-items-center shadow-lg"
                  >
                    <RiRobot2Line className="text-white text-4xl" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Selamat Datang di TasikBersih</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
                  Asisten AI TasikBersih siap membantu Anda dengan informasi tentang website, pendaftaran relawan, pelaporan lokasi tercemar, donasi, dan kegiatan kebersihan. Tanyakan saja!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-6">
                  {[
                    "Bagaimana cara menjadi relawan TasikBersih?",
                    "Jelaskan cara melaporkan lokasi tercemar di Tasikmalaya",
                    "Apa saja fitur utama website TasikBersih?",
                    "Bagaimana sistem donasi TasikBersih bekerja?"
                  ].map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-gray-700 dark:text-gray-300 group flex items-center"
                      onClick={(e) => handleSubmit(e, suggestion)} // Submit directly with the suggestion
                    >
                      <HiLightningBolt className="text-teal-500 mr-2 opacity-70 group-hover:opacity-100" />
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  TasikBersih AI siap membantu Anda dengan informasi tentang website dan kegiatan kebersihan.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="pt-4 pb-6 px-4 space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  "flex gap-3 max-w-full group",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role !== 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex-shrink-0 grid place-items-center text-white mt-1 shadow-sm">
                    <RiRobot2Line size={16} />
                  </div>
                )}

                <div
                  className={clsx(
                    "flex flex-col max-w-[85%] sm:max-w-[75%]",
                    message.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center mb-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{message.role === 'user' ? 'Anda' : 'TasikBersih'}</span>
                    <span className="mx-1">•</span>
                    <span>{formatTime(message.timestamp)}</span>
                  </div>

                  <div
                    className={clsx(
                      "rounded-2xl shadow-sm",
                      message.role === 'user'
                        ? "bg-teal-500 text-white py-2.5 px-3.5"
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4",
                      message.isPartial && "border-l-4 border-amber-500 dark:border-amber-500"
                    )}
                  >
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap break-words">
                        {/* Check if user message has an image */}
                        {message.hasImage && (
                          <div className="mb-2 max-w-xs overflow-hidden rounded-lg">
                            <img
                              src={message.imagePreview}
                              alt="Uploaded image"
                              className="w-full max-h-60 object-contain rounded-lg"
                            />
                          </div>
                        )}

                        {/* Display text content */}
                        {typeof message.content === 'string' ? (
                          <p>{message.content}</p>
                        ) : Array.isArray(message.content) ? (
                          // If content is array (for image + text), display only text parts
                          message.content
                            .filter(item => item.type === 'text')
                            .map((item, i) => <p key={i}>{item.text}</p>)
                        ) : (
                          <p>{message.content?.text || ''}</p>
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none markdown-content break-words text-left">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={MarkdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex-shrink-0 grid place-items-center text-teal-600 dark:text-teal-400 mt-1">
                    <FiUser size={16} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Streaming Response */}
            {streamedResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-full"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex-shrink-0 grid place-items-center text-white mt-1 shadow-sm">
                  <RiRobot2Line size={16} />
                </div>

                <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
                  <div className="flex items-center mb-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>TasikBersih</span>
                    <span className="mx-1">•</span>
                    <span>{formatTime(new Date().getTime())}</span>
                  </div>
                  <div className="py-3 px-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                    <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none markdown-content text-left">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={MarkdownComponents}
                      >
                        {streamedResponse}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div ref={messagesEndRef} />
              </motion.div>
            )}

            {/* Typing Indicator - only show if no streamed response is visible */}
            {isLoading && !streamedResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex-shrink-0 grid place-items-center text-white shadow-sm">
                  <RiRobot2Line size={16} />
                </div>
                <div className="flex items-center space-x-1.5 py-2.5 px-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full"
                      animate={{
                        y: [0, -6, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: dot * 0.15,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-2">
                <div className="relative inline-block">
                  <div className="max-w-[150px] max-h-[100px] rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <IoClose size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyPress}
                  rows="1"
                  disabled={isLoading || isUploadingImage}
                  className={clsx(
                    "w-full py-2 px-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/70 transition-all resize-none text-gray-800 dark:text-gray-200 pr-12",
                    (isLoading || isUploadingImage) && "opacity-50 cursor-not-allowed"
                  )}
                  placeholder={isLoading ? "Tunggu respons selesai..." : isUploadingImage ? "Memproses gambar..." : "Ketik pesan atau upload gambar untuk analisis lingkungan..."}
                  style={{
                    height: '38px',
                    maxHeight: '200px',
                    overflowY: input.includes('\n') ? 'auto' : 'hidden'
                  }}
                />

                {/* Image upload button - positioned absolute within the input container */}
                <button
                  type="button"
                  onClick={handleImageButtonClick}
                  disabled={isLoading || isUploadingImage}
                  className={clsx(
                    "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors group",
                    (isLoading || isUploadingImage) && "opacity-50 cursor-not-allowed"
                  )}
                  title="Upload gambar untuk analisis lingkungan"
                >
                  <IoImage size={18} />
                  <span className="absolute bottom-full mb-2 w-40 -left-16 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Upload gambar lingkungan untuk dianalisis
                  </span>
                </button>

                {/* Hidden file input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageSelect}
                  disabled={isLoading || isUploadingImage}
                />
              </div>

              {isLoading ? (
                // Stop Button
                <motion.button
                  type="button"
                  onClick={handleStopGeneration}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-colors shadow-sm gap-1 flex-shrink-0"
                >
                  <HiStop size={16} />
                  <span className="hidden sm:inline">Stop</span>
                </motion.button>
              ) : (
                // Send Button
                <motion.button
                  type="submit"
                  disabled={(!input.trim() && !selectedImage) || isUploadingImage}
                  whileTap={{ scale: 0.95 }}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 dark:disabled:bg-teal-800/60 disabled:cursor-not-allowed text-white py-2 px-3 h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
                >
                  <IoSend size={18} />
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}