"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  useSpring 
} from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Heart, 
  Music, 
  Music2, 
  Send, 
  ChevronDown, 
  Share2,
  CheckCircle2,
  X
} from "lucide-react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

// --- Components ---

const Section = ({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={cn("min-h-screen flex flex-col items-center justify-center relative px-6 py-20", className)}>
    {children}
  </section>
);

const LotusDecoration = ({ className }: { className?: string }) => (
  <div className={cn("opacity-20 pointer-events-none select-none", className)}>
    <svg viewBox="0 0 100 60" className="w-32 h-20">
      <path d="M50 0 C60 20 90 30 90 50 C90 60 10 60 10 50 C10 30 40 20 50 0" fill="currentColor" />
      <path d="M50 5 C65 25 80 35 80 50 C80 55 20 55 20 50 C20 35 35 25 50 5" fill="none" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  </div>
);

const ToranHanging = ({ className }: { className?: string }) => (
  <div className={cn("flex gap-8 justify-center absolute top-0 left-0 right-0 opacity-30", className)}>
    {[...Array(6)].map((_, i) => (
      <motion.div 
        key={i}
        animate={{ rotate: [i % 2 ? -2 : 2, i % 2 ? 2 : -2] }}
        transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-[1px] h-20 bg-gold/40" />
        <div className="w-4 h-4 rounded-full bg-gold/60" />
        <LotusDecoration className="w-12 h-8 text-sage mt-[-4px]" />
      </motion.div>
    ))}
  </div>
);

// --- RSVP Modal ---

const RSVPModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: "",
    guests: "1",
    phone: "",
    attending: "Yes"
  });

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setStatus("submitting");
    
    try {
      const scriptURL = "https://script.google.com/macros/s/AKfycbxU1kCTp3HHBB14Zm9eWWMY5B47OTJyOGkdDNXilvxrwX1fRuCp_5hS5FEIWDq5zXUqWQ/exec"; 
      
      // Using URLSearchParams + no-cors avoids the CORS preflight OPTIONS request
      // which Google Apps Script does not support.
      const params = new URLSearchParams();
      params.append("name", formData.name);
      params.append("guests", formData.guests);
      params.append("phone", formData.phone);
      params.append("attending", formData.attending);

      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8A9A5B", "#C5A059", "#FAF9F6"]
      });
      
      setStatus("success");
    } catch (error) {
      console.error("Submission failed", error);
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-cream rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-2 border-gold/20"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-sage hover:text-gold transition-colors">
              <X size={24} />
            </button>

            {status === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="flex justify-center mb-6">
                  <CheckCircle2 size={64} className="text-sage" />
                </div>
                <h2 className="text-3xl font-serif text-sage mb-2">Thank You!</h2>
                <p className="text-foreground/70">Your RSVP has been recorded in our guest list. We can't wait to see you!</p>
                <button 
                  onClick={onClose}
                  className="mt-8 px-8 py-3 bg-sage text-white rounded-full font-serif hover:bg-sage-light transition-all shadow-lg"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-serif text-sage mb-2">RSVP</h2>
                <p className="text-foreground/60 mb-6 font-sans">Please let us know if you can join our celebration.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-white/50 backdrop-blur-sm transition-all",
                        errors.name ? "border-red-400 ring-red-100" : "border-gold/20 focus:ring-sage/50"
                      )}
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        if (errors.name) setErrors({...errors, name: ""});
                      }}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1 ml-1">Guests</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:ring-2 focus:ring-sage/50 bg-white/50 backdrop-blur-sm transition-all"
                        value={formData.guests}
                        onChange={(e) => setFormData({...formData, guests: e.target.value})}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1 ml-1">Attending?</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:ring-2 focus:ring-sage/50 bg-white/50 backdrop-blur-sm transition-all font-medium"
                        value={formData.attending}
                        onChange={(e) => setFormData({...formData, attending: e.target.value})}
                      >
                        <option value="Yes">Yes, gladly!</option>
                        <option value="No">Sadly, no</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1 ml-1">Phone (Optional)</label>
                    <input 
                      type="tel" 
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-white/50 backdrop-blur-sm transition-all",
                        errors.phone ? "border-red-400 ring-red-100" : "border-gold/20 focus:ring-sage/50"
                      )}
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({...formData, phone: e.target.value});
                        if (errors.phone) setErrors({...errors, phone: ""});
                      }}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                  </div>

                  <button 
                    disabled={status === "submitting"}
                    type="submit"
                    className={cn(
                      "w-full py-4 rounded-xl text-white font-serif text-lg transition-all shadow-lg flex items-center justify-center gap-2 mt-6",
                      status === "submitting" ? "bg-sage/70 cursor-not-allowed" : "bg-sage hover:bg-sage-light active:scale-[0.98]"
                    )}
                  >
                    {status === "submitting" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving to list...
                      </div>
                    ) : (
                      <>
                        Confirm RSVP <Send size={18} />
                      </>
                    )}
                  </button>
                  {status === "error" && (
                    <p className="text-red-500 text-center text-sm mt-2">Something went wrong. Please try again.</p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Countdown ---

const Countdown = () => {
  const targetDate = new Date("June 21, 2026 16:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 md:gap-8 justify-center mt-12">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white/40 backdrop-blur-md rounded-2xl border border-gold/30 shadow-sm">
            <span className="text-2xl md:text-3xl font-serif text-white font-bold">{value}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest mt-2 text-white/80 font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Cursor ---

const CustomCursor = () => {
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isPointer, setIsPointer] = useState(false);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === "pointer");
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden md:block"
      style={{
        x: springX,
        y: springY,
      }}
      animate={{
        scale: isPointer ? 1.5 : 1,
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gold/30 rounded-full blur-md" />
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-sage opacity-60">
          <path fill="currentColor" d="M12,2C12,2 17,7 17,12C17,17 12,22 12,22C12,22 7,17 7,12C7,7 12,2 12,2Z" />
        </svg>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function InvitationApp() {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pre-generate random values for floating elements to avoid hydration mismatch
  const [floatingElements, setFloatingElements] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const elements = [...Array(15)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 20
    }));
    setFloatingElements(elements);
  }, []);
  
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const shareInvitation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Baby Shower Invitation',
        text: 'Join us for Vaibhav & Khyati\'s Baby Shower!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className="relative bg-cream selection:bg-sage/20 selection:text-sage cursor-none">
      {mounted && <CustomCursor />}
      <div className="border-frame" />
      
      {/* Background Ambience */}
      
      {/* Floating Elements (Petals/Birds) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {mounted && floatingElements.map((el, i) => (
          <motion.div
            key={i}
            initial={{ 
              top: "-10%", 
              left: el.left,
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              top: "110%", 
              opacity: [0, 0.8, 0],
              rotate: 360,
              x: Math.sin(i) * 50
            }}
            transition={{ 
              duration: el.duration, 
              repeat: Infinity, 
              ease: "linear",
              delay: el.delay
            }}
            className="absolute"
          >
            <div className="w-4 h-6 rounded-[100%_0%_100%_0%] bg-sage/30 backdrop-blur-[2px] border border-white/20 rotate-45 shadow-sm" />
          </motion.div>
        ))}
      </div>

      {/* Music Toggle */}
      <button 
        onClick={toggleMusic}
        className="fixed top-6 right-6 z-40 p-3 bg-white/60 backdrop-blur-md border border-gold/30 rounded-full shadow-lg text-sage hover:text-gold transition-all active:scale-95"
      >
        {isPlaying ? <Music size={20} className="animate-note" /> : <Music2 size={20} />}
        <audio ref={audioRef} loop src="/assets/music.mp3" />
      </button>

      {/* Share Button */}
      <button 
        onClick={shareInvitation}
        className="fixed bottom-6 right-6 z-40 p-4 bg-sage text-white rounded-full shadow-2xl hover:bg-sage-light transition-all active:scale-90"
      >
        <Share2 size={24} />
      </button>

      {/* HERO SECTION */}
      <Section className="overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/hero_bg.png" 
            alt="Background" 
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center z-20"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-gold uppercase tracking-[0.4em] font-semibold text-sm mb-6 flex justify-center flex-wrap"
          >
            {"Please join us for a".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
            className="text-7xl md:text-9xl font-script text-white mb-8 block drop-shadow-lg"
          >
            Baby Shower
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-6 my-6">
              <div className="h-[1px] w-12 md:w-24 bg-white/40" />
              <h2 className="text-4xl md:text-7xl font-serif text-white gold-gradient font-black tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)]">
                Vaibhav & Khyati
              </h2>
              <div className="h-[1px] w-12 md:w-24 bg-white/40" />
            </div>
            
            <Countdown />
          </motion.div>
        </motion.div>

        <motion.div 
          style={{ opacity, scale }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium">Scroll to explore</span>
          <ChevronDown size={20} className="text-gold/60" />
        </motion.div>
      </Section>

      {/* SAVE THE DATE SECTION */}
      <Section className="overflow-hidden bg-sage/5">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/savethedate_bg.png" 
            alt="Background" 
            fill
            sizes="100vw"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <ToranHanging className="text-gold" />
        <div className="max-w-4xl mx-auto text-center z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Heart size={40} className="text-sage mx-auto mb-6 fill-sage/10" />
            <h2 className="text-4xl md:text-6xl font-serif text-foreground mb-12">Save the Date</h2>
            
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Date Card */}
              <div className="glass p-8 rounded-3xl border border-gold/20 shadow-xl group hover:border-sage/40 transition-all">
                <Calendar className="mx-auto mb-4 text-sage group-hover:scale-110 transition-transform" size={32} />
                <p className="font-serif text-2xl text-foreground">June 21, 2026</p>
                <p className="text-foreground/60 uppercase tracking-widest text-xs mt-1">Sunday</p>
              </div>

              {/* Day Reveal */}
              <div className="order-first md:order-none relative h-40 flex items-center justify-center">
                 <div className="absolute inset-0 bg-gold/5 rounded-full blur-3xl" />
                 <div className="text-sage font-script text-6xl md:text-8xl rotate-[-10deg]">Sunday</div>
              </div>

              {/* Time Card */}
              <div className="glass p-8 rounded-3xl border border-gold/20 shadow-xl group hover:border-sage/40 transition-all">
                <Clock className="mx-auto mb-4 text-sage group-hover:scale-110 transition-transform" size={32} />
                <p className="font-serif text-2xl text-foreground">4:00 PM onwards</p>
                <p className="text-foreground/60 uppercase tracking-widest text-xs mt-1">Regina Time</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* VENUE SECTION */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto z-20">
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white/50 h-[500px]">
            <Image 
              src="/assets/celebration.png" 
              alt="Grand Celebration" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-serif">A Grand Celebration</h3>
              <p className="opacity-80">Join us at the South Leisure Centre</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center md:items-start"
          >
            <div className="flex items-center gap-2 mb-6 text-sage uppercase tracking-[0.2em] font-semibold text-sm">
              <MapPin size={18} /> Location Details
            </div>
            
            <h2 className="text-4xl md:text-6xl font-serif text-foreground mb-6 text-center md:text-left">
              South Leisure <br />
              <span className="text-sage">Neighbourhood Centre</span>
            </h2>
            
            <p className="text-lg text-foreground/70 mb-8 max-w-md text-center md:text-left leading-relaxed">
              170 Sunset Dr, Regina, SK S4S 2X5<br />
              Saskatchewan, Canada
            </p>

            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=170+Sunset+Dr+Regina+SK+S4S+2X5" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-white text-sage border-2 border-sage rounded-full font-serif text-lg hover:bg-sage hover:text-white transition-all shadow-md active:scale-95 group flex items-center gap-3"
            >
              Open in Google Maps
              <Send size={18} className="rotate-45" />
            </a>
          </motion.div>
        </div>
      </Section>

      {/* CELEBRATION SECTION */}
      <Section className="bg-sage/10 overflow-hidden">
        <LotusDecoration className="absolute -top-10 -right-10 text-gold scale-x-[-1]" />
        <LotusDecoration className="absolute -bottom-10 -left-10 text-sage" />
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative w-64 md:w-80 mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl border-4 border-gold/20">
            <Image 
              src="/assets/2.png" 
              alt="Invitation Card" 
              width={400}
              height={600}
              priority
              className="w-full h-auto"
            />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-serif text-foreground mb-8 drop-shadow-sm">Ready to Celebrate?</h2>
          <p className="text-xl text-foreground/80 mb-12 font-sans italic bg-white/40 backdrop-blur-sm py-4 rounded-2xl inline-block px-8">
            "Your presence at our celebration would mean a lot to us."
          </p>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRSVPOpen(true)}
            className="px-16 py-6 bg-gold text-white rounded-full font-serif text-2xl shadow-[0_10px_40px_rgba(197,160,89,0.3)] hover:shadow-[0_15px_50px_rgba(197,160,89,0.4)] transition-all flex items-center gap-4 mx-auto"
          >
            Confirm Your RSVP
            <Send size={24} />
          </motion.button>

          <p className="mt-8 text-foreground/40 font-serif">
            For any queries, contact: <br />
            <span className="text-sage font-sans font-semibold">+1 (639) 382-8797</span>
          </p>
        </motion.div>
      </Section>

      {/* FOOTER */}
      <footer className="py-12 bg-white text-center border-t border-gold/10">
        <p className="text-gold font-script text-3xl mb-2">Vaibhav & Khyati</p>
        <p className="text-foreground/40 text-sm uppercase tracking-widest">&copy; 2026 Crafted with Love</p>
      </footer>

      <RSVPModal isOpen={isRSVPOpen} onClose={() => setIsRSVPOpen(false)} />
    </main>
  );
}
