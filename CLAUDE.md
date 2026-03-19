# URLASTONE Web - Claude Code Konfigurasyonu

## Proje Yapisi
- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **Deploy**: Vercel (auto-deploy from GitHub master branch)
- **GitHub**: https://github.com/selimzenger-source/urlastone-web
- **Branch**: master
- **Dev Port**: 3003

## Tasarim Sistemi

### Font Sistemi (ANA KURAL)
- **Baslik fontu**: `Playfair Display` (serif) — `font-heading` class'i
- **Body fontu**: `Inter` (sans-serif) — `font-body` class'i
- **Mono fontu**: `JetBrains Mono` (monospace) — `font-mono` class'i
- TUM sayfalarda ve componentlarda bu fontlar kullanilacak, hardcoded font YASAK

### Renk Paleti
- **Gold (ana vurgu)**: #b39345 (gold-400)
- **Arka plan**: #0a0a0a
- **Gold gradient**: linear-gradient(135deg, #b39345, #d2b96e, #b39345, #82692e)

### Tasarim Kurallari
- Baslik/slogan metinlerinde NOKTA (.) KULLANILMAZ
- Gold italic metinlerde nokta olmayacak
- 5 dil destegi: TR, EN, ES, AR, DE — tum metinler i18n uzerinden
- Koyu luks tema, glass-card efektleri

## i18n Sistemi
- Dosya: `src/lib/i18n.ts`
- Context: `src/context/LanguageContext.tsx`
- Yeni metin eklerken 5 dilde eklenmeli (TR, EN, ES, AR, DE)
- Type tanimina da eklenmeli

## Onemli Notlar
- Deploy oncesi `git push origin master` yeterli (Vercel otomatik)
- Gorseller `/public/` klasorunde
- Hero slaytlari: slide-1.jpg ... slide-8.jpg
- Featured taslar: featured-traverten.jpg, featured-mermer.jpg, featured-bazalt.jpg, featured-kalker.jpg
