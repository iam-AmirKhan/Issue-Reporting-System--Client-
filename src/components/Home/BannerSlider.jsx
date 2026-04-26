import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function BannerSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const slides = DEFAULT_SLIDES;
  const slideCount = slides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = slideCount - 1;
      if (next >= slideCount) next = 0;
      return next;
    });
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 1.05
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      zIndex: 0
    })
  };

  const currentSlide = slides[index];

  return (
    <section className="relative h-[70vh] md:h-[85vh] bg-slate-900 overflow-hidden">
      {/* Background Image Layer with AnimatePresence */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
              scale: { duration: 0.8 }
            }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
            <img 
              src={currentSlide.image} 
              alt="" 
              className="w-full h-full object-cover object-center scale-110"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Layer */}
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center relative z-20">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-500/30 backdrop-blur-md"
              >
                Municipal Infrastructure Care
              </motion.span>
              <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">
                {currentSlide.title.split(' ').map((word, i) => (
                  <span key={i} className={i > 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              <p className="text-xl text-slate-300 mb-10 max-w-xl leading-relaxed font-medium">
                {currentSlide.subtitle}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to={currentSlide.ctaHref}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                >
                  {currentSlide.ctaText}
                </Link>
                <Link
                  to="/all-issues"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 transition-all transform hover:-translate-y-1"
                >
                  Explore Reports
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 right-4 lg:right-12 z-30 flex items-center gap-6">
        <div className="flex gap-2">
           {slides.map((_, i) => (
             <button
               key={i}
               onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
               className={`h-1.5 transition-all duration-300 rounded-full ${i === index ? "w-8 bg-emerald-500" : "w-4 bg-white/30"}`}
             ></button>
           ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => paginate(-1)}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => paginate(1)}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_SLIDES = [
  {
    id: "c1",
    title: "Report Public Issues in Seconds",
    subtitle: "Potholes, broken lights, or trash — snap a photo and pinpoint the location. We handle the rest.",
    ctaText: "Report Now",
    ctaHref: "/dashboard/report-issue",
    image: "https://images.unsplash.com/photo-1518384401463-d3876163cca3?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: "c2",
    title: "Track Your Local Community Progress",
    subtitle: "Stay updated on repairs in your neighborhood with real-time status updates and authority feedback.",
    ctaText: "Track Progress",
    ctaHref: "/all-issues",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: "c3",
    title: "Transform Your City Environment",
    subtitle: "Our platform bridges the gap between citizens and municipal authorities for a better future.",
    ctaText: "How It Works",
    ctaHref: "#how-it-works",
    image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=2000&auto=format&fit=crop",
  },
];
