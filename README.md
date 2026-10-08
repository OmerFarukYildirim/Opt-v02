# OPT v02 — Online Personal Training Platform

> Spring Boot backend + React frontend ile geliştirilmiş, kişisel antrenman, beslenme ve randevu yönetimi sunan kapsamlı online coaching platformu.

---

## 📋 İçindekiler

- [Proje Hakkında](#proje-hakkında)
- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Mimari](#mimari)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Sayfa Haritası](#sayfa-haritası)
- [API & Güvenlik](#api--güvenlik)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

---

## 🎯 Proje Hakkında

**OPT (Online Personal Training)**, antrenörler ve danışanları bir araya getiren modern bir online kişisel antrenman platformudur. Sistem; antrenman programları, beslenme planları, randevu yönetimi, ödeme işlemleri ve admin paneli gibi kapsamlı özellikler sunar.

### Temel İşlevler

- 👤 **Kullanıcı Yönetimi** — Kayıt, giriş, JWT tabanlı kimlik doğrulama, rol bazlı erişim
- 💪 **Antrenman Programları** — Danışanlara özel workout planları
- 🥗 **Beslenme Planları** — Kişiselleştirilmiş meal/diyet programları
- 📅 **Randevu Sistemi** — Müsaitlik takvimi ve randevu yönetimi
- 💳 **Ödeme Entegrasyonu** — Stripe ile güvenli ödeme işlemleri
- 🔔 **Bildirim Sistemi** — E-posta ve sistem bildirimleri
- 🛡️ **Admin Paneli** — Danışan onaylama, program yönetimi, randevu takibi
- ☁️ **Dosya Depolama** — AWS S3 ile medya ve belge yönetimi

---

## ✨ Özellikler

### Danışan Tarafı
- 📝 **Kayıt & Giriş** — JWT token ile güvenli oturum yönetimi
- 🏠 **Ana Sayfa** — Platform tanıtımı ve hizmetler
- 💪 **Antrenmanlarım** — Atanan workout programlarını görüntüleme
- 🥗 **Beslenme Planım** — Günlük/günlük meal planlarını takip etme
- 📅 **Randevu Al** — Antrenörün müsaitlik takviminden randevu seçme
- 💳 **Ödeme Yap** — Stripe entegrasyonu ile güvenli ödeme
- 👤 **Profilim** — Kişisel bilgiler ve hesap yönetimi

### Antrenör (Admin) Tarafı
- ✅ **Danışan Onaylama** — Yeni kayıt olan danışanları onaylama/reddetme
- 📆 **Müsaitlik Yönetimi** — Takvim üzerinden müsaitlik saatlerini belirleme
- 👥 **Danışan Yönetimi** — Onaylı danışanları listeleme ve yönetme
- 💪 **Antrenman Atama** — Her danışana özel workout programları oluşturma
- 🥗 **Beslenme Atama** — Kişiselleştirilmiş meal planları oluşturma
- 📅 **Randevu Takibi** — Tüm randevuları görüntüleme ve yönetme

---

## 🛠️ Teknolojiler

### Backend — `OptDemo/`

| Teknoloji | Amaç |
|-----------|------|
| Java 21 | Programlama dili |
| Spring Boot 4.0.0-M1 | Web framework |
| Spring Data JPA | Veritabanı erişimi |
| Spring Security | Kimlik doğrulama & yetkilendirme |
| Spring Mail | E-posta bildirimleri |
| Spring Validation | Veri doğrulama |
| Thymeleaf | Sunucu taraflı şablon motoru |
| MySQL | İlişkisel veritabanı |
| Lombok | Boilerplate kod azaltma |
| ModelMapper | Entity ↔ DTO dönüşümleri |
| AWS S3 SDK | Bulut dosya depolama |
| Stripe Java SDK | Ödeme işlemleri |
| JJWT | JWT token yönetimi |

### Frontend — `opt-demo/`

| Teknoloji | Amaç |
|-----------|------|
| React 19 | UI kütüphanesi |
| Vite 7 | Build aracı |
| Tailwind CSS v4 | Stil framework'ü |
| React Router DOM v7 | Sayfa yönlendirme |
| Axios | HTTP istekleri |
| Chart.js | Grafik ve veri görselleştirme |
| Stripe React | Ödeme form entegrasyonu |
| FontAwesome | İkonlar |
| React Toastify | Bildirim toast'ları |

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │    Auth     │  │   Stripe    │  │      Admin Dashboard        │  │
│  │ (JWT/Login) │  │  (Payment)  │  │  (Coach Management Panel)   │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┬───────────────┘  │
│         │                │                       │                   │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌────────────┴────────────┐     │
│  │   Axios     │  │  Chart.js   │  │   Tailwind + Router     │     │
│  │   (API)     │  │  (Reports)  │  │   (UI/Navigation)       │     │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘     │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼ HTTP/REST + JWT
┌─────────────────────────────────────────────────────────────────────┐
│              Spring Boot Backend (Java 21)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Controllers│  │   Services  │  │    Repositories (JPA)       │  │
│  │  (REST API)  │  │  (Business) │  │    (MySQL)                  │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┬───────────────┘  │
│         │                │                       │                   │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌────────────┴────────────┐     │
│  │   Security  │  │   Stripe    │  │   AWS S3 / Mail / JWT   │     │
│  │  (JWT/Role) │  │  (Payment)  │  │   (External Services)   │     │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Proje Yapısı

```
Opt-v02/
├── OptDemo/                          # Spring Boot Backend
│   ├── src/main/java/com/opt/Omer/
│   │   ├── appointment/              # Randevu yönetimi
│   │   ├── auth_users/               # Kimlik doğrulama & kullanıcılar
│   │   ├── availability/             # Müsaitlik takvimi
│   │   ├── aws/                      # AWS S3 dosya işlemleri
│   │   ├── config/                   # Yapılandırma sınıfları
│   │   ├── enums/                    # Enum tanımları
│   │   ├── exceptions/               # Özel exception'lar
│   │   ├── meal/                     # Beslenme planları
│   │   ├── notification/             # Bildirim sistemi
│   │   ├── payment/                  # Ödeme işlemleri (Stripe)
│   │   ├── response/                 # API yanıt modelleri
│   │   ├── role/                     # Rol yönetimi
│   │   ├── security/                 # JWT & Security config
│   │   └── workout/                  # Antrenman programları
│   └── pom.xml
│
├── opt-demo/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                # Admin panel bileşenleri
│   │   │   ├── auth/                 # Giriş & kayıt sayfaları
│   │   │   ├── common/               # Navbar, Footer
│   │   │   ├── home/                 # Ana sayfa
│   │   │   ├── payment/              # Ödeme sayfası
│   │   │   ├── profile/              # Profil sayfası
│   │   │   ├── statuspages/          # Onay bekleme sayfası
│   │   │   └── workout-meal-appointment/  # Program & randevu
│   │   ├── services/                 # API servis katmanı
│   │   └── App.jsx                   # Ana router & layout
│   └── package.json
│
└── opt-app_accessKeys.csv            # AWS erişim anahtarları
```

---

## 🚀 Kurulum

### Gereksinimler

- [Java JDK 21](https://adoptium.net/)
- [Maven](https://maven.apache.org/)
- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://www.mysql.com/)
- [Stripe](https://stripe.com/) hesabı (test modu için)
- [AWS S3](https://aws.amazon.com/s3/) bucket (opsiyonel)

### Backend Kurulumu

```bash
cd OptDemo

# 1. Maven bağımlılıklarını yükle
./mvnw clean install

# 2. application.properties dosyasını yapılandır
# src/main/resources/application.properties:
#   - spring.datasource.url=jdbc:mysql://localhost:3306/opt_db
#   - spring.datasource.username=root
#   - spring.datasource.password=your_password
#   - jwt.secret=your_jwt_secret
#   - stripe.api.key=sk_test_...
#   - aws.s3.bucket=your-bucket
#   - aws.access.key=...
#   - aws.secret.key=...
#   - spring.mail.username=...
#   - spring.mail.password=...

# 3. Uygulamayı çalıştır
./mvnw spring-boot:run
```

API varsayılan olarak `http://localhost:8080` adresinde çalışır.

### Frontend Kurulumu

```bash
cd opt-demo

# 1. Bağımlılıkları yükle
npm install

# 2. Geliştirme sunucusunu başlat
npm run dev

# 3. Üretim derlemesi
npm run build
```

Frontend varsayılan olarak `http://localhost:5173` adresinde çalışır.

---

## 🗺️ Sayfa Haritası

### Danışan (Customer) Rotası

| Rota | Açıklama | Yetki |
|------|----------|-------|
| `/` | Ana sayfa | Herkese açık |
| `/home` | Ana sayfa (alternatif) | Herkese açık |
| `/login` | Giriş sayfası | Herkese açık |
| `/register` | Kayıt sayfası | Herkese açık |
| `/approval-pending` | Onay bekleme sayfası | Giriş yapmış, onay bekleyen |
| `/payment` | Ödeme sayfası (Stripe) | Giriş yapmış |
| `/workouts` | Antrenman programlarım | Onaylı danışan |
| `/meals` | Beslenme planım | Onaylı danışan |
| `/appointments` | Randevu al | Onaylı danışan |
| `/profile` | Profilim | Giriş yapmış |

### Antrenör (Admin) Rotası

| Rota | Açıklama |
|------|----------|
| `/admin/home` | Admin ana sayfa (danışan onaylama) |
| `/admin/home/availability` | Müsaitlik takvimi yönetimi |
| `/admin/home/customer/:id/appointments` | Danışan randevuları |
| `/admin/home/customer/:id/meals` | Danışan beslenme planı |
| `/admin/home/customer/:id/workouts` | Danışan antrenman programı |

---

## 🔐 API & Güvenlik

### Kimlik Doğrulama

- **JWT Token** — `Authorization: Bearer <token>` header'ı ile API erişimi
- **Rol Bazlı Erişim** — `ROLE_CUSTOMER`, `ROLE_COACH` rolleri
- **Kayıt Akışı** — Kayıt → Onay Bekleme → Ödeme → Onaylı Danışan

### Ödeme (Stripe)

- Stripe test modu entegrasyonu
- `PaymentPage` bileşeni `<Elements>` provider ile sarılmış
- Test kartı: `4242 4242 4242 4242`

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Branch oluşturun (`git checkout -b feature/...`)
3. Commit edin (`git commit -m 'feat: ...'`)
4. Push edin (`git push origin feature/...`)
5. Pull Request açın

---

## 📄 Lisans

[MIT](LICENSE)

---

## 👤 Geliştirici

**Ömer Faruk Yıldırım** — [@OmerFarukYildirim](https://github.com/OmerFarukYildirim)

---

> ⚠️ **Not:** Bu proje bir demo/öğrenme projesidir. Üretim ortamında kullanımdan önce güvenlik, ölçeklenebilirlik ve hata yönetimi konularında ek optimizasyonlar yapılması önerilir.
