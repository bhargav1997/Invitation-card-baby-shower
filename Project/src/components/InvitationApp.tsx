"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import {
   Calendar,
   MapPin,
   Clock,
   Heart,
   Send,
   ChevronDown,
   Share2,
   CheckCircle2,
   X,
   Baby,
   Sparkles,
   Gift,
   UtensilsCrossed,
   Laugh,
   Gamepad2,
   Phone,
} from "lucide-react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// Palette
// ─────────────────────────────────────────
const C = {
   blush: "#F2B5C0",
   rose: "#D4778A",
   deepRose: "#A85070",
   gold: "#C9943A",
   champagne: "#F0D9A8",
   ivory: "#FDF8F3",
   ivoryDark: "#F5EDE2",
   mauve: "#8B5E6A",
   sage: "#7A9E7E",
   charcoal: "#3D2B32",
   white: "#FFFFFF",
};

const PETAL_SHAPES = [
   "M10,0 C14,3 16,8 12,14 C8,20 2,18 0,12 C-2,6 4,0 10,0",
   "M8,0 C14,2 18,10 14,16 C10,22 2,20 0,14 C-2,8 2,0 8,0",
   "M12,0 C18,4 20,12 16,18 C12,24 4,22 2,16 C0,10 6,0 12,0",
];

type FloatingEl = { left: string; duration: number; delay: number; shape: number; size: number; color: string };

// ─────────────────────────────────────────
// Scroll Progress Bar
// ─────────────────────────────────────────
const ScrollProgress = () => {
   const { scrollYProgress } = useScroll();
   const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
   return (
      <motion.div
         className='fixed top-0 left-0 right-0 h-[3px] z-[9998] origin-left'
         style={{
            scaleX,
            background: `linear-gradient(90deg, ${C.blush}, ${C.rose}, ${C.gold})`,
         }}
      />
   );
};

// ─────────────────────────────────────────
// Section Nav Dots
// ─────────────────────────────────────────
const SECTIONS = ["hero", "welcome", "save-the-date", "what-to-expect", "venue", "rsvp"];
const SectionNav = () => {
   const [active, setActive] = useState("hero");

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((e) => {
               if (e.isIntersecting) setActive(e.target.id);
            });
         },
         { threshold: 0.4 },
      );
      SECTIONS.forEach((id) => {
         const el = document.getElementById(id);
         if (el) observer.observe(el);
      });
      return () => observer.disconnect();
   }, []);

   const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

   return (
      <div className='fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3'>
         {SECTIONS.map((id) => (
            <button
               key={id}
               onClick={() => scrollTo(id)}
               aria-label={`Go to ${id}`}
               className='w-2 h-2 rounded-full transition-all duration-300'
               style={{
                  background: active === id ? C.rose : `${C.blush}66`,
                  transform: active === id ? "scale(1.7)" : "scale(1)",
                  boxShadow: active === id ? `0 0 10px ${C.rose}88` : "none",
               }}
            />
         ))}
      </div>
   );
};

// ─────────────────────────────────────────
// Wave Divider
// ─────────────────────────────────────────
const WaveDivider = ({ from, to, flip = false }: { from: string; to: string; flip?: boolean }) => (
   <div className={cn("relative w-full overflow-hidden leading-none -mt-px", flip && "rotate-180")}>
      <svg viewBox='0 0 1440 80' preserveAspectRatio='none' className='w-full h-16 md:h-20' style={{ display: "block" }}>
         <path d='M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z' fill={to} />
      </svg>
   </div>
);

// ─────────────────────────────────────────
// Hero Sparkles
// ─────────────────────────────────────────
type Sparkle = { id: number; x: number; y: number; size: number; delay: number };
const HeroSparkles = () => {
   const [sparkles, setSparkles] = useState<Sparkle[]>([]);
   useEffect(() => {
      setSparkles(
         [...Array(18)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 4 + Math.random() * 8,
            delay: Math.random() * 3,
         })),
      );
   }, []);
   return (
      <div className='absolute inset-0 pointer-events-none z-10'>
         {sparkles.map((s) => (
            <motion.div
               key={s.id}
               className='absolute'
               style={{ left: `${s.x}%`, top: `${s.y}%` }}
               animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
               transition={{ duration: 2.5 + Math.random(), repeat: Infinity, delay: s.delay, ease: "easeInOut" }}>
               <svg width={s.size} height={s.size} viewBox='0 0 24 24' fill={C.champagne}>
                  <path d='M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z' opacity='0.7' />
               </svg>
            </motion.div>
         ))}
      </div>
   );
};

// ─────────────────────────────────────────
// Custom Cursor
// ─────────────────────────────────────────
const CustomCursor = () => {
   const cursorX = useMotionValue(-100);
   const cursorY = useMotionValue(-100);
   const [isPointer, setIsPointer] = useState(false);
   const springCfg = { damping: 22, stiffness: 350, mass: 0.4 };
   const springX = useSpring(cursorX, springCfg);
   const springY = useSpring(cursorY, springCfg);

   useEffect(() => {
      const onMove = (e: MouseEvent) => {
         cursorX.set(e.clientX - 12);
         cursorY.set(e.clientY - 12);
         setIsPointer(window.getComputedStyle(e.target as HTMLElement).cursor === "pointer");
      };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
   }, [cursorX, cursorY]);

   return (
      <motion.div
         className='fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block'
         style={{ x: springX, y: springY }}
         animate={{ scale: isPointer ? 1.8 : 1 }}
         transition={{ type: "spring", stiffness: 400, damping: 20 }}>
         <div
            className='w-6 h-6 rounded-full border-2 mix-blend-multiply'
            style={{ borderColor: C.rose, backgroundColor: isPointer ? `${C.blush}66` : "transparent" }}
         />
      </motion.div>
   );
};

// ─────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────
const Countdown = () => {
   const target = new Date("June 21, 2026 16:00:00").getTime();
   const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

   useEffect(() => {
      const tick = () => {
         const diff = target - Date.now();
         if (diff <= 0) return;
         setTime({
            days: Math.floor(diff / 86_400_000),
            hours: Math.floor((diff % 86_400_000) / 3_600_000),
            mins: Math.floor((diff % 3_600_000) / 60_000),
            secs: Math.floor((diff % 60_000) / 1000),
         });
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
   }, [target]);

   const labels = ["Days", "Hours", "Mins", "Secs"];
   const values = [time.days, time.hours, time.mins, time.secs];

   return (
      <div className='flex gap-3 md:gap-5 justify-center mt-10'>
         {labels.map((label, i) => (
            <motion.div
               key={label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 2.2 + i * 0.12 }}
               className='flex flex-col items-center'>
               <div
                  className='w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl shadow-lg relative overflow-hidden'
                  style={{
                     background: "rgba(255,255,255,0.18)",
                     backdropFilter: "blur(16px)",
                     border: "1.5px solid rgba(255,255,255,0.45)",
                  }}>
                  <div
                     className='absolute inset-0'
                     style={{ background: "linear-gradient(135deg,rgba(242,181,192,0.25),rgba(201,148,58,0.1))" }}
                  />
                  <AnimatePresence mode='popLayout'>
                     <motion.span
                        key={values[i]}
                        initial={{ y: -18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 18, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className='relative z-10 text-2xl md:text-3xl font-bold tabular-nums'
                        style={{ color: C.white, fontFamily: "var(--font-playfair)" }}>
                        {String(values[i]).padStart(2, "0")}
                     </motion.span>
                  </AnimatePresence>
               </div>
               <span className='mt-2 text-[10px] uppercase tracking-widest font-semibold' style={{ color: "rgba(255,255,255,0.75)" }}>
                  {label}
               </span>
            </motion.div>
         ))}
      </div>
   );
};

// ─────────────────────────────────────────
// RSVP Modal
// ─────────────────────────────────────────
const RSVPModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
   const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [form, setForm] = useState({ name: "", guests: "1", phone: "", attending: "Yes" });

   const validate = () => {
      const e: Record<string, string> = {};
      if (!form.name.trim()) e.name = "Please enter your name";
      if (form.phone && !/^\+?[\d\s\-]{10,}$/.test(form.phone)) e.phone = "Please enter a valid phone number";
      setErrors(e);
      return Object.keys(e).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setStatus("submitting");
      try {
         const url = "https://script.google.com/macros/s/AKfycbxU1kCTp3HHBB14Zm9eWWMY5B47OTJyOGkdDNXilvxrwX1fRuCp_5hS5FEIWDq5zXUqWQ/exec";
         const params = new URLSearchParams(form as Record<string, string>);
         await fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
         });
         confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 }, colors: [C.blush, C.champagne, C.gold, "#fff", C.rose] });
         setStatus("success");
      } catch {
         setStatus("error");
      }
   };

   const inputCls = (field: string) =>
      cn(
         "w-full px-4 py-3 rounded-xl text-sm transition-all outline-none",
         "bg-white/70 backdrop-blur-sm",
         errors[field]
            ? "border-2 border-red-300 ring-1 ring-red-100"
            : "border border-rose-100 focus:border-rose-300 focus:ring-2 focus:ring-rose-100",
      );

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className='fixed inset-0 z-50 flex items-center justify-center p-4'
               style={{ background: "rgba(61,43,50,0.55)", backdropFilter: "blur(10px)" }}
               onClick={(e) => e.target === e.currentTarget && onClose()}>
               <motion.div
                  initial={{ scale: 0.88, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.88, opacity: 0, y: 30 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className='relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl'
                  style={{ background: C.ivory }}>
                  <div
                     className='h-2 w-full'
                     style={{ background: `linear-gradient(90deg, ${C.blush}, ${C.gold}, ${C.rose}, ${C.blush})` }}
                  />
                  <div className='p-8'>
                     <button
                        onClick={onClose}
                        className='absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110'
                        style={{ background: C.ivoryDark }}>
                        <X size={16} style={{ color: C.mauve }} />
                     </button>

                     {status === "success" ? (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className='text-center py-8'>
                           <motion.div
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className='w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6'
                              style={{ background: `${C.blush}33` }}>
                              <CheckCircle2 size={40} style={{ color: C.rose }} />
                           </motion.div>
                           <h3 className='text-4xl mb-2' style={{ fontFamily: "var(--font-dancing)", color: C.deepRose }}>
                              We can&apos;t wait!
                           </h3>
                           <p className='text-sm leading-relaxed' style={{ color: C.mauve }}>
                              Your RSVP is confirmed. We&apos;re absolutely thrilled to celebrate with you! 🌸
                           </p>
                           <button
                              onClick={onClose}
                              className='mt-8 px-10 py-3 rounded-full text-white text-sm font-semibold shadow-lg transition-all active:scale-95'
                              style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.deepRose})` }}>
                              Close
                           </button>
                        </motion.div>
                     ) : (
                        <>
                           <div className='flex items-center gap-3 mb-1'>
                              <Baby size={22} style={{ color: C.rose }} />
                              <h2 className='text-4xl' style={{ fontFamily: "var(--font-dancing)", color: C.deepRose }}>
                                 RSVP
                              </h2>
                           </div>
                           <p className='text-sm mb-6' style={{ color: C.mauve }}>
                              Let us know if you can join our little one&apos;s celebration!
                           </p>
                           <form onSubmit={handleSubmit} className='space-y-4'>
                              <div>
                                 <label className='block text-xs font-semibold uppercase tracking-wider mb-1' style={{ color: C.mauve }}>
                                    Your Name *
                                 </label>
                                 <input
                                    required
                                    type='text'
                                    placeholder='e.g. Priya Sharma'
                                    className={inputCls("name")}
                                    value={form.name}
                                    onChange={(e) => {
                                       setForm({ ...form, name: e.target.value });
                                       if (errors.name) setErrors({ ...errors, name: "" });
                                    }}
                                 />
                                 {errors.name && <p className='text-red-400 text-xs mt-1'>{errors.name}</p>}
                              </div>
                              <div className='grid grid-cols-2 gap-3'>
                                 <div>
                                    <label className='block text-xs font-semibold uppercase tracking-wider mb-1' style={{ color: C.mauve }}>
                                       Guests
                                    </label>
                                    <select
                                       className={inputCls("")}
                                       value={form.guests}
                                       onChange={(e) => setForm({ ...form, guests: e.target.value })}>
                                       {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                          <option key={n}>{n}</option>
                                       ))}
                                    </select>
                                 </div>
                                 <div>
                                    <label className='block text-xs font-semibold uppercase tracking-wider mb-1' style={{ color: C.mauve }}>
                                       Attending?
                                    </label>
                                    <select
                                       className={inputCls("")}
                                       value={form.attending}
                                       onChange={(e) => setForm({ ...form, attending: e.target.value })}>
                                       <option value='Yes'>Yes, gladly! 🎉</option>
                                       <option value='No'>Sadly, no 😢</option>
                                    </select>
                                 </div>
                              </div>
                              <div>
                                 <label className='block text-xs font-semibold uppercase tracking-wider mb-1' style={{ color: C.mauve }}>
                                    Phone <span className='normal-case font-normal opacity-60'>(optional)</span>
                                 </label>
                                 <input
                                    type='tel'
                                    placeholder='+1 (639) 000-0000'
                                    className={inputCls("phone")}
                                    value={form.phone}
                                    onChange={(e) => {
                                       setForm({ ...form, phone: e.target.value });
                                       if (errors.phone) setErrors({ ...errors, phone: "" });
                                    }}
                                 />
                                 {errors.phone && <p className='text-red-400 text-xs mt-1'>{errors.phone}</p>}
                              </div>
                              <motion.button
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.97 }}
                                 disabled={status === "submitting"}
                                 type='submit'
                                 className='w-full py-4 rounded-xl text-white font-semibold text-base shadow-lg flex items-center justify-center gap-2 mt-2 transition-all'
                                 style={{
                                    background:
                                       status === "submitting" ? `${C.rose}99` : `linear-gradient(135deg, ${C.rose}, ${C.deepRose})`,
                                 }}>
                                 {status === "submitting" ? (
                                    <>
                                       <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                       Saving...
                                    </>
                                 ) : (
                                    <>
                                       Confirm RSVP <Send size={16} />
                                    </>
                                 )}
                              </motion.button>
                              {status === "error" && (
                                 <p className='text-red-400 text-center text-sm'>Something went wrong — please try again.</p>
                              )}
                           </form>
                        </>
                     )}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

// ─────────────────────────────────────────
// Floral Divider
// ─────────────────────────────────────────
const FloralDivider = () => (
   <div className='flex items-center justify-center gap-4 my-2'>
      <div className='h-px flex-1 opacity-20' style={{ background: C.gold }} />
      <svg width='36' height='24' viewBox='0 0 36 24' fill='none' className='opacity-40'>
         <path d='M18 12 C14 6 6 4 2 8 C6 8 10 10 12 14 C10 10 6 8 2 8' stroke={C.gold} strokeWidth='1' fill='none' />
         <path d='M18 12 C22 6 30 4 34 8 C30 8 26 10 24 14 C26 10 30 8 34 8' stroke={C.gold} strokeWidth='1' fill='none' />
         <circle cx='18' cy='12' r='3' fill={C.rose} fillOpacity='0.5' />
      </svg>
      <div className='h-px flex-1 opacity-20' style={{ background: C.gold }} />
   </div>
);

// ─────────────────────────────────────────
// Info Card
// ─────────────────────────────────────────
const InfoCard = ({ icon, title, sub, delay = 0 }: { icon: React.ReactNode; title: string; sub: string; delay?: number }) => (
   <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(212,119,138,0.15)" }}
      className='flex flex-col items-center gap-3 p-8 rounded-3xl transition-all cursor-default'
      style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(18px)", border: "1.5px solid rgba(242,181,192,0.3)" }}>
      <div className='w-14 h-14 rounded-2xl flex items-center justify-center' style={{ background: `${C.blush}22` }}>
         {icon}
      </div>
      <p className='text-xl font-semibold' style={{ fontFamily: "var(--font-playfair)", color: C.charcoal }}>
         {title}
      </p>
      <p className='text-sm uppercase tracking-widest opacity-60' style={{ color: C.mauve }}>
         {sub}
      </p>
   </motion.div>
);

// ─────────────────────────────────────────
// What to Expect Card
// ─────────────────────────────────────────
const ExpectCard = ({ icon, title, desc, delay = 0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) => (
   <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, boxShadow: "0 30px 70px rgba(212,119,138,0.18)" }}
      className='flex flex-col items-center text-center gap-4 p-8 rounded-3xl transition-all cursor-default'
      style={{
         background: "rgba(255,255,255,0.7)",
         backdropFilter: "blur(20px)",
         border: "1.5px solid rgba(242,181,192,0.25)",
      }}>
      <motion.div
         animate={{ rotate: [0, 6, -6, 0] }}
         transition={{ duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
         className='w-16 h-16 rounded-2xl flex items-center justify-center shadow-md'
         style={{ background: `linear-gradient(135deg, ${C.blush}44, ${C.champagne}44)` }}>
         {icon}
      </motion.div>
      <div>
         <p className='text-lg font-bold mb-1' style={{ fontFamily: "var(--font-playfair)", color: C.charcoal }}>
            {title}
         </p>
         <p className='text-sm leading-relaxed' style={{ color: C.mauve }}>
            {desc}
         </p>
      </div>
   </motion.div>
);

// ─────────────────────────────────────────
// Floating Hearts
// ─────────────────────────────────────────
const FloatingHearts = () => {
   const [hearts, setHearts] = useState<{ x: number; y: number; id: number }[]>([]);
   const counter = useRef(0);
   const spawnHeart = useCallback((clientX: number, clientY: number) => {
      const id = ++counter.current;
      setHearts((h) => [...h, { x: clientX, y: clientY, id }]);
      setTimeout(() => setHearts((h) => h.filter((h) => h.id !== id)), 1800);
   }, []);
   useEffect(() => {
      const handle = (e: MouseEvent) => {
         if (Math.random() > 0.85) spawnHeart(e.clientX, e.clientY);
      };
      window.addEventListener("mousemove", handle);
      return () => window.removeEventListener("mousemove", handle);
   }, [spawnHeart]);
   return (
      <div className='fixed inset-0 pointer-events-none z-[999]'>
         <AnimatePresence>
            {hearts.map(({ x, y, id }) => (
               <motion.div
                  key={id}
                  initial={{ x: x - 8, y: y - 8, scale: 0, opacity: 1 }}
                  animate={{ y: y - 80, scale: 1, opacity: 0 }}
                  exit={{}}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                  className='absolute'
                  style={{ left: 0, top: 0 }}>
                  <Heart size={16} style={{ color: C.rose }} fill={C.rose} />
               </motion.div>
            ))}
         </AnimatePresence>
      </div>
   );
};

// ─────────────────────────────────────────
// Main App
// ─────────────────────────────────────────
export default function InvitationApp() {
   const [mounted, setMounted] = useState(false);
   const [isRSVPOpen, setIsRSVPOpen] = useState(false);
   const [petals, setPetals] = useState<FloatingEl[]>([]);

   const { scrollYProgress } = useScroll();
   const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
   const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.92]);

   useEffect(() => {
      setMounted(true);
      setPetals(
         [...Array(20)].map((_, i) => ({
            left: `${Math.random() * 100}%`,
            duration: 14 + Math.random() * 14,
            delay: Math.random() * 25,
            shape: i % PETAL_SHAPES.length,
            size: 10 + Math.random() * 14,
            color: [C.blush, C.champagne, "#FFC0CB", "#FFCDD2", "#FFB7C5"][i % 5],
         })),
      );
   }, []);

   const share = () => {
      if (navigator.share) {
         navigator
            .share({ title: "Baby Shower — Vaibhav & Khyati", text: "You're invited! 🌸", url: window.location.href })
            .catch(() => {});
      } else {
         navigator.clipboard.writeText(window.location.href);
      }
   };

   // Staggered hero words
   const heroWords = ["Baby", "Shower"];

   return (
      <main className='relative overflow-x-hidden cursor-none' style={{ background: C.ivory, color: C.charcoal }}>
         <ScrollProgress />
         {mounted && <CustomCursor />}
         {mounted && <FloatingHearts />}
         {mounted && <SectionNav />}

         {/* Floating Petals */}
         <div className='fixed inset-0 pointer-events-none overflow-hidden z-10'>
            {mounted &&
               petals.map((p, i) => (
                  <motion.div
                     key={i}
                     initial={{ top: "-6%", left: p.left, opacity: 0, rotate: 0, x: 0 }}
                     animate={{ top: "108%", opacity: [0, 0.85, 0.6, 0], rotate: 360, x: Math.sin(i * 0.9) * 80 }}
                     transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
                     className='absolute'>
                     <svg width={p.size} height={p.size * 1.4} viewBox='0 0 16 22' fill={p.color} opacity='0.85'>
                        <path d={PETAL_SHAPES[p.shape]} />
                     </svg>
                  </motion.div>
               ))}
         </div>

         {/* Share Button */}
         <motion.button
            id='share-btn'
            aria-label='Share invitation'
            onClick={share}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className='fixed bottom-6 right-6 z-40 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl'
            style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.deepRose})` }}>
            <Share2 size={22} color='#fff' />
         </motion.button>

         {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
         <section id='hero' className='relative min-h-screen flex flex-col items-center justify-center overflow-hidden'>
            <div className='absolute inset-0 z-0'>
               <Image
                  src='/assets/hero_bg_new.png'
                  alt='Floral background'
                  fill
                  priority
                  sizes='100vw'
                  className='object-cover object-center'
               />
               <div
                  className='absolute inset-0'
                  style={{
                     background: "linear-gradient(to bottom, rgba(61,43,50,0.2) 0%, rgba(61,43,50,0.5) 55%, rgba(61,43,50,0.8) 100%)",
                  }}
               />
            </div>

            {mounted && <HeroSparkles />}

            <motion.div
               style={{ opacity: heroOpacity, scale: heroScale }}
               className='relative z-20 text-center px-6 py-24 max-w-3xl mx-auto'>
               {/* Eyebrow */}
               <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className='flex items-center justify-center gap-3 mb-8'>
                  <div className='h-px w-10 opacity-50' style={{ background: C.champagne }} />
                  <Sparkles size={14} style={{ color: C.champagne }} />
                  <span className='text-xs uppercase tracking-[0.35em] font-semibold' style={{ color: C.champagne }}>
                     You&apos;re warmly invited
                  </span>
                  <Sparkles size={14} style={{ color: C.champagne }} />
                  <div className='h-px w-10 opacity-50' style={{ background: C.champagne }} />
               </motion.div>

               {/* Feature Image */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                  className='mb-8 relative w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full overflow-hidden shadow-[0_0_50px_rgba(201,148,58,0.3)] border-4 border-white/20'>
                  <Image
                     src='/assets/krishna_radha.png'
                     alt='Bal Krishna and Radha'
                     fill
                     className='object-cover'
                     sizes='(max-width: 768px) 256px, 320px'
                  />
                  {/* Soft glow behind */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none' />
               </motion.div>

               {/* Staggered headline words */}
               <h1 className='block leading-none mb-4' style={{ fontFamily: "var(--font-dancing)", fontSize: "clamp(4rem, 12vw, 8rem)" }}>
                  {heroWords.map((word, wi) => (
                     <motion.span
                        key={word}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + wi * 0.35, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className='inline-block mr-4 last:mr-0'
                        style={{ color: "#fff", textShadow: "0 4px 32px rgba(0,0,0,0.35)" }}>
                        {word}
                     </motion.span>
                  ))}
               </h1>

               {/* Names */}
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7, duration: 1 }}
                  className='flex items-center justify-center gap-4 mb-3'>
                  <div className='h-px flex-1 max-w-[60px] opacity-40' style={{ background: "#fff" }} />
                  <h2
                     className='text-2xl md:text-4xl font-bold'
                     style={{
                        fontFamily: "var(--font-playfair)",
                        background: `linear-gradient(90deg, ${C.champagne}, #fff, ${C.champagne})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                     }}>
                     Vaibhav &amp; Khyati
                  </h2>
                  <div className='h-px flex-1 max-w-[60px] opacity-40' style={{ background: "#fff" }} />
               </motion.div>

               <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                  className='text-sm italic mb-0'
                  style={{ color: "rgba(255,255,255,0.7)" }}>
                  are expecting a little miracle ✨
               </motion.p>

               <Countdown />
            </motion.div>

            <motion.div
               className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 cursor-pointer'
               onClick={() => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" })}
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 2.5, repeat: Infinity }}>
               <span className='text-[11px] uppercase font-bold tracking-[0.4em]' style={{ color: C.white }}>
                  Scroll To Bottom
               </span>
               <ChevronDown size={22} style={{ color: C.white }} strokeWidth={3} />
            </motion.div>
         </section>

         <WaveDivider from='transparent' to={C.ivory} />

         {/* ══════════════════════════════════════
          WELCOME
      ══════════════════════════════════════ */}
         <section id='welcome' className='relative py-24 px-6 overflow-hidden' style={{ background: C.ivory }}>
            <div
               className='absolute top-0 left-0 w-64 h-64 opacity-15 pointer-events-none'
               style={{ background: `radial-gradient(circle at top left, ${C.blush}, transparent 70%)` }}
            />
            <div
               className='absolute bottom-0 right-0 w-64 h-64 opacity-15 pointer-events-none'
               style={{ background: `radial-gradient(circle at bottom right, ${C.champagne}, transparent 70%)` }}
            />

            <div className='max-w-2xl mx-auto text-center relative z-10'>
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9 }}>
                  <motion.div
                     animate={{ scale: [1, 1.12, 1] }}
                     transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                     className='inline-block mb-6'>
                     <Heart size={32} style={{ color: C.rose }} fill={C.rose} className='opacity-85' />
                  </motion.div>
                  <h2 className='text-5xl md:text-6xl mb-6 leading-tight' style={{ fontFamily: "var(--font-dancing)", color: C.deepRose }}>
                     A New Little Star
                     <br />
                     is on the Way!
                  </h2>
                  <FloralDivider />

                  {/* Pull-quote block */}
                  <div className='relative mt-10 mb-6 px-6 md:px-10'>
                     <span
                        className='absolute -top-4 left-0 text-7xl leading-none opacity-15 select-none'
                        style={{ fontFamily: "Georgia,serif", color: C.deepRose }}>
                        &ldquo;
                     </span>
                     <p className='text-lg md:text-xl leading-relaxed' style={{ color: C.mauve }}>
                        With hearts overflowing with joy, Vaibhav &amp; Khyati invite you to be part of this beautiful chapter — a baby
                        shower filled with love, laughter, and warmth that will last a lifetime.
                     </p>
                     <span
                        className='absolute -bottom-6 right-0 text-7xl leading-none opacity-15 select-none'
                        style={{ fontFamily: "Georgia,serif", color: C.deepRose }}>
                        &rdquo;
                     </span>
                  </div>

                  <p className='mt-10 text-base leading-relaxed italic opacity-75' style={{ color: C.mauve }}>
                     Your presence would make this day truly magical. 🌸
                  </p>
               </motion.div>
            </div>
         </section>

         <WaveDivider from={C.ivory} to='#FFF0F3' />

         {/* ══════════════════════════════════════
          SAVE THE DATE
      ══════════════════════════════════════ */}
         <section id='save-the-date' className='relative py-24 px-6 overflow-hidden' style={{ background: "#FFF0F3" }}>
            <div
               className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none'
               style={{ background: `radial-gradient(circle, ${C.blush}20, transparent 70%)` }}
            />

            <div className='max-w-5xl mx-auto relative z-10'>
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className='text-center mb-14'>
                  <span className='text-xs uppercase tracking-[0.3em] font-semibold' style={{ color: C.rose }}>
                     Mark your calendar
                  </span>
                  <h2 className='text-5xl md:text-6xl mt-3' style={{ fontFamily: "var(--font-playfair)", color: C.charcoal }}>
                     Save the Date
                  </h2>
                  <FloralDivider />
               </motion.div>

               <div className='grid md:grid-cols-3 gap-6 items-center'>
                  <InfoCard icon={<Calendar size={26} style={{ color: C.rose }} />} title='June 21, 2026' sub='Sunday' delay={0} />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.85 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.9, delay: 0.2 }}
                     className='flex flex-col items-center justify-center py-10'>
                     <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
                        <Baby size={58} style={{ color: C.rose }} />
                     </motion.div>
                     <p className='mt-4 text-6xl' style={{ fontFamily: "var(--font-dancing)", color: C.deepRose }}>
                        Sunday
                     </p>
                     <p className='mt-2 text-xs uppercase tracking-widest opacity-60' style={{ color: C.mauve }}>
                        A day to remember
                     </p>
                  </motion.div>
                  <InfoCard
                     icon={<Clock size={26} style={{ color: C.rose }} />}
                     title='4:00 PM onwards'
                     sub='Regina Time (CST)'
                     delay={0.1}
                  />
               </div>
            </div>
         </section>

         <WaveDivider from='#FFF0F3' to={C.ivoryDark} />

         {/* ══════════════════════════════════════
          WHAT TO EXPECT
      ══════════════════════════════════════ */}
         <section id='what-to-expect' className='relative py-24 px-6 overflow-hidden' style={{ background: C.ivoryDark }}>
            <div className='max-w-5xl mx-auto'>
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className='text-center mb-14'>
                  <span className='text-xs uppercase tracking-[0.3em] font-semibold' style={{ color: C.rose }}>
                     Celebrations await
                  </span>
                  <h2 className='text-5xl md:text-6xl mt-3' style={{ fontFamily: "var(--font-playfair)", color: C.charcoal }}>
                     What to Expect
                  </h2>
                  <FloralDivider />
                  <p className='mt-4 text-base' style={{ color: C.mauve }}>
                     An afternoon full of joy, warmth, and unforgettable moments.
                  </p>
               </motion.div>

               <div className='grid grid-cols-2 md:grid-cols-4 gap-5'>
                  <ExpectCard
                     icon={<Gamepad2 size={30} style={{ color: C.rose }} />}
                     title='Fun & Games'
                     desc="Delightful baby shower games that'll have everyone laughing!"
                     delay={0}
                  />
                  <ExpectCard
                     icon={<UtensilsCrossed size={30} style={{ color: C.gold }} />}
                     title='Delicious Food'
                     desc='Indulge in a lovingly curated spread of sweet & savory treats.'
                     delay={0.1}
                  />
                  <ExpectCard
                     icon={<Gift size={30} style={{ color: C.deepRose }} />}
                     title='Memory Jar'
                     desc='Write your warmest wishes & funniest predictions — sealed in a keepsake jar for the little one.'
                     delay={0.2}
                  />
                  <ExpectCard
                     icon={<Laugh size={30} style={{ color: C.sage }} />}
                     title='Golden Memories'
                     desc="Moments you'll treasure forever, captured in love."
                     delay={0.3}
                  />
               </div>
            </div>
         </section>

         <WaveDivider from={C.ivoryDark} to={C.ivory} />

         {/* ══════════════════════════════════════
          VENUE
      ══════════════════════════════════════ */}
         <section id='venue' className='relative py-24 px-6 overflow-hidden' style={{ background: C.ivory }}>
            <div className='max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center'>
               <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className='relative rounded-[2.5rem] overflow-hidden shadow-2xl'
                  style={{ height: 480, border: `6px solid rgba(255,255,255,0.8)` }}>
                  <Image
                     src='/assets/celebration.png'
                     alt='South Leisure Neighbourhood Centre'
                     fill
                     sizes='(max-width: 768px) 100vw, 50vw'
                     className='object-cover transition-transform duration-1000 hover:scale-105'
                  />
                  <div
                     className='absolute inset-0'
                     style={{ background: "linear-gradient(to top, rgba(61,43,50,0.65) 0%, transparent 55%)" }}
                  />
                  <div className='absolute bottom-8 left-8 text-white'>
                     <p className='text-xs uppercase tracking-widest opacity-70 mb-1'>Venue</p>
                     <p className='text-2xl' style={{ fontFamily: "var(--font-playfair)" }}>
                        South Leisure Centre
                     </p>
                  </div>
               </motion.div>

               <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}>
                  <div className='flex items-center gap-2 mb-4'>
                     <MapPin size={18} style={{ color: C.rose }} />
                     <span className='text-xs uppercase tracking-[0.25em] font-semibold' style={{ color: C.rose }}>
                        Location Details
                     </span>
                  </div>
                  <h2 className='text-4xl md:text-5xl leading-tight mb-6' style={{ fontFamily: "var(--font-playfair)", color: C.charcoal }}>
                     South Leisure
                     <br />
                     <span style={{ color: C.rose }}>Neighbourhood Centre</span>
                  </h2>
                  <FloralDivider />
                  <p className='mt-6 mb-4 text-lg leading-relaxed' style={{ color: C.mauve }}>
                     170 Sunset Dr, Regina, SK S4S 2X5
                     <br />
                     Saskatchewan, Canada
                  </p>
                  <p className='text-sm mb-8 leading-relaxed' style={{ color: `${C.mauve}99` }}>
                     Come fill the room with your laughter and warm wishes. The venue is easily accessible and parking is available on-site.
                     We look forward to welcoming you!
                  </p>
                  <motion.a
                     whileHover={{ scale: 1.04, boxShadow: "0 14px 40px rgba(212,119,138,0.35)" }}
                     whileTap={{ scale: 0.97 }}
                     href='https://www.google.com/maps/dir/?api=1&destination=170+Sunset+Dr+Regina+SK+S4S+2X5'
                     target='_blank'
                     rel='noopener noreferrer'
                     id='maps-link'
                     className='inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold shadow-lg transition-all'
                     style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.deepRose})` }}>
                     Open in Google Maps <Send size={16} className='rotate-45' />
                  </motion.a>
               </motion.div>
            </div>
         </section>

         <WaveDivider from={C.ivory} to='#FFF0F3' />

         {/* ══════════════════════════════════════
          RSVP
      ══════════════════════════════════════ */}
         <section id='rsvp' className='relative py-32 px-6 text-center overflow-hidden' style={{ background: "#FFF0F3" }}>
            {/* Pulsing rings */}
            {[...Array(3)].map((_, i) => (
               <motion.div
                  key={i}
                  className='absolute rounded-full pointer-events-none'
                  animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 5 + i * 2, repeat: Infinity, delay: i * 1.5 }}
                  style={{
                     width: 300 + i * 160,
                     height: 300 + i * 160,
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%,-50%)",
                     border: `1.5px solid ${C.rose}`,
                  }}
               />
            ))}

            <div className='relative z-10 max-w-2xl mx-auto'>
               <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9 }}>
                  {/* Tilt card */}
                  <motion.div
                     className='relative w-62 mx-auto mb-10 rounded-2xl overflow-hidden shadow-2xl'
                     whileHover={{ rotateY: 8, rotateX: -4, scale: 1.04, boxShadow: "0 30px 80px rgba(168,80,112,0.3)" }}
                     transition={{ type: "spring", stiffness: 200, damping: 20 }}
                     style={{ border: `4px solid rgba(255,255,255,0.8)`, transformStyle: "preserve-3d", perspective: 600 }}>
                     <Image src='/assets/2.png' alt='Invitation card' width={450} height={500} className='w-full h-auto' />
                     <div
                        className='absolute inset-0'
                        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), transparent)" }}
                     />
                  </motion.div>

                  <h2 className='text-5xl md:text-6xl mb-4' style={{ fontFamily: "var(--font-dancing)", color: C.deepRose }}>
                     Join Our Celebration!
                  </h2>
                  <FloralDivider />

                  <p className='mt-6 mb-2 text-lg leading-relaxed' style={{ color: C.mauve }}>
                     Your presence is the greatest gift. We would be honoured to have you by our side as we welcome our little one into the
                     world.
                  </p>
                  <p className='mb-10 italic text-sm opacity-70' style={{ color: C.mauve }}>
                     Please RSVP by <strong>June 14, 2026</strong> so we can prepare for you.
                  </p>

                  <motion.button
                     id='rsvp-btn'
                     whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(212,119,138,0.45)" }}
                     whileTap={{ scale: 0.97 }}
                     onClick={() => setIsRSVPOpen(true)}
                     className='px-14 py-5 rounded-full text-white font-bold text-xl shadow-xl flex items-center gap-3 mx-auto transition-all'
                     style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.deepRose})` }}>
                     <Heart size={20} fill='white' color='white' />
                     Confirm Your RSVP
                  </motion.button>

                  <div className='mt-10 pt-8' style={{ borderTop: `1px solid ${C.blush}55` }}>
                     <p className='text-sm flex items-center justify-center gap-2' style={{ color: `${C.mauve}88` }}>
                        <Phone size={12} /> For any queries or warm wishes
                     </p>
                     <a
                        href='tel:+16393828797'
                        className='text-base font-semibold mt-1 inline-block transition-all hover:underline'
                        style={{ color: C.deepRose }}>
                        +1 (639) 382-8797
                     </a>
                  </div>
               </motion.div>
            </div>
         </section>

         {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
         <footer className='py-14 text-center relative overflow-hidden' style={{ background: C.charcoal }}>
            <div
               className='absolute inset-0 opacity-5'
               style={{
                  backgroundImage: `radial-gradient(${C.blush} 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
               }}
            />
            {/* Soft top glow */}
            <div
               className='absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px'
               style={{ background: `linear-gradient(90deg, transparent, ${C.rose}66, transparent)` }}
            />

            <div className='relative z-10'>
               <motion.p
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className='text-4xl mb-2'
                  style={{ fontFamily: "var(--font-dancing)", color: C.champagne }}>
                  Vaibhav &amp; Khyati
               </motion.p>
               <div className='flex items-center justify-center gap-3 mt-2'>
                  <div className='h-px w-10 opacity-20' style={{ background: C.champagne }} />
                  <Heart size={12} fill={C.rose} style={{ color: C.rose }} />
                  <div className='h-px w-10 opacity-20' style={{ background: C.champagne }} />
               </div>
               <p className='mt-3 text-xs uppercase tracking-widest' style={{ color: `${C.champagne}50` }}>
                  © 2026 &nbsp;·&nbsp; Crafted with Love &nbsp;·&nbsp; See you there! 🌸
               </p>
            </div>
         </footer>

         <RSVPModal isOpen={isRSVPOpen} onClose={() => setIsRSVPOpen(false)} />
      </main>
   );
}
