import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";
import PageHeader from "../components/PageHeader";
import useAos from "../hooks/useAos";

const tips = [
  { icon: "☀️", title: "Cahaya cukup", text: "Cahaya siang paling baik. Hindari bayangan keras." },
  { icon: "🍃", title: "Satu daun saja", text: "Buat satu daun memenuhi sebagian besar bingkai." },
  { icon: "🤚", title: "Tahan stabil", text: "Foto yang tajam memberi hasil lebih andal." },
  { icon: "⬜", title: "Latar polos", text: "Letakkan daun di atas kertas atau telapak tangan." },
];

const MAX_SIZE_MB = 10;

function Detection() {
  useAos();

  const navigate = useNavigate();

  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const cardRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [facing, setFacing] = useState("environment");
  const [starting, setStarting] = useState(false);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const cameraOpen = Boolean(stream);

  /*
   * <video> baru ada di DOM setelah stream tersimpan di state, jadi stream
   * dipasang di useEffect. Cleanup-nya mematikan kamera saat stream diganti
   * atau halaman ditutup.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  /* Di HP, gulir otomatis agar tampilan kamera terlihat penuh saat dibuka. */
  useEffect(() => {
    if (stream) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [stream]);

  const startCamera = async (mode = facing) => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Browser ini tidak mendukung kamera. Buka lewat https atau localhost, atau pilih foto dari galeri."
      );
      return;
    }

    setStarting(true);
    setReady(false);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode } },
        audio: false,
      });

      setFacing(mode);
      setStream(newStream);
    } catch (err) {
      console.error(err);

      // Jika gagal ganti kamera, kamera lama masih menyala: jangan biarkan spinner tertahan.
      setReady(Boolean(stream));

      if (err.name === "NotAllowedError") {
        setError("Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser, lalu coba lagi.");
      } else if (err.name === "NotFoundError") {
        setError("Kamera tidak ditemukan di perangkat ini. Kamu bisa pilih foto dari galeri.");
      } else {
        setError("Kamera tidak dapat diakses. Pastikan tidak sedang dipakai aplikasi lain.");
      }
    } finally {
      setStarting(false);
    }
  };

  const closeCamera = () => {
    setStream(null);
    setReady(false);
    setError("");
  };

  const switchCamera = () => {
    startCamera(facing === "environment" ? "user" : "environment");
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/jpeg", 0.92);

    setFlash(true);

    setTimeout(() => {
      closeCamera();
      navigate("/preview", { state: { image } });
    }, 150);
  };

  const handleFile = (file) => {
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, atau WEBP).");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${MAX_SIZE_MB} MB.`);
      return;
    }

    navigate("/preview", { state: { image: URL.createObjectURL(file) } });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-[linear-gradient(160deg,#F6F7F1_0%,#EAF3E2_50%,#DCEBD6_100%)] font-sans text-[#16351F]">
      <AnimatedBackground />
      <PageHeader backTo="/" backLabel="Beranda" step={1} />

      {/*
        Urutan di HP: judul → kartu foto → tips.
        Di layar lebar (lg): judul + tips di kiri, kartu foto di kanan.
      */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-[calc(3.5rem+env(safe-area-inset-bottom))] pt-6 sm:gap-10 sm:px-8 sm:pt-12 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-8 lg:pt-16">
        {/* Pengantar */}
        <div className="lg:col-start-1 lg:row-start-1">
          <h1
            data-aos="fade-up"
            className="font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-5xl"
          >
            Yuk, periksa daunmu lebih dekat.
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-3 max-w-md text-base leading-7 text-[#4E6154] sm:mt-5 sm:text-lg sm:leading-8"
          >
            Ambil foto baru atau unggah dari galeri. Kami akan memeriksa tanda-tanda penyakitnya.
          </p>
        </div>

        {/* Kartu ambil foto */}
        <div
          ref={cardRef}
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          <div className="overflow-hidden rounded-3xl bg-white/80 shadow-xl shadow-[#16351F]/5 ring-1 ring-[#16351F]/5 backdrop-blur sm:rounded-[2rem]">
            {!cameraOpen ? (
              <div className="p-3 sm:p-8">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition sm:rounded-3xl sm:px-6 sm:py-16 ${
                    dragging
                      ? "scale-[1.01] border-[#2F6B3F] bg-[#EEF3E8]"
                      : "border-[#16351F]/15 bg-[#F6F7F1]/70"
                  }`}
                >
                  <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#16351F] text-3xl sm:mb-6 sm:h-24 sm:w-24 sm:text-4xl">
                    {dragging ? "📥" : "🌿"}
                    <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#D7F27A] text-sm sm:h-9 sm:w-9 sm:text-base">
                      📷
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-semibold sm:text-2xl">
                    {dragging ? "Lepaskan foto di sini" : "Tambahkan foto daunmu"}
                  </h2>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#6B7A70]">
                    Buka kamera atau pilih gambar dari galeri. JPG, PNG, atau WEBP, maksimal{" "}
                    {MAX_SIZE_MB} MB.
                  </p>

                  <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:mt-8">
                    <button
                      onClick={() => startCamera()}
                      disabled={starting}
                      className="inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full bg-[#16351F] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#16351F]/20 transition hover:bg-[#2F6B3F] active:scale-[0.97] disabled:cursor-wait disabled:opacity-70 sm:py-4 sm:text-sm"
                    >
                      {starting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Membuka kamera…
                        </>
                      ) : (
                        <> Buka kamera</>
                      )}
                    </button>

                    <button
                      onClick={() => fileRef.current?.click()}
                      className="min-h-12 touch-manipulation rounded-full border border-[#16351F]/20 bg-white px-6 py-3.5 text-base font-semibold transition hover:bg-[#EEF3E8] active:scale-[0.97] sm:py-4 sm:text-sm"
                    >
                       Pilih dari galeri
                    </button>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 w-full max-w-sm rounded-2xl bg-red-50 px-4 py-3 text-left text-sm leading-6 text-red-700"
                    >
                      {error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#0E2015] p-2.5 sm:p-5">
                <div className="relative overflow-hidden rounded-2xl bg-black sm:rounded-3xl">
                  {/* Tinggi dibatasi agar tombol ambil foto tetap terlihat di HP */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => setReady(true)}
                    className="aspect-[3/4] max-h-[62dvh] w-full object-cover sm:aspect-[4/3] sm:max-h-none"
                  />

                  {!ready && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-[#D7F27A]" />
                    </div>
                  )}

                  {/* Sudut pemandu */}
                  <div className="pointer-events-none absolute inset-5 sm:inset-10">
                    <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-[#D7F27A] sm:h-10 sm:w-10" />
                    <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-[#D7F27A] sm:h-10 sm:w-10" />
                    <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-[#D7F27A] sm:h-10 sm:w-10" />
                    <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-[#D7F27A] sm:h-10 sm:w-10" />
                  </div>

                  <p className="pointer-events-none absolute left-1/2 top-3 w-max max-w-[92%] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1.5 text-center text-xs font-medium text-white backdrop-blur sm:top-4 sm:px-4">
                    Posisikan satu daun di dalam bingkai
                  </p>

                  {/* Kilatan */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${
                      flash ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-3 rounded-2xl bg-red-500/15 px-4 py-3 text-sm leading-6 text-red-100"
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1 py-4 sm:px-2 sm:py-6">
                  <button
                    onClick={closeCamera}
                    className="min-h-11 touch-manipulation justify-self-start rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 active:scale-95 sm:px-5 sm:py-3"
                  >
                    Batal
                  </button>

                  <button
                    onClick={capturePhoto}
                    disabled={!ready}
                    aria-label="Ambil foto"
                    className="touch-manipulation justify-self-center rounded-full border-4 border-white p-1 transition active:scale-90 disabled:opacity-40"
                  >
                    <span className="block h-16 w-16 rounded-full bg-[#D7F27A]" />
                  </button>

                  <button
                    onClick={switchCamera}
                    disabled={starting}
                    aria-label="Ganti kamera"
                    className="min-h-11 touch-manipulation justify-self-end rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 active:scale-95 disabled:opacity-50 sm:py-3"
                  >
                    🔄 Balik
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-start-1 lg:row-start-2 lg:grid-cols-1 lg:self-start">
          {tips.map((tip, i) => (
            <li key={tip.title} data-aos="fade-up" data-aos-delay={i * 80}>
              <div className="flex h-full flex-col items-start gap-2.5 rounded-2xl border border-white/70 bg-white/70 p-3.5 backdrop-blur transition duration-300 active:scale-[0.98] sm:gap-4 sm:p-4 lg:flex-row lg:hover:-translate-y-0.5 lg:hover:shadow-lg">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF3E8] text-lg sm:h-11 sm:w-11 sm:text-xl">
                  {tip.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold sm:text-base">{tip.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[#6B7A70] sm:text-sm sm:leading-6">
                    {tip.text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default Detection;