export type WhatsLocale = "ar" | "en"

export function buildWhatsApp(service: string, price: string, locale: WhatsLocale = "ar", brand = "kyctrust") {
  const phone = "201062453344"
  const timestamp = Date.now()
  const requestId = `LP-${timestamp}`
  const messages: Record<WhatsLocale, string> = {
    ar: `🔥 طلب خدمة من ${brand}

📋 تفاصيل الطلب:
• الخدمة: ${service}
• السعر: ${price}
• اللغة: ${locale}
• معرف الطلب: ${requestId}

⏰ سنرد عليك خلال 15 دقيقة
🛡️ خدمة آمنة ومضمونة 100%`,
    en: `🔥 Service Request from ${brand}

📋 Order Details:
• Service: ${service}
• Price: ${price}
• Language: ${locale}
• Request ID: ${requestId}

⏰ We'll reply within 15 minutes
🛡️ 100% Safe and Guaranteed Service`,
  }
  const text = encodeURIComponent(messages[locale] || messages.ar)
  return `https://wa.me/${phone}?text=${text}`
}
