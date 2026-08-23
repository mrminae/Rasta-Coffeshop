import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "CoffeePlus Commerce Platform", timestamp: new Date().toISOString() });
  });

  // 1. Low-latency Customer Barista AI (gemini-3.1-flash-lite)
  app.post("/api/ai/barista-assistant", async (req, res) => {
    try {
      const { prompt, currentMenu, customerPreference } = req.body;
      const ai = getAI();

      const systemInstruction = `شما باریستای هوشمند و صمیمی پلتفرم کافه پلاس (CoffeePlus) هستید.
وظیفه شما راهنمایی مشتری به زبان فارسی زیبا، روان و مؤدبانه برای انتخاب بهترین نوشیدنی یا خوراکی، در نظر گرفتن ترجیحات طعمی (کم‌شکر، شیر گیاهی، میزان تلخی، انرژی‌بخش بودن یا دکاف) است.
پاسخ‌های شما باید کوتاه، جذاب، اشتهاآور و مفید باشد.
اگر محصولی در لیست منو وجود دارد، نام دقیق آن را پیشنهاد دهید.
منوی فعلی کافه:
${JSON.stringify(currentMenu || [])}`;

      const userContent = customerPreference 
        ? `ترجیحات مشتری: ${customerPreference}\nدرخواست مشتری: ${prompt}`
        : prompt;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: userContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || "خوشحال می‌شم در انتخاب بهترین قهوه کمکتون کنم!",
        model: "gemini-3.1-flash-lite",
      });
    } catch (error: any) {
      console.error("AI Barista Assistant error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // 2. Search Grounded Coffee Insights (gemini-3.5-flash with googleSearch)
  app.post("/api/ai/search-grounded", async (req, res) => {
    try {
      const { query } = req.body;
      const ai = getAI();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: query || "آخرین ترندهای قهوه تخصصی و ریشه‌های دانه‌های قهوه در سال جاری چیست؟",
        config: {
          systemInstruction: "شما متخصص جهانی قهوه و رست تخصصی هستید. اطلاعات به‌روز، دقیق و معتبر را به زبان فارسی ارائه دهید.",
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text: response.text,
        groundingChunks,
        model: "gemini-3.5-flash",
      });
    } catch (error: any) {
      console.error("AI Search Grounding error:", error);
      res.status(500).json({ error: error.message || "Failed to execute search grounding" });
    }
  });

  // 3. Maps Grounded Branch & Location Finder (gemini-3.5-flash with googleMaps)
  app.post("/api/ai/maps-grounded", async (req, res) => {
    try {
      const { query } = req.body;
      const ai = getAI();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: query || "شعب کافه و مسیرهای دسترسی در تهران و شهرهای اصلی",
        config: {
          systemInstruction: "شما راهنمای شعب و موقعیت‌های مکانی کافه پلاس هستید. به زبان فارسی پاسخ دهید.",
          tools: [{ googleMaps: {} }],
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text: response.text,
        groundingChunks,
        model: "gemini-3.5-flash",
      });
    } catch (error: any) {
      console.error("AI Maps Grounding error:", error);
      res.status(500).json({ error: error.message || "Failed to execute maps grounding" });
    }
  });

  // 4. Product Image Generator with Aspect Ratio Control (gemini-3.1-flash-image)
  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1" } = req.body;
      const ai = getAI();

      const allowedAspectRatios = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "1:8", "4:1", "8:1"];
      const selectedRatio = allowedAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

      const enhancedPrompt = `Professional commercial coffee shop product photography, high-end editorial cafe aesthetics, 8k resolution, elegant lighting, studio backdrop: ${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedRatio,
            imageSize: "1K",
          },
        },
      });

      let imageDataUrl: string | null = null;
      let textOutput = "";

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          imageDataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textOutput += part.text;
        }
      }

      if (!imageDataUrl) {
        return res.status(400).json({ error: "Image could not be generated", textOutput });
      }

      res.json({
        imageUrl: imageDataUrl,
        aspectRatio: selectedRatio,
        model: "gemini-3.1-flash-image",
      });
    } catch (error: any) {
      console.error("AI Image Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // 5. Merchant Business Analytics & Promotional Copy (gemini-3.7-flash)
  app.post("/api/ai/merchant-insights", async (req, res) => {
    try {
      const { action, salesData, recentOrders, prompt } = req.body;
      const ai = getAI();

      const systemInstruction = `شما مشاور ارشد کسب‌وکار و بازاریابی برای صاحبان کافه‌ها در پلتفرم کافه پلاس هستید.
پاسخ‌های شما باید مبتنی بر داده‌های واقعی ارائه‌شده باشد، تحلیلی، واقع‌بینانه، حرفه‌ای و به زبان فارسی همراه با پیشنهادات عملیاتی (Actionable Insights) جهت افزایش سود و رضایت مشتریان باشد.`;

      let userPrompt = "";
      if (action === "sales_analysis") {
        userPrompt = `لطفاً داده‌های فروش زیر را تحلیل کنید، الگوها، ساعات اوج، و راهکارهای ارتقای میانگین ارزش هر سفارش (AOV) را بیان کنید:
${JSON.stringify(salesData || {})}`;
      } else if (action === "promo_campaign") {
        userPrompt = `یک کمپین تخفیف و پیام تبلیغاتی پیامکی/نوتیفیکیشن جذاب برای مشتریان کافه طراحی کنید بر اساس هدف: ${prompt}`;
      } else if (action === "menu_optimization") {
        userPrompt = `با توجه به سفارشات اخیر، پیشنهاداتی برای ترکیب محصولات (Bundle) و نوشیدنی‌های جدید متناسب با فصل ارائه دهید:
${JSON.stringify(recentOrders || [])}`;
      } else {
        userPrompt = prompt || "یک گزارش خلاصه وضعیت کافه ارائه دهید.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({
        insights: response.text,
        model: "gemini-3.7-flash",
      });
    } catch (error: any) {
      console.error("AI Merchant Insights error:", error);
      res.status(500).json({ error: error.message || "Failed to generate merchant insights" });
    }
  });

  // 6. Authoritative Pricing & Coupon Validation
  app.post("/api/orders/validate-pricing", (req, res) => {
    try {
      const { items, coupon, fulfillmentType, branchDeliveryFee = 25000 } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      let subtotal = 0;
      const validatedItems = items.map((item: any) => {
        let modifierDeltaTotal = 0;
        if (Array.isArray(item.selectedModifiers)) {
          modifierDeltaTotal = item.selectedModifiers.reduce((acc: number, mod: any) => acc + (Number(mod.priceDelta) || 0), 0);
        }
        const unitPrice = (Number(item.basePrice) || 0) + modifierDeltaTotal;
        const qty = Math.max(1, Number(item.quantity) || 1);
        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;

        return {
          ...item,
          unitPrice,
          quantity: qty,
          itemTotal,
        };
      });

      let discount = 0;
      if (coupon && coupon.active) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === "percentage") {
            discount = Math.round((subtotal * (coupon.discountValue || 0)) / 100);
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
              discount = coupon.maxDiscountAmount;
            }
          } else if (coupon.discountType === "fixed") {
            discount = Math.min(subtotal, Number(coupon.discountValue) || 0);
          }
        }
      }

      const deliveryFee = fulfillmentType === "delivery" ? branchDeliveryFee : 0;
      const tax = Math.round((subtotal - discount) * 0.09); // 9% standard value added tax
      const total = Math.max(0, subtotal - discount + deliveryFee + tax);

      res.json({
        items: validatedItems,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total,
      });
    } catch (error: any) {
      console.error("Pricing validation error:", error);
      res.status(500).json({ error: error.message || "Failed to calculate pricing" });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CoffeePlus Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server error:", err);
});
