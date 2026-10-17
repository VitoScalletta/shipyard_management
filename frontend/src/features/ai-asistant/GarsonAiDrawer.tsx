import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, Send, Command, Clock,
  CheckCircle2, AlertOctagon
} from 'lucide-react';

interface GarsonAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mesaj Tipleri
type MessageType = 'text' | 'task_list' | 'action_success';

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: MessageType;
  content: string | any;
}

// Hazır Hap Komutlar (Zero-Keyboard Experience)
const QUICK_PROMPTS = [
  "🔴 Bu projede geciken görevleri göster",
  "⚡ Kritik yoldaki darboğazlar neler?",
  "👷 Bugün hangi ekipte aşırı yük var?",
  "📊 M/V Yıldız projesinin özetini çıkar",
  "✅ 123 numaralı görevi tamamlandı yap" // Demo aksiyon için
];

export default function GarsonAiDrawer({ isOpen, onClose }: GarsonAiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', type: 'text', content: 'Sistem çevrimiçi. Operasyonel istihbarat veya görev aksiyonları için hazırım. Ne öğrenmek istersiniz?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Sahte AI Yanıt Motoru (Mock Qwen2.5:3b)
  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Kullanıcı mesajını ekle
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // AI düşünme süresi simulasyonu
    setTimeout(() => {
      let aiResponse: Message;

      // 1. Zengin Etkileşim: Geciken Görev Kartları
      if (text.includes('geciken görevleri')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          type: 'task_list',
          content: [
            { id: '104', name: 'Pervane Şaft İncelemesi', delay: '5 Gün', status: 'DELAYED' },
            { id: '107', name: 'Ana Katman Epoksi', delay: 'Bloke', status: 'BLOCKED' }
          ]
        };
      }
      // 2. Zengin Etkileşim: Aksiyon Onay Kartı
      else if (text.includes('tamamlandı yap')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          type: 'action_success',
          content: { taskId: '123', taskName: 'Kalite Kontrol (Boya)', message: 'Görev başarıyla "Tamamlandı" olarak işaretlendi ve kritik yol güncellendi.' }
        };
      }
      // 3. Standart Metin Yanıtı
      else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          type: 'text',
          content: 'Sistem veritabanını taradım. İlgili kayıtlar analiz edildi. Destek olabileceğim başka bir detay var mı?'
        };
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500); // 1.5 saniye AI gecikmesi
  };

  // Zengin Mesaj Render Motoru
  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'text') {
      return <p className="font-sans text-sm leading-relaxed">{msg.content}</p>;
    }

    if (msg.type === 'task_list') {
      return (
        <div className="flex flex-col gap-2 w-full">
          <p className="font-sans text-sm mb-1 text-slate-300">Taktiksel ağda tespit edilen sorunlu görevler:</p>
          {msg.content.map((task: any) => (
            <div key={task.id} className="flex items-center justify-between rounded border border-rose-500/20 bg-rose-950/20 p-2.5 transition-colors hover:bg-rose-900/30 cursor-pointer">
              <div className="flex items-center gap-2">
                {task.status === 'BLOCKED' ? <AlertOctagon className="h-4 w-4 text-rose-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-bold text-slate-200">{task.name}</span>
                  <span className="font-mono text-[9px] text-slate-500">Görev #{task.id}</span>
                </div>
              </div>
              <span className={`font-mono text-[10px] font-bold ${task.status === 'BLOCKED' ? 'text-rose-400' : 'text-amber-400'}`}>
                {task.delay}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (msg.type === 'action_success') {
      return (
        <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 w-full">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-sans text-sm font-bold uppercase tracking-wider">Aksiyon Onaylandı</span>
          </div>
          <p className="font-sans text-xs text-emerald-100/80">{msg.content.message}</p>
          <div className="mt-1 flex items-center justify-between rounded bg-emerald-950/50 px-2 py-1 border border-emerald-900/50">
             <span className="font-mono text-[10px] text-emerald-500/70">#{msg.content.taskId}</span>
             <span className="font-sans text-xs font-bold text-emerald-400">{msg.content.taskName}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Arkadaki Odak Karartması (Zorunlu değil ama şık durur) */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]"
          />

          {/* Çekmece Gövdesi */}
          <motion.div
            initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-20px 0 50px rgba(6, 182, 212, 0.1)' }}
            exit={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-700 bg-slate-900 shadow-2xl"
          >

            {/* 7.1 Üst Başlık (Header) */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 relative">
                   <Bot className="h-5 w-5" />
                   <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500"></span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-sans text-base font-bold text-slate-100">Garson AI</h2>
                  <span className="font-mono text-[10px] text-cyan-500">v1.2 (QWEN-3B-LOCAL)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 rounded bg-slate-800 px-2 py-1 font-mono text-[10px] text-slate-400">
                  <Command className="h-3 w-3" /> K
                </div>
                <button onClick={onClose} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sohbet Alanı (Mesaj Geçmişi) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-cyan-600 text-white shadow-md'
                        : 'rounded-tl-sm border border-slate-700 bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </div>
              ))}

              {/* Yazıyor İndikatörü */}
              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-700 bg-slate-800/80 p-4">
                     <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                     </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 7.2 Hazır Hap Butonlar (Zero-Keyboard) */}
           <div className="border-t border-slate-800 bg-slate-900/50 p-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-left font-sans text-xs text-slate-300 transition-colors hover:border-cyan-500/50 hover:bg-slate-700 hover:text-cyan-300 shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Alt Girdi (Input) Alanı */}
            <div className="bg-slate-950 p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Yapay Zekaya emir ver..."
                  className="w-full rounded-full border border-slate-700 bg-slate-900 py-3 pl-4 pr-12 font-sans text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-white transition-colors hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500"
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