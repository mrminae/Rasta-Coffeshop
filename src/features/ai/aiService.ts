export async function askBaristaAssistant(
  prompt: string,
  currentMenu?: any[],
  customerPreference?: string
): Promise<{ reply: string; model: string }> {
  const res = await fetch("/api/ai/barista-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, currentMenu, customerPreference }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "خطا در دریافت پاسخ از باریستای هوشمند");
  }
  return res.json();
}

export async function getSearchGroundedCoffeeTrends(
  query: string
): Promise<{ text: string; groundingChunks: any[]; model: string }> {
  const res = await fetch("/api/ai/search-grounded", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "خطا در دریافت اطلاعات جستجوی گوگل");
  }
  return res.json();
}

export async function getMapsGroundedBranches(
  query: string
): Promise<{ text: string; groundingChunks: any[]; model: string }> {
  const res = await fetch("/api/ai/maps-grounded", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "خطا در دریافت اطلاعات نقشه‌های گوگل");
  }
  return res.json();
}

export async function generateProductImage(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<{ imageUrl: string; aspectRatio: string; model: string }> {
  const res = await fetch("/api/ai/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "خطا در ساخت تصویر با هوش مصنوعی");
  }
  return res.json();
}

export async function getMerchantInsights(
  action: string,
  payload: any
): Promise<{ insights: string; model: string }> {
  const res = await fetch("/api/ai/merchant-insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      salesData: payload.salesData || payload,
      recentOrders: payload.recentOrders,
      prompt: payload.prompt || payload.userCustomQuestion,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "خطا در تحلیل هوش مصنوعی برای مدیریت");
  }
  return res.json();
}
