# Fugo Creative Test Case

MVP tool internal untuk mengumpulkan brief klien dari form publik, menganalisisnya dengan LLM,  
dan mengelolanya di dashboard. Next.js (frontend + backend dalam satu aplikasi), PostgreSQL,  
**tanpa queue/worker terpisah**.

## Stack

*   **Next.js 15** (App Router, React 19, TypeScript) — UI publik + dashboard + server actions/API
*   **PostgreSQL 16** + **Prisma 6** (migrasi + seed)
*   **Zod** untuk validasi input (dipakai di klien dan server)
*   **Auth**: satu role `admin`, sesi database + cookie HttpOnly (bcrypt untuk password)
*   **AI**: endpoint OpenAI-compatible (`POST {baseUrl}/chat/completions`), kredensial disimpan di tabel `ai_credentials`
*   Tanpa RBAC, tanpa notifikasi email, tanpa queue

Provider/model yang dipakai saat pengembangan: **DeepSeek** (`https://api.deepseek.com/v1`, model `deepseek-chat`).  
Karena memakai format OpenAI-compatible, provider lain (OpenAI, Groq, dsb.) bisa dipakai dengan mengganti  
URL + model di halaman Pengaturan. Untuk pengujian otomatis dipakai mock HTTP lokal.

## Struktur

```
app/
├── prisma/
│   ├── schema.prisma      users, sessions, ai_credentials, briefs, ai_runs, pipeline_events, brief_notes
│   ├── migrations/
│   ├── seed.mjs           seed 1 user admin (dari env)
│   └── demo.ts            opsional: 14 brief contoh untuk demo pagination (dev)
├── src/
│   ├── app/               halaman: /, /login, /admin/briefs, /admin/briefs/[id], /admin/settings, /admin/users
│   ├── actions/           server actions (auth, briefs, settings, users)
│   ├── components/        shell admin, form publik, form login, dialog tambah
│   └── lib/               db, auth, AI pipeline, validasi, label/format, pipeline
└── .docker/
    ├── Dockerfile        multi-stage (image produksi)
    └── docker-compose.yml
```

## Menjalankan lokal

Prasyarat: Node.js 20+, PostgreSQL.

```
cd app
cp .env.example .env          # sesuaikan DATABASE_URL
npm install
npx prisma migrate deploy     # atau: npm run db:migrate
npm run db:seed               # membuat 1 user admin
npm run dev                   # http://localhost:3200
```

Kredensial admin dari env (default): `admin@fugocreative.com` / `fugo2026`.  
Setelah login, buka **Pengaturan** dan tambahkan API key (URL, API key, nama model). Baris pertama otomatis aktif.

Opsional, isi data demo:

```
npm run db:demo
```

## Docker

```
cd app
docker compose -f .docker/docker-compose.yml up --build
# app: http://localhost:3000
```

Compose menjalankan Postgres + aplikasi; saat start aplikasi menjalankan `prisma migrate deploy` dan seed admin.  
Override kredensial: `ADMIN_EMAIL=... ADMIN_PASSWORD=... docker compose -f .docker/docker-compose.yml up --build`.

Image produksi dibangun multi-stage (`.docker/Dockerfile`): dependency build & Next build terpisah dari image runtime,  
runtime hanya berisi `node_modules` produksi + `.next` + Prisma client/migrasi. Seed memakai `prisma/seed.mjs` (Node biasa),  
bukan `tsx`, sehingga devDependency tidak ikut ke image.

## Alur AI (tanpa queue)

1.  `POST` form publik → validasi → brief disimpan dengan `ai_status = pending` → response sukses + nomor referensi.
2.  Setelah response, `after()` menjalankan `processBrief`: klaim atomik ke `processing`, panggil provider (timeout 20 dtk),  
    validasi output dengan Zod. Kalau tidak valid → 1 percobaan perbaikan → kalau tetap gagal: `failed` + simpan error & raw output di `ai_runs`.
3.  Penyapu: setiap kali dashboard dibuka, brief berstatus `processing` lebih dari 2 menit ditandai `failed`.
4.  Tombol **Proses ulang AI** mengulang jalur yang sama (guard: tidak bisa saat masih `processing`).

Output model yang diharapkan (divalidasi ketat, field tambahan ditolak):

```
{
  "summary": "ringkasan 1-2 kalimat",
  "service_category": "branding | website | mobile_app | ai_automation | social_media | other",
  "priority": "high | medium | low",
  "priority_reason": "alasan singkat",
  "missing_info": ["maksimal 5 item"]
}
```

## Halaman

| URL | Isi |
| --- | --- |
| `/` | Form brief publik (validasi per field, state sukses + nomor referensi) |
| `/login` | Login admin |
| `/admin/briefs` | Statistik, filter prioritas/kategori/status AI, pencarian, pagination |
| `/admin/pipeline` | Riwayat pemrosesan AI: tab status, error terakhir, proses ulang, pagination |
| `/admin/briefs/[id]` | Data brief, hasil AI, riwayat percobaan, transisi pipeline, proses ulang |
| `/admin/settings` | Tabel API key (URL, key tersamar, model, status aktif) + popup tambah |
| `/admin/users` | Daftar user, tambah user, aktif/non-aktifkan (admin terakhir dilindungi) |

## Keamanan & batasan yang disengaja

*   API key disimpan **plaintext** di database sesuai keputusan MVP; UI hanya menampilkan 4 karakter terakhir.  
    Batasi akses database dan rotasi key bila bocor.
*   Hanya satu role (`admin`); tidak ada pembatasan menu per user.
*   Tidak ada notifikasi email (termasuk saat AI gagal).
*   Rate limit form publik disimpan di memori proses (5 brief/jam/IP); cukup untuk satu instance, bukan untuk multi-instance.
*   `ai_raw_output` menyimpan output mentah (mengandung isi brief); pertimbangkan retensi sebelum dipakai produksi.
*   `brief_notes` ada di skema tetapi belum ada UI-nya.

## Test

```
npm test          # 16 unit test: validasi input + parsing output AI
npm run typecheck
npm run build
```

## Catatan pengerjaan

*   UI memakai stylesheet dari template **TailAdmin v2** (Tailwind CSS + Alpine) [https://demo.tailadmin.com/](https://demo.tailadmin.com/) yang disalin ke `src/app/tailadmin.css`; 
*   Komponen React ditulis ulang untuk Next.js. Sebagian utility tambahan ada di `src/app/mockup.css`.
*   Tools workspace pakai Multica AI [https://www.multica.ai/](https://www.multica.ai/)
*   Agent harness pakai Opencode [https://opencode.ai/](https://opencode.ai/)
*   Model AI yang dipakai deepseek-v4-flash