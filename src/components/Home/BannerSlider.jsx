import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BannerSlider({
  slides = DEFAULT_SLIDES,
  height = "h-[60vh] md:h-[72vh]",
  autoPlay = true,
  autoPlayInterval = 5000,
}) {
  const [[index, direction], setIndex] = useState([0, 0]);
  const slideCount = slides.length;
  const timerRef = useRef(null);
  const [isPaused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setIndex(([prev]) => [(prev + 1) % slideCount, 1]);
    }, autoPlayInterval);

    return () => clearInterval(timerRef.current);
  }, [autoPlay, autoPlayInterval, isPaused, slideCount]);

  const paginate = (newDirection) => {
    setIndex(([prev]) => {
      let next = prev + newDirection;
      if (next < 0) next = slideCount - 1;
      if (next >= slideCount) next = 0;
      return [next, newDirection];
    });
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
      scale: 1.02,
    }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 150 : -150,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.45 },
    }),
  };

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative overflow-hidden ${height} bg-gradient-to-br from-slate-50 to-slate-100`}
      aria-label="Homepage banner slider"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        {slides.map((slide, i) =>
          i === index ? (
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 z-10">
                  <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.08 }}
                    className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-slate-900"
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.18 }}
                    className="text-lg md:text-xl text-slate-700 mb-6 max-w-xl"
                  >
                    {slide.subtitle}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28 }}
                    className="flex gap-3 flex-wrap"
                  >
                    {slide.ctaText && (
                      <a
                        href={slide.ctaHref || "#"}
                        className="inline-block bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform"
                      >
                        {slide.ctaText}
                      </a>
                    )}

                    {slide.secondary && (
                      <a
                        href={slide.secondary.href || "#"}
                        className="inline-block border border-slate-200 px-4 py-3 rounded-2xl text-slate-700 bg-white/80"
                      >
                        {slide.secondary.label}
                      </a>
                    )}
                  </motion.div>
                </div>

                <div className="md:col-span-6 flex justify-center md:justify-end">
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    whileTap={{ scale: 0.995 }}
                    className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
                    style={{ perspective: 800 }}
                  >
                    <motion.img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full object-cover block h-64 md:h-96"
                      initial={{ scale: 1.03 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      <div className="absolute inset-y-0 left-0 flex items-center pl-3 md:pl-6 z-20">
        <button
          aria-label="Previous slide"
          onClick={() => paginate(-1)}
          className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:scale-105 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center pr-3 md:pr-6 z-20">
        <button
          aria-label="Next slide"
          onClick={() => paginate(1)}
          className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:scale-105 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3 items-center">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-slate-900" : "bg-white/80"} shadow`}
          />
        ))}
      </div>
    </section>
  );
}

const DEFAULT_SLIDES = [
  {
    id: "c1",
    title: "Report a public issue in seconds",
    subtitle: "Road damage, broken streetlights, trash — report with a photo and location. Authorities get notified fast.",
    ctaText: "Report an issue",
    ctaHref: "/report",
    image: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=8a8d6e1bd0c2a3b1e7b1d8a1f2c3e4a5",
  },
  {
    id: "c2",
    title: "Track reports in your neighbourhood",
    subtitle: "See open issues, status updates from authorities, and community comments — all in one place.",
    ctaText: "View reports",
    ctaHref: "/all-issues",
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=2c3d4e5f6a7b8c9d0e1f123456789abc",
  },
  {
    id: "c3",
    title: "Make your city better — collaborate",
    subtitle: "Learn how reporting works, how issues are resolved, and how you can volunteer for quick fixes.",
    ctaText: "How it works",
    ctaHref: "/how-it-works",
    secondary: { label: "Volunteer", href: "/volunteer" },
    image: "https://images.unsplash.com/photo-1542736667-069246bdbc72?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=9f0e1d2c3b4a5f6e7d8c9b0a1e2f3d4c",
  },
];
