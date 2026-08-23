import React, { useState } from "react";
import { useTenant } from "../../features/tenant/TenantContext";
import { 
  askBaristaAssistant, 
  getSearchGroundedCoffeeTrends, 
  getMapsGroundedBranches 
} from "../../features/ai/aiService";
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Globe, 
  MapPin, 
  Zap, 
  Coffee, 
  ExternalLink,
  Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BaristaAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
}

type AiMode = "barista" | "search_grounding" | "maps_grounding";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  model?: string;
  groundingChunks?: any[];
  mode?: AiMode;
}

export const BaristaAiModal: React.FC<BaristaAiModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { products, activeShop } = useTenant();
  const [mode, setMode] = useState<AiMode>("barista");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: `سلام! من باریستای هوشمند ${activeShop.nameFa} هستم ☕✨\nمی‌توانید ترجیحات طعمی، حساسیت‌ها، میزان انرژی مورد نظر یا نوع قهوه دلخواهتان را بگویید تا بهترین گزینه از منو را به شما پیشنهاد دهم. همچنین می‌توانید درباره خاستگاه دانه‌ها و مسیر شعب کافه بپرسید!`,
      model: "gemini-3.1-flash-lite",
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    "یک نوشیدنی خنک، کم‌کالری و بدون شکر پیشنهاد بده",
    "قوی‌ترین قهوه انرژی‌بخش برای تمرکز و مطالعه",
    "بهترین قهوه یا نوشیدنی برای همراهی با چیزکیک سن‌سباستین",
    "تفاوت دانه‌های قهوه تخصصی کلمبیا و اتیوپی چیست؟",
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt || "").trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      if (mode === "barista") {
        const compactMenu = products.map((p) => ({
          id: p.id,
          name: p.nameFa,
          nameEn: p.name,
          category: p.categoryId,
          price: p.basePrice,
          desc: p.descriptionFa,
          tags: p.tags,
          calories: p.calories,
        }));

        const result = await askBaristaAssistant(textToSend, compactMenu);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: result.reply,
            model: result.model,
            mode: "barista",
          },
        ]);
      } else if (mode === "search_grounding") {
        const result = await getSearchGroundedCoffeeTrends(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: result.text,
            model: result.model,
            groundingChunks: result.groundingChunks,
            mode: "search_grounding",
          },
        ]);
      } else if (mode === "maps_grounding") {
        const result = await getMapsGroundedBranches(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: result.text,
            model: result.model,
            groundingChunks: result.groundingChunks,
            mode: "maps_grounding",
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `متأسفانه در پاسخ‌دهی خطایی رخ داد: ${err.message || "خطای ناشناخته"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-black/60 backdrop-blur-3xl border border-white/15 rounded-[32px] shadow-2xl overflow-hidden my-auto text-right flex flex-col h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 p-0.5 flex items-center justify-center shadow-lg shadow-black/20">
                <div className="w-full h-full bg-white/10 rounded-[14px] flex items-center justify-center text-amber-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                  <span>باریستای هوشمند کافه پلاس</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15 text-[10px] font-semibold">
                    Gemini AI
                  </span>
                </h3>
                <p className="text-xs text-white/50">
                  پاسخ‌های کم‌تأخیر، پیشنهاد متناسب با ذائقه و داده‌های به‌روز
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
            <button
              onClick={() => setMode("barista")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                mode === "barista"
                  ? "bg-white text-black font-bold shadow-md"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>مشاور هوشمند منو (gemini-3.1-flash-lite)</span>
            </button>

            <button
              onClick={() => setMode("search_grounding")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                mode === "search_grounding"
                  ? "bg-white text-black font-bold shadow-md"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>جستجوی وب و ترندهای قهوه (Search Grounding)</span>
            </button>

            <button
              onClick={() => setMode("maps_grounding")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                mode === "maps_grounding"
                  ? "bg-white text-black font-bold shadow-md"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>شعب و موقعیت‌یاب (Maps Grounding)</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    msg.sender === "user"
                      ? "bg-white text-black font-bold"
                      : "bg-white/10 text-amber-300 border border-white/15"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed space-y-2 backdrop-blur-md ${
                    msg.sender === "user"
                      ? "bg-white/15 text-white border border-white/20 text-right"
                      : "bg-white/5 text-white/90 border border-white/10 text-right"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Grounding Source Citations if present */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-[11px] space-y-1">
                      <div className="text-white/60 font-semibold flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span>منابع معتبر جستجوی گوگل:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingChunks.map((chunk, idx) => (
                          <a
                            key={idx}
                            href={chunk.web?.uri || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-blue-300 hover:text-white border border-white/10 text-[10px] transition-colors"
                          >
                            <span>{chunk.web?.title || `منبع ${idx + 1}`}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.model && (
                    <div className="text-[10px] text-white/30 font-mono text-left pt-1" dir="ltr">
                      model: {msg.model}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 text-amber-300 border border-white/15 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-2 backdrop-blur-md">
                  <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>باریستا در حال اندیشیدن و پاسخ به شماست...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2.5 bg-white/5 border-t border-white/10 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] text-white/50 shrink-0">پیشنهادات سریع:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 text-[11px] whitespace-nowrap transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 sm:p-4 bg-black/40 backdrop-blur-2xl border-t border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={
                  mode === "barista"
                    ? "سؤال یا ترجیح طعمی خود را بنویسید (مثلاً: یک نوشیدنی شکلاتی و گرم)..."
                    : mode === "search_grounding"
                    ? "پرسش درباره رست، ترندها و دانه‌های تخصصی قهوه..."
                    : "پرسش درباره نزدیک‌ترین شعبه و ساعات کاری..."
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 backdrop-blur-md transition-colors"
              />
              <button
                type="submit"
                disabled={!(inputPrompt || "").trim() || isLoading}
                className="p-3 rounded-full bg-white hover:bg-white/90 disabled:opacity-40 text-black font-bold transition-all shadow-lg shadow-white/10 cursor-pointer"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
              </button>
            </form>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
