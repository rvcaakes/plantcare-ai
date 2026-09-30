import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const links = [
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#fitur", label: "Yang kamu dapat" },
  { href: "#tentang", label: "Tentang" },
];

const steps = [
  {
    title: "Foto daun mangga",
    text: "Gunakan kamera atau pilih foto dari galeri. Pastikan satu daun mangga terlihat jelas dengan pencahayaan yang baik.",
  },
  {
    title: "Kami menganalisisnya",
    text: "Model machine learning mempelajari pola pada gambar dan membandingkannya dengan kondisi daun mangga yang telah dikenali.",
  },
  {
    title: "Lihat hasilnya",
    text: "Lihat kemungkinan kondisi daun, tingkat keyakinan model, dan tanda-tanda yang perlu kamu perhatikan.",
  },
];

const spots = [
  {
    cx: 255,
    cy: 215,
    r: 17,
    title: "Bercak gelap",
    text: "Perubahan warna pada permukaan daun dapat menjadi salah satu pola yang perlu diperhatikan.",
  },
  {
    cx: 150,
    cy: 300,
    r: 12,
    title: "Bercak muda",
    text: "Bercak pada daun dapat memiliki bentuk dan warna yang berbeda tergantung kondisi tanaman.",
  },
  {
    cx: 238,
    cy: 340,
    r: 9,
    title: "Area terdampak",
    text: "Perubahan pada beberapa bagian daun dapat menjadi pola yang dipelajari oleh model.",
  },
];

/* Kartu miring 3D mengikuti kursor (tidak aktif di layar sentuh) */
function Tilt3D({ children, max = 12 }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
  };

  const reset = () => {
    if (ref.current) {
      ref.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <div onPointerMove={onMove} onPointerLeave={reset}>
      <div
        ref={ref}
        className="transition-transform duration-200 ease-out will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </div>
  );
}

/* Daun melayang 3D di latar.
   Di HP hanya 3 daun yang tampil (yang bertanda mobile: true) agar tidak ramai. */
const floatingLeaves = [
  { top: "3%", left: "4%", size: 44, delay: 0, dur: 11, color: "#5B9A5F", opacity: 0.4, mobile: true },
  { top: "60%", left: "8%", size: 44, delay: 2, dur: 9, color: "#7CB342", opacity: 0.35, mobile: false },
  { top: "18%", left: "46%", size: 36, delay: 4, dur: 13, color: "#A9D18E", opacity: 0.5, mobile: false },
  { top: "88%", left: "70%", size: 48, delay: 1, dur: 12, color: "#3C7A4D", opacity: 0.3, mobile: true },
  { top: "6%", left: "86%", size: 40, delay: 3, dur: 10, color: "#7CB342", opacity: 0.4, mobile: true },
  { top: "82%", left: "92%", size: 40, delay: 5, dur: 14, color: "#5B9A5F", opacity: 0.4, mobile: false },
];

function FloatingLeaves() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ perspective: "900px" }}
    >
      {floatingLeaves.map((l, i) => (
        <div
          key={i}
          className={`animate-float3d absolute motion-reduce:animate-none ${
            l.mobile ? "" : "hidden sm:block"
          }`}
          style={{
            top: l.top,
            left: l.left,
            width: l.size,
            height: l.size * 1.25,
            opacity: l.opacity,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.dur}s`,
            transformStyle: "preserve-3d",
          }}
        >
          <svg viewBox="0 0 400 500" className="h-full w-full drop-shadow-xl">
            <path
              d="M200 30 C335 115 365 270 200 470 C35 270 65 115 200 30 Z"
              fill={l.color}
            />
            <path
              d="M200 50 L200 460"
              stroke="#A9D18E"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M200 200 L120 150 M200 200 L280 150 M200 300 L120 250 M200 300 L280 250"
              stroke="#A9D18E"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

function LeafScan() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const [tick, setTick] = useState(0);

  const pick = (i) => {
    setActive(i);
    setTouched(true);
    setTick((t) => t + 1);
  };

  const current = spots[active];

  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-[340px] sm:max-w-[440px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl bg-[#16351F] shadow-2xl shadow-[#16351F]/25 sm:rounded-[2rem]">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3C7A4D]/50 blur-3xl" />

        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 h-full w-full p-6 sm:p-10"
        >
          <path
            d="M200 30 C335 115 365 270 200 470 C35 270 65 115 200 30 Z"
            fill="#5B9A5F"
          />

          <path
            d="M200 30 C335 115 365 270 200 470 C35 270 65 115 200 30 Z"
            fill="none"
            stroke="#A9D18E"
            strokeWidth="3"
          />

          <g
            stroke="#A9D18E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity=".8"
          >
            <path d="M200 50 L200 460" />
            <path d="M200 140 L120 105" />
            <path d="M200 140 L280 105" />
            <path d="M200 220 L100 170" />
            <path d="M200 220 L300 170" />
            <path d="M200 305 L110 250" />
            <path d="M200 305 L290 250" />
            <path d="M200 385 L140 335" />
            <path d="M200 385 L260 335" />
          </g>

          {/* Kotak deteksi mengikuti titik yang dipilih */}
          <g
            className="pointer-events-none transition-transform duration-500 ease-out"
            style={{
              transform: `translate(${current.cx - 42}px, ${
                current.cy - 42
              }px)`,
            }}
          >
            <rect
              width="84"
              height="84"
              rx="14"
              fill="none"
              stroke="#D7F27A"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
          </g>

          {/* Titik yang dapat diklik */}
          {spots.map((s, i) => (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Periksa ${s.title}`}
              className="cursor-pointer outline-none"
              onClick={() => pick(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pick(i);
                }
              }}
            >
              {/* Area klik transparan yang lebih besar */}
              <circle cx={s.cx} cy={s.cy} r={s.r + 18} fill="transparent" />

              <g
                className={`transition-transform duration-300 ${
                  active === i && touched ? "scale-125" : "scale-100"
                }`}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
              >
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill="#6B4A2B"
                  opacity=".9"
                />

                <circle cx={s.cx} cy={s.cy} r={s.r / 2} fill="#3F2A16" />
              </g>

              {/* Animasi petunjuk sampai pertama kali diklik */}
              {!touched && (
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill="none"
                  stroke="#D7F27A"
                  strokeWidth="2.5"
                >
                  <animate
                    attributeName="r"
                    from={s.r}
                    to={s.r + 20}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />

                  <animate
                    attributeName="opacity"
                    from=".9"
                    to="0"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Efek riak ketika diklik */}
              {touched && active === i && (
                <circle
                  key={tick}
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill="none"
                  stroke="#D7F27A"
                  strokeWidth="4"
                >
                  <animate
                    attributeName="r"
                    from={s.r}
                    to={s.r + 40}
                    dur="0.6s"
                    fill="freeze"
                  />

                  <animate
                    attributeName="opacity"
                    from="1"
                    to="0"
                    dur="0.6s"
                    fill="freeze"
                  />
                </circle>
              )}
            </g>
          ))}
        </svg>

        {/* Garis pemindaian */}
        <div className="animate-scan pointer-events-none absolute inset-x-0 h-0.5 bg-[#D7F27A] shadow-[0_0_24px_6px_rgba(215,242,122,0.55)] motion-reduce:animate-none" />

        {/* Petunjuk klik */}
        <span
          className={`pointer-events-none absolute left-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur transition-opacity duration-300 ${
            touched ? "opacity-0" : "opacity-100"
          }`}
        >
          Ketuk salah satu titik
        </span>

        {/* Informasi titik */}
        <div
          className={`pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-3 shadow-lg transition duration-300 ${
            touched ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <p className="text-sm font-semibold text-[#16351F]">
            {current.title}
          </p>

          <p className="mt-0.5 text-xs leading-5 text-[#4E6154]">
            {current.text}
          </p>
        </div>
      </div>

      {/* Kartu hasil (melayang di depan) */}
      <div
        className="pointer-events-none absolute -right-2 top-[26%] rounded-2xl bg-white px-3 py-2 shadow-xl sm:-right-8 sm:px-4 sm:py-3"
        style={{ transform: "translateZ(60px)" }}
      >
        <p className="text-[11px] text-[#6B7A70] sm:text-xs">
          Kemungkinan kondisi
        </p>

        {/* Contoh hasil sebelum model ML terhubung */}
        <p className="text-sm font-semibold text-[#16351F]">Antraknosa</p>

        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E3EBDD] sm:w-20">
            <div className="h-full w-[87%] rounded-full bg-[#2F6B3F]" />
          </div>

          <span className="text-xs font-semibold text-[#2F6B3F]">87%</span>
        </div>
      </div>

      {/* Kartu status (melayang paling depan) */}
      <div
        className="pointer-events-none absolute -bottom-4 left-3 flex items-center gap-2 rounded-full bg-[#D7F27A] px-3 py-1.5 text-xs font-semibold text-[#16351F] shadow-lg sm:-left-6 sm:px-4 sm:py-2"
        style={{ transform: "translateZ(80px)" }}
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#16351F] motion-reduce:animate-none" />
        Sedang memindai daun…
      </div>
    </div>
  );
}

function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
      disable: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#F6F7F1] font-sans text-[#16351F]">
      {/* Latar belakang gradien yang bergerak perlahan */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="animate-drift-a absolute -left-[15%] -top-[15%] h-[55vmax] w-[55vmax] bg-[radial-gradient(circle,#CFE4C6_0%,transparent_65%)] will-change-transform motion-reduce:animate-none" />

        <div className="animate-drift-b absolute -right-[20%] top-[15%] h-[50vmax] w-[50vmax] bg-[radial-gradient(circle,#E4F3A8_0%,transparent_65%)] will-change-transform motion-reduce:animate-none" />

        <div className="animate-drift-c absolute -bottom-[20%] left-[15%] h-[55vmax] w-[55vmax] bg-[radial-gradient(circle,#BFDCCB_0%,transparent_65%)] will-change-transform motion-reduce:animate-none" />
      </div>

      {/* Navbar kaca: di HP hanya logo + tombol, menu muncul di layar sedang ke atas */}
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        <nav
          className={`mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-white/70 py-2 pl-2 pr-2 ring-1 ring-[#16351F]/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 sm:px-4 sm:py-2.5 ${
            scrolled
              ? "bg-white/70 shadow-[0_12px_40px_-12px_rgba(22,53,31,0.3)]"
              : "bg-white/40 shadow-[0_2px_12px_rgba(22,53,31,0.04)]"
          }`}
        >
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 transition active:scale-95"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16351F] text-lg">
              🌱
            </span>

            <span className="font-display text-base font-semibold sm:text-lg">
              PlantCare AI
            </span>
          </Link>

          <div className="hidden items-center gap-1 text-sm font-medium text-[#4E6154] md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="whitespace-nowrap rounded-full px-3 py-1.5 transition hover:bg-[#16351F]/5 hover:text-[#16351F] active:scale-95 active:bg-[#16351F]/10"
              >
                {l.label}
              </a>
            ))}
          </div>

          <Link
            to="/detection"
            className="shrink-0 whitespace-nowrap rounded-full bg-[#16351F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2F6B3F] active:scale-95 sm:px-5 sm:py-2.5"
          >
            Periksa
            <span className="hidden sm:inline"> tanaman</span>
          </Link>
        </nav>
      </header>

      {/* Bagian utama / Hero: menumpuk di HP, dua kolom di layar sedang ke atas */}
      <main className="relative">
        {/* Daun 3D melayang di latar hero */}
        <FloatingLeaves />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-14 md:grid-cols-[1.1fr_0.9fr] md:gap-10 lg:gap-16 lg:pt-24">
          <div className="text-center md:text-left">
            <div data-aos="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#16351F]/10 bg-white px-3 py-1.5 text-xs text-[#4E6154] sm:px-4 sm:text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#7CB342]" />
                Gratis. Tanpa perlu daftar.
              </div>
            </div>

            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              className="mx-auto mt-5 max-w-2xl font-display text-[2rem] font-semibold leading-[1.12] tracking-tight sm:mt-7 sm:text-5xl md:mx-0 lg:text-7xl lg:leading-[1.05]"
            >
              Ada bercak di daun mangga kamu? Cari tahu artinya.
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="mx-auto mt-4 max-w-md text-base leading-7 text-[#4E6154] sm:mt-6 md:mx-0 lg:text-lg lg:leading-8"
            >
              Foto daun mangga dan PlantCare AI akan membantu mengenali
              kemungkinan kondisi daun berdasarkan pola yang dipelajari oleh
              model machine learning.
            </p>

            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center md:justify-start"
            >
              <Link
                to="/detection"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#16351F] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#16351F]/20 transition hover:bg-[#2F6B3F] active:scale-95 sm:py-4"
              >
                Periksa daun mangga
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>

              <a
                href="#cara-kerja"
                className="inline-flex items-center justify-center rounded-full border border-[#16351F]/20 px-8 py-3.5 text-base font-semibold transition hover:bg-white active:scale-95 sm:py-4"
              >
                Lihat cara kerja
              </a>
            </div>
          </div>

          <div data-aos="zoom-in" data-aos-delay="200" className="pb-4 md:pb-0">
            <Tilt3D>
              <LeafScan />
            </Tilt3D>
          </div>
        </div>
      </main>

      {/* Cara kerja: vertikal di HP, tiga kolom di layar sedang ke atas */}
      <section
        id="cara-kerja"
        className="scroll-mt-20 bg-[#16351F] px-5 py-14 text-white sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            data-aos="fade-up"
            className="max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
          >
            Tiga langkah dari daun hingga hasil.
          </h2>

          <ol className="relative mt-10 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-3">
            <div className="absolute left-[16.6%] right-[16.6%] top-6 hidden border-t border-dashed border-white/25 sm:block" />

            {steps.map((s, i) => (
              <li
                key={s.title}
                data-aos="fade-up"
                data-aos-delay={i * 150}
                className="relative flex gap-4 sm:block"
              >
                {/* Garis penghubung vertikal khusus HP */}
                {i < steps.length - 1 && (
                  <span className="absolute left-5 top-11 -bottom-8 border-l border-dashed border-white/25 sm:hidden" />
                )}

                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D7F27A] text-base font-bold text-[#16351F] sm:h-12 sm:w-12 sm:text-lg">
                  {i + 1}
                </span>

                <div>
                  <h3 className="text-lg font-semibold sm:mt-6 sm:text-xl">
                    {s.title}
                  </h3>

                  <p className="mt-1 max-w-sm text-sm leading-6 text-white/70 sm:mt-2 sm:text-base sm:leading-7">
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fitur: satu kolom di HP, grid tiga kolom di layar sedang ke atas */}
      <section id="fitur" className="scroll-mt-20 px-5 py-14 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            data-aos="fade-up"
            className="max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
          >
            Apa yang kamu dapatkan setelah setiap pemeriksaan.
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-5">
            {/* Kemungkinan kondisi */}
            <div data-aos="fade-up" className="sm:col-span-2">
              <div className="h-full rounded-3xl bg-white p-5 transition duration-300 active:scale-[0.98] sm:rounded-[1.75rem] sm:p-8 sm:hover:-translate-y-1 sm:hover:shadow-xl">
                <p className="text-sm text-[#6B7A70]">Kemungkinan kondisi</p>

                {/* Contoh hasil sebelum model ML terhubung */}
                <p className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
                  Antraknosa
                </p>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#4E6154] sm:mt-4 sm:text-base sm:leading-7">
                  Hasil akan menampilkan kemungkinan kondisi daun mangga
                  berdasarkan pola gambar yang dikenali oleh model, disertai
                  penjelasan sederhana agar lebih mudah dipahami.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs sm:mt-6 sm:text-sm">
                  {[
                    "Perubahan warna pada daun",
                    "Bercak pada permukaan daun",
                    "Pola kerusakan yang terlihat",
                  ].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#EEF3E8] px-3 py-1.5 text-[#2F6B3F] sm:px-4"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tingkat keyakinan */}
            <div data-aos="fade-up" data-aos-delay="100">
              <div className="h-full rounded-3xl bg-[#D7F27A] p-5 transition duration-300 active:scale-[0.98] sm:rounded-[1.75rem] sm:p-8 sm:hover:-translate-y-1 sm:hover:shadow-xl">
                <p className="text-sm text-[#3B4F1E]">Tingkat keyakinan model</p>

                <p className="mt-1 font-display text-5xl font-semibold sm:text-6xl">
                  87%
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#16351F]/15 sm:mt-6 sm:h-2.5">
                  <div className="h-full w-[87%] rounded-full bg-[#16351F]" />
                </div>

                <p className="mt-3 text-sm leading-6 text-[#3B4F1E] sm:mt-4">
                  Menunjukkan seberapa yakin model terhadap kelas yang
                  diprediksi. Nilai ini bukan berarti hasil pemeriksaan
                  merupakan diagnosis pasti.
                </p>
              </div>
            </div>

            {/* Ponsel */}
            <div data-aos="fade-up">
              <div className="h-full rounded-3xl border border-[#16351F]/10 bg-white/50 p-5 transition duration-300 active:scale-[0.98] sm:rounded-[1.75rem] sm:bg-transparent sm:p-8 sm:hover:-translate-y-1 sm:hover:bg-white sm:hover:shadow-xl">
                <p className="text-3xl">📱</p>

                <h3 className="mt-3 text-lg font-semibold sm:mt-4 sm:text-xl">
                  Dibuat untuk ponsel
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#4E6154] sm:text-base sm:leading-7">
                  Buka kamera langsung melalui peramban. Tidak perlu memasang
                  aplikasi tambahan.
                </p>
              </div>
            </div>

            {/* Catatan hasil */}
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="sm:col-span-2"
            >
              <div className="h-full rounded-3xl bg-[#DDEBD3] p-5 transition duration-300 active:scale-[0.98] sm:rounded-[1.75rem] sm:p-8 sm:hover:-translate-y-1 sm:hover:shadow-xl">
                <h3 className="font-display text-xl font-semibold sm:text-2xl">
                  Hasil pemeriksaan sebagai informasi awal.
                </h3>

                <p className="mt-2 max-w-lg text-sm leading-6 text-[#3F5646] sm:mt-3 sm:text-base sm:leading-7">
                  PlantCare AI memberikan kemungkinan kondisi berdasarkan satu
                  foto daun mangga. Hasil dari model sebaiknya digunakan
                  sebagai informasi awal dan bukan sebagai keputusan akhir
                  mengenai kondisi tanaman.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang + CTA */}
      <section
        id="tentang"
        className="scroll-mt-20 px-5 pb-14 sm:px-8 sm:pb-24"
      >
        <div
          data-aos="zoom-in"
          className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#16351F] px-6 py-10 text-center text-white sm:rounded-[2rem] sm:px-16 sm:py-16"
        >
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Kenali perubahan pada daun mangga hanya dari sebuah foto.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-7">
            PlantCare AI adalah proyek pembelajaran yang menggabungkan
            pengembangan web dan machine learning untuk mengenali kemungkinan
            kondisi daun mangga berdasarkan gambar.
          </p>

          <Link
            to="/detection"
            className="mt-7 inline-flex w-full justify-center rounded-full bg-[#D7F27A] px-8 py-3.5 text-base font-semibold text-[#16351F] transition hover:bg-white active:scale-95 sm:mt-9 sm:w-auto sm:py-4"
          >
            Periksa daun mangga
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        data-aos="fade"
        className="border-t border-[#16351F]/10 px-5 py-6 sm:px-8 sm:py-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 text-center text-xs text-[#6B7A70] sm:flex-row sm:justify-between sm:text-left sm:text-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#16351F]">
            <span>🌱</span> PlantCare AI
          </div>

          <p>Dibuat dengan rasa ingin tahu dan machine learning.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;