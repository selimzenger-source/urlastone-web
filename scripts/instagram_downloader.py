"""
URLASTONE Instagram Video Downloader
Kendi hesabınızdaki tüm videoları en yüksek kalitede (ses dahil) indirir.

Kullanım:
  1. pip install instaloader
  2. python instagram_downloader.py

İlk çalıştırmada Instagram giriş bilgileri istenir (2FA destekli).
Session kaydedilir, sonraki çalıştırmalarda tekrar giriş gerekmez.
"""

import instaloader
import os
import sys
from pathlib import Path
from datetime import datetime

# Ayarlar
INSTAGRAM_USERNAME = "urlastone"  # İndirilecek profil
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "instagram-videos")

def main():
    # Çıktı klasörünü oluştur
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Instaloader ayarları - en yüksek kalite
    L = instaloader.Instaloader(
        download_videos=True,
        download_video_thumbnails=True,
        download_geotags=False,
        download_comments=False,
        save_metadata=True,
        compress_json=False,
        post_metadata_txt_pattern="",  # Ekstra txt dosyası oluşturma
        max_connection_attempts=3,
        request_timeout=60,
        dirname_pattern=OUTPUT_DIR,
        filename_pattern="{date_utc:%Y%m%d}_{shortcode}",
    )

    # Giriş yap (private hesaplar ve yüksek kalite için gerekli)
    print("\n📸 URLASTONE Instagram Video Downloader")
    print("=" * 50)

    # Kayıtlı session var mı kontrol et
    session_file = os.path.join(os.path.dirname(__file__), f".instaloader-session-{INSTAGRAM_USERNAME}")

    try:
        # Önce kayıtlı session dene
        if os.path.exists(session_file):
            print("📁 Kayıtlı oturum bulundu, giriş yapılıyor...")
            L.load_session_from_file(INSTAGRAM_USERNAME, session_file)
            print("✅ Oturum yüklendi")
        else:
            # Manuel giriş
            login_user = input(f"\nInstagram kullanıcı adınız (giriş için): ").strip()
            if not login_user:
                login_user = INSTAGRAM_USERNAME

            print(f"🔐 {login_user} ile giriş yapılıyor...")
            L.login(login_user, input("Şifre: "))

            # Session kaydet
            L.save_session_to_file(session_file)
            print("✅ Giriş başarılı, oturum kaydedildi")
    except instaloader.exceptions.TwoFactorAuthRequiredException:
        code = input("📱 2FA kodu: ").strip()
        L.two_factor_login(code)
        L.save_session_to_file(session_file)
        print("✅ 2FA ile giriş başarılı")
    except instaloader.exceptions.BadCredentialsException:
        print("❌ Hatalı kullanıcı adı veya şifre!")
        sys.exit(1)
    except Exception as e:
        print(f"⚠️ Giriş hatası: {e}")
        print("Giriş yapmadan devam ediliyor (sadece public içerik)...")

    # Profili yükle
    print(f"\n🔍 @{INSTAGRAM_USERNAME} profili yükleniyor...")
    try:
        profile = instaloader.Profile.from_username(L.context, INSTAGRAM_USERNAME)
    except Exception as e:
        print(f"❌ Profil bulunamadı: {e}")
        sys.exit(1)

    print(f"👤 {profile.full_name}")
    print(f"📊 {profile.mediacount} gönderi, {profile.followers} takipçi")

    # Mevcut indirilen videoları kontrol et
    existing = set()
    for f in Path(OUTPUT_DIR).glob("*.mp4"):
        # Dosya adından shortcode çıkar
        parts = f.stem.split("_")
        if len(parts) >= 2:
            existing.add(parts[-1])

    print(f"📂 Mevcut indirilen: {len(existing)} video")

    # Videoları indir
    video_count = 0
    skipped = 0
    errors = 0

    print(f"\n⬇️  Videolar indiriliyor → {OUTPUT_DIR}")
    print("-" * 50)

    for post in profile.get_posts():
        # Sadece videoları al (Reels dahil)
        if not post.is_video:
            # Carousel post ise içindeki videoları kontrol et
            if post.typename == "GraphSidecar":
                for node in post.get_sidecar_nodes():
                    if node.is_video:
                        if post.shortcode in existing:
                            skipped += 1
                            continue
                        try:
                            print(f"  📹 Carousel video: {post.shortcode} ({post.date_utc.strftime('%Y-%m-%d')})")
                            L.download_post(post, target=Path(OUTPUT_DIR))
                            video_count += 1
                            existing.add(post.shortcode)
                        except Exception as e:
                            print(f"  ❌ Hata: {e}")
                            errors += 1
                        break  # Carousel'dan bir kez indir
            continue

        # Zaten indirilmiş mi?
        if post.shortcode in existing:
            skipped += 1
            continue

        try:
            date_str = post.date_utc.strftime('%Y-%m-%d')
            caption_short = (post.caption or "")[:50].replace("\n", " ")
            print(f"  📹 {post.shortcode} | {date_str} | {caption_short}...")

            L.download_post(post, target=Path(OUTPUT_DIR))
            video_count += 1

        except instaloader.exceptions.ConnectionException as e:
            print(f"  ⚠️ Bağlantı hatası, 30s bekleniyor: {e}")
            import time
            time.sleep(30)
            errors += 1
        except Exception as e:
            print(f"  ❌ Hata: {e}")
            errors += 1

    # Özet
    print("\n" + "=" * 50)
    print(f"✅ Tamamlandı!")
    print(f"   📹 Yeni indirilen: {video_count}")
    print(f"   ⏭️  Atlanan (zaten var): {skipped}")
    print(f"   ❌ Hata: {errors}")
    print(f"   📂 Konum: {os.path.abspath(OUTPUT_DIR)}")

    # MP4 dosyalarını listele
    mp4_files = sorted(Path(OUTPUT_DIR).glob("*.mp4"), key=lambda f: f.stat().st_size, reverse=True)
    if mp4_files:
        print(f"\n📋 İndirilen videolar ({len(mp4_files)} adet):")
        total_size = 0
        for f in mp4_files:
            size_mb = f.stat().st_size / (1024 * 1024)
            total_size += size_mb
            print(f"   {f.name} ({size_mb:.1f} MB)")
        print(f"\n   Toplam: {total_size:.1f} MB")


if __name__ == "__main__":
    main()
