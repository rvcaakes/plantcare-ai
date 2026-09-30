import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const labels = ["Ambil Foto", "Pratinjau", "Hasil"];

function PageHeader({ backTo = "/", backLabel = "Beranda", step = 1 }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-white/70 px-2.5 py-1.5 ring-1 ring-[#16351F]/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 sm:px-5 sm:py-2.5 ${
          scrolled
            ? "bg-white/70 shadow-[0_12px_40px_-12px_rgba(22,53,31,0.3)]"
            : "bg-white/40 shadow-[0_2px_12px_rgba(22,53,31,0.04)]"
        }`}
      >
        <Link
          to={backTo}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-[#4E6154] transition hover:bg-[#16351F]/5 hover:text-[#16351F] active:scale-95 sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          {backLabel}
        </Link>

        <ol className="flex items-center gap-1.5 text-xs font-medium text-[#6B7A70] sm:gap-2">
          {labels.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;

            return (
              <li key={label} className="flex items-center gap-1.5 sm:gap-2">
                {i > 0 && <span className="h-px w-3 bg-[#16351F]/20 sm:w-5" />}
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition ${
                    active || done ? "bg-[#16351F] text-white" : "border border-[#16351F]/25"
                  }`}
                >
                  {done ? "✓" : n}
                </span>
                <span
                  className={`${active ? "inline text-[#16351F]" : "hidden sm:inline"}`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}

export default PageHeader;