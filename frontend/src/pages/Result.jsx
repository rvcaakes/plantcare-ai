
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";
import PageHeader from "../components/PageHeader";
import useAos from "../hooks/useAos";

/* =========================================================
   FOTO DAUN MANGGA SEHAT
   Foto real dari Wikimedia Commons.
   ========================================================= */

const HEALTHY_LEAF_IMAGE = "/healthy-mango.jpg";

/* =========================================================
   INFORMASI PENYAKIT
   Nama penyakit mengikuti class model PlantCare AI.
   ========================================================= */

const diseaseInfo = {
  Anthracnose: {
    meaning:
      "Antraknosa adalah penyakit yang dapat menimbulkan bercak gelap pada daun mangga. Bercak dapat berkembang dan menyebabkan jaringan daun mengalami kerusakan.",
    signs: [
      "Bercak cokelat atau hitam pada daun",
      "Bercak dapat melebar seiring perkembangan penyakit",
      "Bagian daun dapat mengalami perubahan warna",
    ],
    actions: [
      "Pisahkan daun yang menunjukkan gejala dari daun yang sehat.",
      "Hindari menyiram langsung ke permukaan daun.",
      "Pastikan sirkulasi udara di sekitar tanaman cukup baik.",
      "Pantau daun lain untuk melihat apakah gejala mulai muncul.",
    ],
  },

  "Bacterial Canker": {
    meaning:
      "Bacterial canker merupakan penyakit bakteri yang dapat menyebabkan perubahan warna dan kerusakan pada jaringan tanaman mangga, termasuk bagian daun.",
    signs: [
      "Bercak atau luka pada permukaan daun",
      "Perubahan warna pada jaringan daun",
      "Jaringan di sekitar bercak dapat mengalami kerusakan",
    ],
    actions: [
      "Pisahkan bagian tanaman yang menunjukkan gejala.",
      "Hindari kelembapan berlebih pada permukaan daun.",
      "Gunakan alat yang bersih ketika menangani tanaman.",
      "Pantau perkembangan gejala pada daun lainnya.",
    ],
  },

  "Cutting Weevil": {
    meaning:
      "Cutting weevil berkaitan dengan kerusakan daun akibat aktivitas serangga pemakan atau pemotong jaringan daun.",
    signs: [
      "Tepi daun terlihat tidak rata",
      "Terdapat bagian daun yang seperti terpotong",
      "Kerusakan terlihat pada jaringan daun",
    ],
    actions: [
      "Periksa bagian tanaman untuk melihat keberadaan serangga.",
      "Buang bagian daun yang rusak parah.",
      "Pantau daun baru yang tumbuh.",
      "Periksa tanaman secara berkala untuk melihat kerusakan baru.",
    ],
  },

  "Die Back": {
    meaning:
      "Die back merupakan kondisi ketika bagian tanaman mengalami kemunduran atau kematian jaringan yang dapat terlihat melalui perubahan warna dan kondisi daun.",
    signs: [
      "Daun mengalami perubahan warna",
      "Jaringan daun terlihat mengering",
      "Bagian tanaman dapat menunjukkan tanda kemunduran",
    ],
    actions: [
      "Periksa bagian tanaman yang mengalami kerusakan.",
      "Buang bagian yang sudah mati atau rusak parah.",
      "Pastikan tanaman mendapatkan air dan cahaya yang sesuai.",
      "Pantau perkembangan kondisi tanaman.",
    ],
  },

  "Gall Midge": {
    meaning:
      "Gall midge merupakan serangga yang dapat menyebabkan kerusakan pada jaringan tanaman. Gejalanya dapat terlihat sebagai perubahan atau kerusakan pada permukaan daun.",
    signs: [
      "Perubahan bentuk atau permukaan daun",
      "Bercak atau bagian daun yang mengalami kerusakan",
      "Pertumbuhan daun dapat terlihat tidak normal",
    ],
    actions: [
      "Periksa daun dan tunas untuk melihat tanda aktivitas serangga.",
      "Pisahkan bagian tanaman yang rusak parah.",
      "Pantau pertumbuhan daun baru.",
      "Periksa tanaman secara rutin.",
    ],
  },

  Healthy: {
    meaning:
      "Daun terdeteksi sebagai daun sehat. Model tidak menemukan pola yang cukup kuat untuk memasukkannya ke salah satu kategori penyakit yang tersedia.",
    signs: [
      "Warna hijau relatif merata",
      "Permukaan daun terlihat utuh",
      "Tidak terlihat kerusakan yang dominan",
    ],
    actions: [
      "Pertahankan penyiraman dan perawatan tanaman secara teratur.",
      "Pastikan tanaman mendapatkan cahaya yang cukup.",
      "Jaga sirkulasi udara di sekitar tanaman.",
      "Tetap pantau perubahan pada daun secara berkala.",
    ],
  },

  "Powdery Mildew": {
    meaning:
      "Powdery mildew merupakan penyakit yang umumnya ditandai dengan lapisan atau bercak berwarna putih seperti tepung pada permukaan tanaman.",
    signs: [
      "Lapisan putih pada permukaan daun",
      "Bercak putih seperti tepung",
      "Daun dapat mengalami perubahan warna atau bentuk",
    ],
    actions: [
      "Pisahkan daun yang menunjukkan gejala dari daun sehat.",
      "Hindari kondisi terlalu lembap di sekitar tanaman.",
      "Pastikan sirkulasi udara cukup baik.",
      "Pantau perkembangan gejala pada daun lainnya.",
    ],
  },

  "Sooty Mould": {
    meaning:
      "Sooty mould merupakan lapisan jamur berwarna gelap yang dapat muncul pada permukaan daun dan membuat daun terlihat seperti tertutup jelaga.",
    signs: [
      "Lapisan hitam atau gelap pada permukaan daun",
      "Permukaan daun terlihat seperti tertutup jelaga",
      "Warna hijau daun dapat tertutup oleh lapisan gelap",
    ],
    actions: [
      "Periksa tanaman untuk melihat kemungkinan adanya serangga.",
      "Bersihkan bagian tanaman yang terkena jika memungkinkan.",
      "Pantau daun lain untuk melihat apakah lapisan gelap muncul.",
      "Jaga kebersihan dan sirkulasi udara tanaman.",
    ],
  },
};

/* =========================================================
   LEVEL CONFIDENCE
   ========================================================= */

function getConfidenceLevel(value) {
  if (value >= 80) {
    return {
      label: "Keyakinan tinggi",
      tone: "bg-[#D7F27A] text-[#16351F]",
      key: "high",
    };
  }

  if (value >= 60) {
    return {
      label: "Keyakinan sedang",
      tone: "bg-[#FFE9B0] text-[#5A4100]",
      key: "mid",
    };
  }

  return {
    label: "Keyakinan rendah",
    tone: "bg-[#FBD5D0] text-[#7A1F14]",
    key: "low",
  };
}

/* =========================================================
   KESIMPULAN
   ========================================================= */

function getConclusion(condition, confidence) {
  const level = getConfidenceLevel(confidence);

  if (condition === "Healthy") {
    if (level.key === "high") {
      return "Model mendeteksi daunmu sebagai daun sehat dengan tingkat keyakinan yang tinggi. Tetap lakukan pemantauan secara berkala.";
    }

    if (level.key === "mid") {
      return "Model mendeteksi pola yang lebih mirip daun sehat, tetapi belum sepenuhnya yakin. Kamu bisa mencoba foto ulang dengan pencahayaan yang lebih baik.";
    }

    return "Model belum cukup yakin bahwa daun ini sehat. Coba foto ulang dengan cahaya yang lebih baik dan pastikan daun terlihat jelas.";
  }

  if (level.key === "high") {
    return `Model mendeteksi kemungkinan ${condition} dengan tingkat keyakinan yang tinggi. Periksa kembali kondisi daun dan pantau tanaman di sekitarnya.`;
  }

  if (level.key === "mid") {
    return `Model mendeteksi kemungkinan ${condition}, tetapi tingkat keyakinannya belum terlalu tinggi. Coba foto ulang dan bandingkan dengan ciri-ciri di bawah.`;
  }

  return `Model mendeteksi kemungkinan ${condition}, tetapi tingkat keyakinannya masih rendah. Sebaiknya foto ulang dengan pencahayaan dan fokus yang lebih baik.`;
}

/* =========================================================
   RESULT
   ========================================================= */

function Result() {
  useAos();

  const location = useLocation();

  const image = location.state?.image;

  /*
   * INI BAGIAN PENTING:
   * Preview.jsx sudah melakukan request ke Flask.
   * Jadi Result.jsx cukup mengambil hasil yang dikirim melalui state.
   */
  const result = location.state?.result;

  const [view, setView] = useState("yours");
  const [barOn, setBarOn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarOn(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  /* Kalau tidak ada hasil */
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F1] px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">😥</div>

          <h2 className="text-2xl font-bold text-[#16351F]">
            Hasil tidak ditemukan
          </h2>

          <p className="mt-3 text-[#6B7A70]">
            Silakan lakukan deteksi terlebih dahulu untuk melihat hasil analisis.
          </p>

          <Link
            to="/detection"
            className="inline-block mt-6 rounded-full bg-[#16351F] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F6B3F]"
          >
            Kembali ke Deteksi
          </Link>
        </div>
      </div>
    );
  }

  const condition = result.prediction || "Tidak diketahui";
  const confidence = Number(result.confidence || 0);

  const info =
    diseaseInfo[condition] || {
      meaning:
        "Model berhasil memberikan prediksi, tetapi informasi detail untuk kategori ini belum tersedia.",
      signs: [
        "Pola daun berbeda dari kategori sehat",
        "Terdapat karakteristik visual tertentu pada gambar",
      ],
      actions: [
        "Coba foto ulang dengan pencahayaan yang baik.",
        "Pastikan daun terlihat jelas dan fokus.",
        "Pantau kondisi tanaman secara berkala.",
      ],
    };

  const level = getConfidenceLevel(confidence);

  const conclusion = getConclusion(condition, confidence);

  const card =
    "rounded-3xl bg-white/80 p-5 shadow-xl shadow-[#16351F]/5 ring-1 ring-[#16351F]/5 backdrop-blur sm:rounded-[2rem] sm:p-8";

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[linear-gradient(160deg,#F6F7F1_0%,#EAF3E2_50%,#DCEBD6_100%)] font-sans text-[#16351F]">
      <AnimatedBackground />

      <PageHeader
        backTo="/"
        backLabel="Beranda"
        step={3}
      />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-8 sm:pt-12 lg:pt-14">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <h1
          data-aos="fade-up"
          className="max-w-2xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"
        >
          Ini yang kami temukan.
        </h1>

        {/* =====================================================
            KESIMPULAN
        ===================================================== */}

        <section
          data-aos="fade-up"
          data-aos-delay="100"
          className="mt-6 rounded-3xl bg-[#16351F] p-5 text-white sm:mt-8 sm:rounded-[2rem] sm:p-10"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs sm:px-4 sm:text-sm">
              Kesimpulan
            </span>

            <span
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm ${level.tone}`}
            >
              {level.label}
            </span>

          </div>

          <p className="mt-4 max-w-3xl font-display text-xl font-medium leading-snug sm:mt-5 sm:text-3xl">
            {conclusion}
          </p>
        </section>

        {/* =====================================================
            FOTO + DETAIL
        ===================================================== */}

        <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">

          {/* ===================================================
              FOTO USER VS DAUN SEHAT
          =================================================== */}

          <section
            data-aos="fade-up"
            className="self-start rounded-3xl bg-white/80 p-2.5 shadow-xl shadow-[#16351F]/5 ring-1 ring-[#16351F]/5 backdrop-blur sm:rounded-[2rem] sm:p-4"
          >

            <div
              role="tablist"
              aria-label="Bandingkan daun"
              className="mb-2.5 grid grid-cols-2 rounded-full bg-[#EEF3E8] p-1 text-xs font-semibold sm:mb-3 sm:text-sm"
            >

              <button
                role="tab"
                aria-selected={view === "yours"}
                onClick={() => setView("yours")}
                className={`rounded-full py-2.5 transition active:scale-95 ${
                  view === "yours"
                    ? "bg-[#16351F] text-white shadow"
                    : "text-[#4E6154] hover:text-[#16351F]"
                }`}
              >
                Daunmu
              </button>

              <button
                role="tab"
                aria-selected={view === "healthy"}
                onClick={() => setView("healthy")}
                className={`rounded-full py-2.5 transition active:scale-95 ${
                  view === "healthy"
                    ? "bg-[#16351F] text-white shadow"
                    : "text-[#4E6154] hover:text-[#16351F]"
                }`}
              >
                Contoh daun sehat
              </button>

            </div>

            <div className="overflow-hidden rounded-2xl sm:rounded-3xl">

              {view === "yours" ? (
                image ? (
                  <img
                    src={image}
                    alt="Daun yang dianalisis"
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-[#DDEBD3] text-7xl">
                    🌿
                  </div>
                )
              ) : (
                <img
                  src={HEALTHY_LEAF_IMAGE}
                  alt="Contoh daun mangga sehat"
                  className="aspect-[4/5] w-full object-cover"
                />
              )}

            </div>

            <p className="px-2 pb-1 pt-3 text-center text-xs text-[#6B7A70]">

              {view === "yours"
                ? "Foto yang kamu kirim."
                : "Contoh foto daun mangga sehat untuk membantu perbandingan."}

            </p>

          </section>

          {/* ===================================================
              DETAIL HASIL
          =================================================== */}

          <div className="space-y-5 sm:space-y-6">

            <section
              data-aos="fade-up"
              data-aos-delay="100"
              className={card}
            >

              <p className="text-sm text-[#6B7A70]">
                Kemungkinan kondisi
              </p>

              <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
                {condition}
              </h2>

              {/* CONFIDENCE */}

              <div className="mt-5 rounded-2xl bg-[#EEF3E8] p-4 sm:mt-6 sm:p-5">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-[#4E6154]">
                    Tingkat keyakinan model
                  </span>

                  <span className="font-semibold">
                    {confidence}%
                  </span>

                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#16351F]/10">

                  <div
                    className="h-full rounded-full bg-[#2F6B3F] transition-all duration-1000 ease-out"
                    style={{
                      width: barOn ? `${confidence}%` : "0%",
                    }}
                  />

                </div>

              </div>

              {/* ARTINYA */}

              <h3 className="mt-7 font-semibold sm:mt-8">
                Apa artinya ini?
              </h3>

              <p className="mt-2 leading-7 text-[#4E6154]">
                {info.meaning}
              </p>

              {/* CIRI */}

              <h3 className="mt-6 font-semibold sm:mt-7">
                Ciri-ciri umum
              </h3>

              <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">

                {info.signs.map((sign) => (
                  <span
                    key={sign}
                    className="rounded-full bg-[#EEF3E8] px-3.5 py-1.5 text-[#2F6B3F] sm:px-4"
                  >
                    {sign}
                  </span>
                ))}

              </div>

            </section>

            {/* =================================================
                PERBANDINGAN
            ================================================= */}

            <section
              data-aos="fade-up"
              className={card}
            >

              <h3 className="font-display text-xl font-semibold sm:text-2xl">
                Daun sehat vs. daunmu
              </h3>

              <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">

                <div className="rounded-2xl bg-[#F6F7F1]/80 p-3.5 sm:p-4">

                  <p className="text-sm font-semibold">
                    Kondisi warna
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-3 text-xs leading-5 sm:text-sm sm:leading-6">

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7A70]">
                        Daun sehat
                      </p>

                      <p className="mt-0.5 text-[#2F6B3F]">
                        Hijau relatif merata
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7A70]">
                        Daunmu
                      </p>

                      <p className="mt-0.5 text-[#8A4B14]">
                        Berdasarkan hasil prediksi: {condition}
                      </p>
                    </div>

                  </div>

                </div>

                <div className="rounded-2xl bg-[#F6F7F1]/80 p-3.5 sm:p-4">

                  <p className="text-sm font-semibold">
                    Tingkat keyakinan
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-3 text-xs leading-5 sm:text-sm sm:leading-6">

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7A70]">
                        Daun sehat
                      </p>

                      <p className="mt-0.5 text-[#2F6B3F]">
                        Tidak terdeteksi penyakit
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7A70]">
                        Daunmu
                      </p>

                      <p className="mt-0.5 text-[#8A4B14]">
                        {confidence}% untuk {condition}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                LANGKAH SELANJUTNYA
            ================================================= */}

            <section
              data-aos="fade-up"
              className="rounded-3xl bg-[#D7F27A] p-5 sm:rounded-[2rem] sm:p-8"
            >

              <h3 className="font-display text-xl font-semibold sm:text-2xl">
                Langkah selanjutnya
              </h3>

              <ul className="mt-4 space-y-3 sm:mt-5">

                {info.actions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-3 text-sm leading-6 sm:text-base sm:leading-7"
                  >

                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16351F] text-[11px] text-white sm:mt-1.5">
                      ✓
                    </span>

                    {action}

                  </li>
                ))}

              </ul>

            </section>

          </div>

        </div>

        {/* =====================================================
            DISCLAIMER
        ===================================================== */}

        <p
          data-aos="fade-up"
          className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-[#6B7A70] sm:mt-10 sm:text-sm sm:leading-6"
        >
          Hasil ini merupakan prediksi model AI berdasarkan satu foto,
          bukan diagnosis akhir. Untuk kondisi tanaman yang parah,
          pertimbangkan untuk berkonsultasi dengan penyuluh pertanian
          atau ahli tanaman.
        </p>

        {/* =====================================================
            BUTTON
        ===================================================== */}

        <div
          data-aos="fade-up"
          className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row"
        >

          <Link
            to="/detection"
            className="rounded-full bg-[#16351F] px-8 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-[#16351F]/20 transition hover:bg-[#2F6B3F] active:scale-95 sm:py-4"
          >
            Periksa daun lain →
          </Link>

          <Link
            to="/"
            className="rounded-full border border-[#16351F]/20 bg-white/60 px-8 py-3.5 text-center text-sm font-semibold transition hover:bg-white active:scale-95 sm:py-4"
          >
            Kembali ke beranda
          </Link>

        </div>

      </main>
    </div>
  );
}

export default Result;
