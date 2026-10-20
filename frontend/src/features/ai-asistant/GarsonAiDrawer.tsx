import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, Send, Command, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface GarsonAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type MessageType = 'text' | 'task_list' | 'action_success';

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: MessageType;
  content: string | any;
}

const QUICK_PROMPTS = [
  "Geciken görevleri göster",
  "⚡ Kritik yoldaki darboğazlar neler?",
  "👷 Bugün hangi ekipte aşırı yük var?",
  "Aktif projelerin özetini çıkar",
  "Bir görevin durumunu nasıl güncelleyebilirim?"
];

export default function GarsonAiDrawer({ isOpen, onClose }: GarsonAiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', type: 'text', content: 'Sistem çevrimiçi. Operasyonel istihbarat veya görev aksiyonları için hazırım. Ne öğrenmek istersiniz?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    if (isTyping) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data: result } = await api.post('/garson/chat', { message: text });
      const assistantData = result?.data ?? result;

      if (assistantData && typeof assistantData === 'object' && 'type' in assistantData && 'content' in assistantData) {
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          type: assistantData.type as MessageType,
          content: assistantData.content,
        }]);
      }
      else {
        const content = typeof assistantData === 'string'
          ? assistantData
          : JSON.stringify(assistantData, null, 2);

        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          type: 'text',
          content,
        }]);
      }
    } catch (error: any) {
      const message = error.response?.data?.message ?? 'Garson AI isteği başarısız oldu.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'text',
        content: Array.isArray(message) ? message.join(', ') : message,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

 const renderMessageContent = (msg: Message) => {
    if (msg.type === 'text') {
      try {
        let parsed = JSON.parse(msg.content);

        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed = parsed[0];
        }

        if (parsed && typeof parsed === 'object') {
          if (parsed.status === 'error') {
            return (
              <div className="flex items-center gap-3 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider">İşlem Başarısız ({parsed.intent})</span>
                  <span className="font-sans text-sm">{parsed.message}</span>
                </div>
              </div>
            );
          }

          if (parsed.status === 'success') {
            return (
              <div className="flex flex-col gap-2 rounded-md border border-cyan-500/20 bg-cyan-500/10 p-3 dark:bg-cyan-950/30">
                <span className="font-sans text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400">
                  Sistem Sorgu Sonucu ({parsed.intent})
                </span>
                <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-auto">
                  {parsed.data && parsed.data.length === 0 ? 'Kayıt bulunamadı.' : JSON.stringify(parsed.data, null, 2)}
                </pre>
              </div>
            );
          }

          return <pre className="font-mono text-xs whitespace-pre-wrap overflow-auto">{JSON.stringify(parsed, null, 2)}</pre>;
        }
      } catch (e) {
        console.debug("Mesaj JSON formatında değil, düz metin olarak basılacak.");
      }

      return <p className="font-sans text-sm leading-relaxed">{msg.content}</p>;
    }


    if (msg.type === 'action_success') {
      return (
        <div className="flex w-full flex-col gap-2 rounded-lg border p-3 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-sans text-sm font-bold uppercase tracking-wider">Aksiyon Onaylandı</span>
          </div>
          <p className="font-sans text-xs text-emerald-700 dark:text-emerald-100/80">{msg.content.message}</p>
          <div className="mt-1 flex items-center justify-between rounded px-2 py-1 border border-emerald-200 bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/50">
             <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-500/70">#{msg.content.taskId}</span>
             <span className="font-sans text-xs font-bold text-emerald-700 dark:text-emerald-400">{msg.content.taskName}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Arkadaki Odak Karartması */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] dark:bg-slate-950/40"
          />

          {/* Çekmece Gövdesi */}
          <motion.div
            initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-20px 0 50px rgba(6, 182, 212, 0.1)' }}
            exit={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-l shadow-2xl bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
          >

            {/* Üst Başlık (Header) */}
            <div className="flex items-center justify-between border-b p-4 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded border bg-cyan-50 border-cyan-200 text-cyan-600 dark:bg-cyan-950/50 dark:border-cyan-500/30 dark:text-cyan-400">
                   <Bot className="h-5 w-5" />
                   <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 bg-emerald-500 border-white dark:border-slate-950"></span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-sans text-base font-bold text-slate-900 dark:text-slate-100">Garson AI</h2>
                  <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-500">v1.2 (QWEN-3B-LOCAL)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-1 rounded px-2 py-1 font-mono text-[10px] sm:flex bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Command className="h-3 w-3" /> K
                </div>
                <button onClick={onClose} className="rounded p-1.5 transition-colors text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sohbet Alanı (Mesaj Geçmişi) */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-cyan-600 text-white shadow-md'
                        : 'rounded-tl-sm border bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </div>
              ))}

              {/* Yazıyor İndikatörü */}
              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border p-4 bg-slate-50 border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                     <div className="flex items-center gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: '300ms' }}></span>
                     </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hazır Hap Butonlar (Zero-Keyboard) */}
            <div className="border-t p-3 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="rounded-lg border px-3 py-1.5 text-left font-sans text-xs shadow-sm transition-colors bg-white border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500/50 dark:hover:bg-slate-700 dark:hover:text-cyan-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Alt Girdi (Input) Alanı */}
            <div className="p-3 bg-slate-100 dark:bg-slate-950">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Yapay Zekaya emir ver..."
                  className="w-full rounded-full border py-3 pl-4 pr-12 font-sans text-sm focus:outline-none bg-white border-slate-300 text-slate-900 focus:border-cyan-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-white transition-colors hover:bg-cyan-500 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}