import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";
import PageHeader from "../components/PageHeader";
import useAos from "../hooks/useAos";

/* ---------- Pengaturan API (sesuaikan dengan server Flask kamu) ---------- */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PREDICT_URL = `${API_URL}/predict`; // endpoint prediksi
const FILE_FIELD = "image";// nama field gambar yang dibaca Flask: request.files["file"]
const TIMEOUT_MS = 30000; // batas waktu menunggu server
const MIN_SCAN_MS = 1200; // animasi pindai tampil minimal segini, supaya tidak berkedip

const checks = [
  { id: "focus", label: "Daun tajam dan fokus" },
  { id: "light", label: "Pencahayaan merata, tanpa bayangan pekat" },
  { id: "single", label: "Hanya satu daun yang memenuhi sebagian besar bingkai" },
];

const pageBg =
  "relative isolate min-h-screen overflow-x-clip bg-[linear-gradient(160deg,#F6F7F1_0%,#EAF3E2_50%,#DCEBD6_100%)] font-sans text-[#16351F]";

function Preview() {
  useAos();

  const location = useLocation();
  const navigate = useNavigate();

  const image = location.state?.image;

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState({ focus: false, light: false, single: false });
  const controllerRef = useRef(null);

  // Batalkan permintaan yang masih berjalan saat halaman ditinggalkan
  useEffect(() => () => controllerRef.current?.abort(), []);

  const allChecked = Object.values(checked).every(Boolean);

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAnalyze = async () => {
    if (analyzing) return;

    setError("");
    setAnalyzing(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    try {
      // `image` bisa berupa data URL (dari kamera) atau blob URL (dari galeri):
      // keduanya bisa diubah kembali menjadi file dengan fetch.
      const blob = await (await fetch(image)).blob();
      const ext = blob.type.split("/")[1] || "jpg";

      const formData = new FormData();
      formData.append(FILE_FIELD, blob, `daun.${ext}`);

      const [response] = await Promise.all([
        fetch(PREDICT_URL, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }),
        new Promise((resolve) => setTimeout(resolve, MIN_SCAN_MS)),
      ]);

      if (!response.ok) {
        const httpError = new Error("HTTP error");
        httpError.status = response.status;
        throw httpError;
      }

      const result = await response.json();

      navigate("/result", { state: { image, result } });
    } catch (err) {
      // Dibatalkan karena halaman sudah ditinggalkan: tidak perlu memperbarui tampilan
      if (controller.signal.aborted && !timedOut) return;

      console.error(err);

      let message = "Tidak dapat terhubung ke server. Pastikan server berjalan, lalu coba lagi.";

      if (timedOut) {
        message = "Server terlalu lama merespons. Coba lagi sebentar lagi.";
      } else if (err.status) {
        message = `Server tidak dapat memproses foto ini (kode ${err.status}). Coba dengan foto lain.`;
      } else if (err instanceof SyntaxError) {
        message = "Respons dari server tidak sesuai format yang diharapkan.";
      }

      setError(message);
      setAnalyzing(false);
    } finally {
      clearTimeout(timeout);
    }
  };

  if (!image) {
    return (
      <div className={`${pageBg} flex items-center justify-center px-6 text-center`}>
        <AnimatedBackground />

        <div data-aos="zoom-in">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#16351F] text-4xl">
            🌱
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold">Belum ada foto</h1>
          <p className="mx-auto mt-2 max-w-xs text-[#4E6154]">
            Ambil foto atau pilih gambar dulu, lalu kembali ke sini.
          </p>
          <Link
            to="/detection"
            className="mt-7 inline-block rounded-full bg-[#16351F] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F6B3F] active:scale-95"
          >
            Tambah foto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={pageBg}>
      <AnimatedBackground />
      <PageHeader backTo="/detection" backLabel="Foto ulang" step={2} />

      <main className="mx-auto grid max-w-6xl items-start gap-7 px-4 pb-14 pt-8 sm:gap-10 sm:px-8 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-16">
        {/* Foto */}
        <div
          data-aos="zoom-in"
          className="overflow-hidden rounded-3xl bg-white/80 p-2.5 shadow-xl shadow-[#16351F]/5 ring-1 ring-[#16351F]/5 backdrop-blur sm:rounded-[2rem] sm:p-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#0E2015] sm:rounded-3xl">
            <img
              src={image}
              alt="Foto daun yang dipilih"
              className={`max-h-[52vh] w-full object-cover transition duration-500 sm:max-h-[65vh] ${
                analyzing ? "scale-[1.02] brightness-75" : ""
              }`}
            />

            {analyzing && (
              <>
                <div className="animate-scan pointer-events-none absolute inset-x-0 h-0.5 bg-[#D7F27A] shadow-[0_0_24px_6px_rgba(215,242,122,0.55)] motion-reduce:animate-none" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#D7F27A] px-4 py-2 text-xs font-semibold text-[#16351F]">
                  Memindai daun…
                </div>
              </>
            )}
          </div>
        </div>

        {/* Kanan */}
        <div>
          <h1
            data-aos="fade-up"
            className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"
          >
            Apakah daun ini terlihat jelas?
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-3 max-w-md text-base leading-7 text-[#4E6154] sm:mt-4 sm:text-lg sm:leading-8"
          >
            Foto yang jelas memberi hasil lebih andal. Periksa poin di bawah sebelum kami
            menganalisisnya.
          </p>

          <ul className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
            {checks.map((item, i) => {
              const on = checked[item.id];

              return (
                <li key={item.id} data-aos="fade-up" data-aos-delay={150 + i * 80}>
                  <button
                    onClick={() => toggle(item.id)}
                    disabled={analyzing}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition active:scale-[0.98] sm:gap-4 sm:p-4 ${
                      on
                        ? "border-[#2F6B3F] bg-[#EEF3E8]"
                        : "border-[#16351F]/10 bg-white/80 hover:border-[#16351F]/25"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                        on
                          ? "border-[#16351F] bg-[#16351F] text-white"
                          : "border-[#16351F]/25 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-sm font-medium sm:text-base">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 min-h-6 text-sm text-[#6B7A70]">
            {allChecked
              ? "Semua sudah oke. Siap dianalisis."
              : "Ragu dengan salah satu poin? Kamu bisa foto ulang."}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          <div data-aos="fade-up" className="mt-5 flex gap-3 sm:mt-6">
            <Link
              to="/detection"
              className={`flex-1 rounded-full border border-[#16351F]/20 bg-white/60 px-5 py-3.5 text-center text-sm font-semibold transition hover:bg-white active:scale-95 sm:flex-none sm:px-7 sm:py-4 ${
                analyzing ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Foto ulang
            </Link>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-full bg-[#16351F] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#16351F]/20 transition hover:bg-[#2F6B3F] active:scale-95 disabled:cursor-wait disabled:opacity-80 sm:flex-none sm:gap-3 sm:px-8 sm:py-4"
            >
              {analyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Menganalisis…
                </>
              ) : (
                <>{error ? "Coba lagi →" : "Analisis daun →"}</>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Preview;