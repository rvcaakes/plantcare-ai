import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

/*
 * Panggil sekali di setiap halaman. Sekalian scroll ke atas
 * saat pindah halaman, karena react-router tidak melakukannya otomatis.
 */
export default function useAos() {
  useEffect(() => {
    window.scrollTo(0, 0);

    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
      disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });

    const t = setTimeout(() => AOS.refresh(), 100);
    return () => clearTimeout(t);
  }, []);
}