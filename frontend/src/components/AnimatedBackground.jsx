/*
 * Lapisan gradien yang bergerak pelan di belakang halaman.
 * Pakai di dalam elemen root yang punya class "relative isolate".
 * Keyframes (drift-a/b/c) ada di index.css.
 */
function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-drift-a absolute -left-[15%] -top-[15%] h-[55vmax] w-[55vmax] bg-[radial-gradient(circle,#CFE4C6_0%,transparent_65%)] will-change-transform motion-reduce:animate-none" />
      <div className="animate-drift-b absolute -right-[20%] top-[15%] h-[50vmax] w-[50vmax] bg-[radial-gradient(circle,#E4F3A8_0%,transparent_65%)] will-change-transform motion-reduce:animate-none" />
      <div className="animate-drift-c absolute -bottom-[20%] left-[15%] h-[55vmax] w-[55vmax] bg-[radial-gradient(circle,#BFDCCB_0%,transparent_65%)] will-change-transform motion-reduce:animate-none" />
    </div>
  );
}

export default AnimatedBackground;