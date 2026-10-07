const translations = {
  en: {
    page_title: "Ugur Cihan Cekic — Founder &amp; Full-Stack Developer",
    hero_name: "Ugur Cihan Cekic",
    footer_name: "Ugur Cihan Cekic",
    nav_about: "About",
    nav_projects: "Projects",
    nav_stack: "Stack",
    nav_contact: "Contact",
    nav_press: "Press",

    hero_greeting: "hi, I'm 👋",
    hero_role: "Founder &amp; Full-Stack Developer",
    hero_subtitle: "I turn ideas into working products — coffee, code, and a bit of stubbornness. ✨",
    btn_projects: "See My Projects",
    btn_contact: "Say Hello 👋",
    hero_scroll_hint: "Scroll to explore ↓",

    about_title: "About Me",
    about_text: "I build products end to end — idea, design, engineering, launch. My journey with software began in 2017 with a Swift course, and I went all in after I couldn't find a developer for my first idea. I've been shipping my own products to real users ever since: KuExpo, an AI-powered event-management platform, is live on the App Store and Google Play, and LifeCheck Mobility, a personal-safety app, is live on the App Store. These days I'm also writing a book: Makineyle Aynı Masada, a calm, plain-language guide to living with AI (in Turkish, coming soon).",
    mini1: "Product-minded 🎯",
    mini2: "End-to-end execution 🚀",
    mini3: "Cross-platform: Web, iOS, Android 📱",

    nav_book: "Book",
    book_title: "My Book",
    book_status: "Coming soon",
    book_sub: "A guide to staying human in the age of AI",
    book_hook: "A new guest sat at our table. Nobody said \"welcome\", and nobody said \"get up\".",
    book_text: "A calm, curious guide to living with AI: how machines learned to talk, what it means for your job, your kids and your decisions, how to spot fake voices, and how to write your own tiny language model in twenty minutes. Neither doom nor hype. Written in Turkish.",
    book_p1: "Understand AI without fear or worship",
    book_p2: "11 diagrams, tables, and a small experiment in every chapter",
    book_p3: "A one-page \"doubt checklist\" to hand to your parents",
    book_cta: "Notify me when it's out ✉️",
    book_email_label: "Your email address",
    book_ok: "You're on the list. I'll email you when the book is out. 📚",
    book_invalid: "Please enter a valid email address.",
    book_err: "Something went wrong. Please try again, or email me directly.",
    press_title: "In the Press",
    press_source: "UAE Times Now",
    press_date: "September 9, 2026",
    press_excerpt: "How a missing developer turned into a founder's decision to learn to build it himself, and how that led to KuExpo, a platform reshaping how exhibitions connect people, companies and experiences.",
    press_cta: "Read the article",
    press_newtab: " (opens in a new tab)",
    grp_products: "Products",
    grp_engineering: "Engineering &amp; Open Source",
    grp_web: "Web &amp; Design",
    grp_ventures: "Ventures &amp; Concepts",
    oss_tagline: "Contributions to open-source EV-charging projects",
    oss_desc1: "Added 91 classes missing from the OCPP 2.1 spec to a widely used Python OCPP library, with regression tests.",
    oss_desc2: "Hardened the Docker Compose setup of a production OCPP server: closed the database port to the host, added an isolated network.",
    btn_linkedin: "LinkedIn",
    projects_title: "My Projects",
    preview_note: "Design preview — not a live, browsable site.",
    preview_live_link: "View live site ↗",

    p1_tagline: "AI-powered B2B2C fair management platform",
    p1_desc: "A SaaS for managing trade fairs &amp; events — free for organizers, usage-based pricing for exhibiting companies.",
    p2_tagline: "Automated code-audit agent for developers",
    p2_desc: "A CLI that surfaces proof-backed, verified findings instead of blending them with guesses.",
    p3_tagline: "Personal safety &amp; emergency assistant",
    p3_desc: "Alerts your loved ones automatically if something happens — walking home alone, on a motorcycle trip, or facing a health risk. Live on the App Store.",
    p4_tagline: "Social drinking &amp; health-awareness app",
    p4_desc: "A mobile app that helps people track consumption habits and build health awareness.",
    p5_tagline: "Digital authentication site for artworks",
    p5_desc: "A web platform for verifying the authenticity of art pieces.",
    p6_tagline: "Human-assisted carrying &amp; concierge service for premium spaces",
    p6_desc: "A service concept offering professional, discreet human support in malls, airports, and events.",
    p7_tagline: "In-elevator advertising for prestigious locations",
    p7_desc: "A media/ad network running brand campaigns inside residence, office, and premium-building elevators.",
    p8_tagline: "Next.js-based AI chat application",
    p8_desc: "A Next.js chat interface built to prototype and experiment with LLM integrations.",
    p9_title: "Confidential Work",
    p9_tagline: "NDA-protected client projects",
    p9_desc: "Some of the products I've built live under client confidentiality agreements and can't be listed here — happy to walk through specifics in a conversation.",
    p10_tagline: "AI-powered review-reply SaaS for local businesses",
    p10_desc: "Connects a business's Google profile and drafts on-brand AI replies to customer reviews — nothing sends without owner approval.",
    p11_tagline: "iOS photo &amp; video editing app with on-device effects",
    p11_desc: "SwiftUI app with a Node/TypeScript backend for auth and storage — all photo/video processing runs on-device, not server-side.",
    p12_tagline: "Motion-first redesign concept for a corporate event agency",
    p12_desc: "Independent redesign concept of a real client's Wix site — WebGL hero, scroll-driven motion, and a working mobile nav. Live and fully browsable, not just a screenshot.",
    p13_tagline: "Pastel-pink storefront for a handmade Trendyol shop",
    p13_desc: "Standalone e-commerce concept for a real handmade brand. A headless-Chrome scraper pulls the shop's ~190 Trendyol products, prices, and images nightly into a JSON catalog; the site renders them with filtering, quick-view, and confetti — checkout hands off to Trendyol. Live and browsable.",
    p14_tagline: "Gridspark — EV charging network backend: OCPP station comms + OCPI roaming",
    p14_desc: "A from-scratch EV charging platform covering both protocols a real network runs on, in one process: real OCPP-J session framing (BootNotification through StopTransaction, periodic MeterValues) for talking to charge points, and the real OCPI registration handshake (Token A/B/C) plus Locations/CDR settlement for roaming partners — with a live, tabbed operations console. Dockerized, open source.",

    stack_title: "How I Build",
    stack_intro: "I move comfortably across languages and platforms — from web to mobile, backend to automation, I build whatever the problem needs. I have apps live on both iOS and Android. 🚀",
    grp_lang: "Languages",
    grp_mobile: "Mobile",
    grp_web: "Web &amp; Backend",
    grp_tools: "Tools &amp; Workflow",
    grp_ai: "Security &amp; AI",
    b_ios: "🍎 iOS (live on the App Store)",
    b_android: "🤖 Android (on Google Play)",
    b_restapi: "🔗 REST &amp; GraphQL APIs",
    b_testing: "🧪 Automated Testing (Playwright)",
    b_uxdesign: "🎯 Product &amp; UX Design",
    b_auth: "🔒 Auth &amp; Security",
    b_sysdesign: "📐 System Design",
    b_llm: "🧠 LLM Integrations",

    contact_title: "Got an idea? 💭",
    contact_text: "Reach out for new projects, collaborations, or just to say hi.",
    btn_github: "GitHub",
    btn_deck: "Download presentation (PDF, TR)",

    cert_label: "Certificate",
    footer_text: "Built with coffee and code ☕"
  },
  tr: {
    page_title: "Uğur Cihan Çekiç — Kurucu ve Full-Stack Geliştirici",
    hero_name: "Uğur Cihan Çekiç",
    footer_name: "Uğur Cihan Çekiç",
    nav_about: "Hakkımda",
    nav_projects: "Projeler",
    nav_stack: "Teknoloji",
    nav_contact: "İletişim",
    nav_press: "Basın",

    hero_greeting: "merhaba, ben 👋",
    hero_role: "Kurucu ve Full-Stack Geliştirici",
    hero_subtitle: "Fikirleri çalışan ürünlere dönüştürüyorum — kahve, kod ve biraz inatla. ✨",
    btn_projects: "Projelerimi Gör",
    btn_contact: "Merhaba De 👋",
    hero_scroll_hint: "Keşfetmek için kaydır ↓",

    about_title: "Hakkımda",
    about_text: "Ürünleri uçtan uca inşa ediyorum — fikir, tasarım, mühendislik, yayın. Yazılımla yolculuğum 2017'de bir Swift kursuyla başladı; ilk fikrim için geliştirici bulamayınca tamamen buna yöneldim. O günden beri kendi ürünlerimi gerçek kullanıcılara ulaştırıyorum: AI destekli etkinlik yönetim platformu KuExpo App Store ve Google Play'de, kişisel güvenlik uygulaması LifeCheck Mobility App Store'da yayında. Şu sıralar yapay zekâyı herkesin anlayabileceği sade bir dille anlatan bir kitap yazıyorum: Makineyle Aynı Masada. Yakında.",
    mini1: "Ürün odaklı düşünürüm 🎯",
    mini2: "Uçtan uca geliştirme 🚀",
    mini3: "Çoklu platform: Web, iOS, Android 📱",

    nav_book: "Kitap",
    book_title: "Kitabım",
    book_status: "Yakında",
    book_sub: "Yapay zekâ çağında insan kalmanın rehberi",
    book_hook: "Masaya yeni biri oturdu. Kimse \"hoş geldin\" demedi, kimse de \"kalk\" demedi.",
    book_text: "Yapay zekâyla yaşamaya dair sakin ve merak uyandıran bir rehber: makinenin konuşmayı nasıl öğrendiği, işinize, çocuğunuza ve kararlarınıza etkisi, sahte sesleri ayırt etmek ve yirmi dakikada kendi küçük dil modelinizi yazmak. Ne kıyamet tellallığı ne reklam.",
    book_p1: "Korkmadan da kutsamadan da anlamak",
    book_p2: "11 şema, tablolar ve her bölümde küçük bir deney",
    book_p3: "Yaşlı yakınlarınıza verebileceğiniz tek sayfalık \"şüphe listesi\"",
    book_cta: "Çıkınca haber ver ✉️",
    book_email_label: "E-posta adresin",
    book_ok: "Listedesin. Kitap çıkınca sana e-posta atacağım. 📚",
    book_invalid: "Lütfen geçerli bir e-posta adresi gir.",
    book_err: "Bir şeyler ters gitti. Tekrar dene ya da bana doğrudan e-posta at.",
    press_title: "Basında",
    press_source: "UAE Times Now",
    press_date: "9 Eylül 2026",
    press_excerpt: "Bir geliştirici bulamamanın, \"o zaman kendim yaparım\" kararına dönüşmesi ve bunun fuarların insanları, şirketleri ve deneyimleri buluşturma biçimini yeniden şekillendiren KuExpo'ya uzanan hikayesi. (Makale İngilizcedir.)",
    press_cta: "Makaleyi oku",
    press_newtab: " (yeni sekmede açılır)",
    grp_products: "Ürünler",
    grp_engineering: "Mühendislik &amp; Açık Kaynak",
    grp_web: "Web &amp; Tasarım",
    grp_ventures: "Girişimler &amp; Konseptler",
    oss_tagline: "Açık kaynak EV şarj projelerine katkılar",
    oss_desc1: "Yaygın kullanılan bir Python OCPP kütüphanesine, OCPP 2.1 spesifikasyonunda eksik 91 sınıfı regresyon testleriyle ekledim.",
    oss_desc2: "Üretimde kullanılan bir OCPP sunucusunun Docker Compose kurulumunu sıkılaştırdım: veritabanı portunu host'a kapattım, izole bir ağ ekledim.",
    btn_linkedin: "LinkedIn",
    projects_title: "Projelerim",
    preview_note: "Tasarım önizlemesi — canlı, gezilebilir bir site değildir.",
    preview_live_link: "Canlı Siteyi Görüntüle ↗",

    p1_tagline: "AI destekli B2B2C fuar yönetim platformu",
    p1_desc: "Organizatörlere ücretsiz, firmalara kullanım bazlı fiyatlandırmayla çalışan fuar &amp; etkinlik yönetim SaaS'ı.",
    p2_tagline: "Geliştiriciler için otomatik kod denetim ajanı",
    p2_desc: "Tahminle harmanlamadan, kanıta dayalı ve doğrulanmış bulgular sunan bir kod denetim CLI'ı.",
    p3_tagline: "Kişisel güvenlik &amp; acil durum asistanı",
    p3_desc: "Bir şey olursa sevdiklerini otomatik bilgilendirir — yalnız eve dönerken, motosiklet yolculuğunda ya da bir sağlık riskinde. App Store'da yayında.",
    p4_tagline: "Sosyal alkol tüketimi &amp; sağlık farkındalık uygulaması",
    p4_desc: "Tüketim alışkanlıklarını takip edip sağlık farkındalığı kazandıran mobil uygulama.",
    p5_tagline: "Sanat eserleri için dijital doğrulama sitesi",
    p5_desc: "Sanat eserlerinin özgünlüğünü doğrulamaya yönelik web platformu.",
    p6_tagline: "Premium ortamlar için insan destekli taşıma hizmeti",
    p6_desc: "AVM, havalimanı ve etkinliklerde profesyonel ve sağduyulu bir insan desteği sunan hizmet konsepti.",
    p7_tagline: "Prestijli lokasyonlarda asansör içi reklamcılık",
    p7_desc: "Rezidans, ofis ve prestijli site asansörlerinde marka reklamı yayınlayan bir medya/reklam ağı.",
    p8_tagline: "Next.js tabanlı AI sohbet uygulaması",
    p8_desc: "LLM entegrasyonlarını denemek için kullanılan Next.js altyapılı sohbet arayüzü.",
    p9_title: "Gizli Projeler",
    p9_tagline: "NDA kapsamındaki müşteri projeleri",
    p9_desc: "Geliştirdiğim bazı ürünler müşteri gizlilik sözleşmeleri kapsamında olduğu için burada detaylandıramıyorum — konuşurken detaylarını paylaşabilirim.",
    p10_tagline: "Yerel işletmeler için AI destekli yorum yanıt SaaS'ı",
    p10_desc: "İşletmenin Google Business profilini bağlar, marka tonuna uygun AI yanıt taslakları üretir — onay olmadan hiçbir yanıt otomatik gönderilmez.",
    p11_tagline: "Cihaz üzerinde efekt işleyen iOS fotoğraf &amp; video uygulaması",
    p11_desc: "Auth ve depolama için Node/TypeScript backend'i olan SwiftUI uygulaması — tüm fotoğraf/video işleme cihaz üzerinde çalışır, sunucuda değil.",
    p12_tagline: "Kurumsal etkinlik ajansı için hareket odaklı yeniden tasarım konsepti",
    p12_desc: "Gerçek bir müşterinin Wix sitesinin bağımsız yeniden tasarım konsepti — WebGL hero, scroll animasyonları ve çalışan mobil menüyle. Sadece ekran görüntüsü değil, canlı ve tamamen gezilebilir.",
    p13_tagline: "El yapımı bir Trendyol mağazası için pastel-pembe vitrin",
    p13_desc: "Gerçek bir el yapımı marka için bağımsız e-ticaret konsepti. Headless-Chrome scraper mağazanın ~190 Trendyol ürününü, fiyatını ve görselini her gece JSON kataloğa çeker; site bunları filtre, hızlı bakış ve konfetiyle gösterir — ödeme Trendyol'a devredilir. Canlı ve gezilebilir.",
    p14_tagline: "Gridspark — Elektrikli araç şarj ağı backend'i: OCPP istasyon iletişimi + OCPI roaming",
    p14_desc: "Gerçek bir şarj ağının çalıştığı iki protokolü de tek process'te kapsayan, sıfırdan yazılmış bir platform: şarj istasyonlarıyla konuşmak için gerçek OCPP-J oturum çerçeveleme (BootNotification'dan StopTransaction'a, periyodik MeterValues) ve roaming ortakları için gerçek OCPI kayıt akışı (Token A/B/C) ile Lokasyon/CDR faturalama — canlı, sekmeli bir operasyon panosuyla. Dockerize edilmiş, açık kaynak.",

    stack_title: "Nasıl İnşa Ediyorum",
    stack_intro: "Diller ve platformlar arasında rahatça geçiş yapıyorum — web'den mobile, backend'den otomasyona kadar ihtiyaç neyse onu yazıyorum. iOS ve Android'de yayınlanmış uygulamalarım var. 🚀",
    grp_lang: "Diller",
    grp_mobile: "Mobil",
    grp_web: "Web &amp; Backend",
    grp_tools: "Araçlar &amp; İş Akışı",
    grp_ai: "Güvenlik &amp; AI",
    b_ios: "🍎 iOS (App Store'da yayında)",
    b_android: "🤖 Android (Google Play'de)",
    b_restapi: "🔗 REST ve GraphQL API'leri",
    b_testing: "🧪 Otomatik Test (Playwright)",
    b_uxdesign: "🎯 Ürün &amp; UX Tasarımı",
    b_auth: "🔒 Auth &amp; Güvenlik",
    b_sysdesign: "📐 Sistem Tasarımı",
    b_llm: "🧠 LLM Entegrasyonları",

    contact_title: "Bir fikrin mi var? 💭",
    contact_text: "Yeni projeler, iş birlikleri veya sadece merhaba demek için ulaşabilirsin.",
    btn_github: "GitHub",
    btn_deck: "Sunumu indir (PDF)",

    cert_label: "Sertifika",
    footer_text: "Kahve ve kodla yapıldı ☕"
  }
};

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  if (translations[lang].page_title) {
    document.title = translations[lang].page_title.replace(/&amp;/g, '&');
  }
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      el.innerHTML = translations[lang][key];
    }
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

const langAnnouncements = {
  en: 'Language switched to English.',
  tr: 'Dil Türkçe olarak değiştirildi.'
};

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage('en');
  const announcer = document.getElementById('langAnnouncer');
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.lang);
      // Only announce on user-triggered switches, not the initial load above —
      // innerHTML swaps are silent to screen readers otherwise (no reload,
      // no focus change), so confirm the switch happened via a live region.
      if (announcer) {
        announcer.textContent = langAnnouncements[btn.dataset.lang] || '';
      }
    });
  });
  document.getElementById('year').textContent = new Date().getFullYear();
});
