import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  type Variants,        // ← typed as Variants to fix the TS errors
} from "framer-motion";
import {
  ArrowRight, BarChart3, Users, Building2,
  TrendingUp, Languages, Sun, Moon, Sparkles, ChevronDown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PartnersSection from "@/components/sections/PartnersSection";
import ContactModal from "@/components/ui/ContactModal";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

import heroImg from "@/assets/images/hero-bg.jpg";
import aboutImg from "@/assets/images/about-us.jpg";
import logo from "@assets/EasyWay_1772155413140.png";

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(current);
    }, 25);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Floating Orb ─────────────────────────────────────────────────────────────
function FloatingOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    nav: { about: "About Us", services: "Services", partners: "Partners", contact: "Contact Us" },
    hero: {
      badge: "Established 2022",
      title: "Marketing With",
      titleAccent: "Purpose",
      titleEnd: "& Vision.",
      description: "We connect exceptional products with the right audience through strategic commercial cooperation and innovative marketing solutions across Yemen.",
      cta1: "Our Services",
      cta2: "Partner With Us",
      scroll: "Scroll to explore",
    },
    about: {
      label: "About Easy Way",
      title: "Bridging The Gap Between Products & People.",
      p1: "Founded in 2022, Easy Way was built on the foundation of collaboration and market intelligence. We specialize in marketing high-quality products by working hand-in-hand with leading Yemeni commercial companies.",
      p2: "Our approach is simple: understand the local market, build strong corporate relationships, and execute marketing strategies that drive real, measurable growth.",
      stat: "Commercial Partners",
      feat1: "Local Expertise",
      feat1Desc: "Deep understanding of the Yemeni market.",
      feat2: "Strategic Growth",
      feat2Desc: "Results-driven marketing campaigns.",
    },
    stats: { partners: "Commercial Partners", years: "Years Experience", campaigns: "Campaigns Run" },
    services: {
      label: "What We Do",
      title: "Comprehensive Marketing Solutions",
      description: "We provide end-to-end marketing services for commercial companies, ensuring your products reach their maximum potential.",
      s1: { title: "Market Analysis", desc: "In-depth research and data analysis to identify target demographics and market opportunities." },
      s2: { title: "Corporate Partnership", desc: "Facilitating strategic alliances between brands and commercial distributors across Yemen." },
      s3: { title: "Product Marketing", desc: "Developing and executing comprehensive campaigns to elevate brand presence and drive sales." },
    },
    cta: {
      title: "Ready to grow your market presence?",
      desc: "Join the growing list of commercial companies trusting Easy Way with their product marketing strategy.",
      button: "Let's Discuss Your Project",
    },
  },
  ar: {
    nav: { about: "من نحن", services: "خدماتنا", partners: "شركاؤنا", contact: "اتصل بنا" },
    hero: {
      badge: "تأسست عام 2022",
      title: "تسويق",
      titleAccent: "بهدف",
      titleEnd: "ورؤية واضحة.",
      description: "نحن نربط المنتجات الاستثنائية بالجمهور المناسب من خلال التعاون التجاري الاستراتيجي وحلول التسويق المبتكرة في جميع أنحاء اليمن.",
      cta1: "خدماتنا",
      cta2: "شريك معنا",
      scroll: "اسحب للاستكشاف",
    },
    about: {
      label: "عن إيزي واي",
      title: "جسر التواصل بين المنتجات والناس.",
      p1: "تأسست إيزي واي في عام 2022 على أساس التعاون وذكاء السوق. نحن متخصصون في تسويق المنتجات عالية الجودة من خلال العمل جنباً إلى جنب مع الشركات التجارية اليمنية الرائدة.",
      p2: "نهجنا بسيط: فهم السوق المحلي، وبناء علاقات مؤسسية قوية، وتنفيذ استراتيجيات تسويقية تحقق نمواً حقيقياً وملموساً.",
      stat: "شريك تجاري",
      feat1: "خبرة محلية",
      feat1Desc: "فهم عميق للسوق اليمني.",
      feat2: "نمو استراتيجي",
      feat2Desc: "حملات تسويقية مدفوعة بالنتائج.",
    },
    stats: { partners: "شريك تجاري", years: "سنوات خبرة", campaigns: "حملة منفذة" },
    services: {
      label: "ماذا نفعل",
      title: "حلول تسويقية شاملة",
      description: "نقدم خدمات تسويقية متكاملة للشركات التجارية، مما يضمن وصول منتجاتك إلى أقصى إمكاناتها.",
      s1: { title: "تحليل السوق", desc: "بحث متعمق وتحليل بيانات لتحديد الفئات المستهدفة وفرص السوق." },
      s2: { title: "الشراكة المؤسسية", desc: "تسهيل التحالفات الاستراتيجية بين العلامات التجارية والموزعين التجاريين في جميع أنحاء اليمن." },
      s3: { title: "تسويق المنتجات", desc: "تطوير وتنفيذ حملات شاملة لرفع حضور العلامة التجارية وتعزيز المبيعات." },
    },
    cta: {
      title: "جاهز لتعزيز حضورك في السوق؟",
      desc: "انضم إلى قائمة الشركات التجارية المتزايدة التي تثق في إيزي واي لاستراتيجية تسويق منتجاتها.",
      button: "لنناقش مشروعك",
    },
  },
};

// ─── FIX: Typed as Variants — this is what kills the TS error ─────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [contactOpen, setContactOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = translations[lang];

  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const springY = useSpring(heroImgY, { stiffness: 80, damping: 20 });

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden ${lang === "ar" ? "font-sans" : ""}`}>

      {/* ── Floating Controls (moved to bottom-right on mobile to avoid hamburger) ── */}
      <div className="fixed bottom-6 right-4 z-[60] flex flex-col gap-2 md:top-24 md:bottom-auto">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="secondary" size="icon"
            onClick={() => setLang(p => p === "en" ? "ar" : "en")}
            className="rounded-full shadow-lg border border-border"
          >
            <Languages className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="secondary" size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full shadow-lg border border-border"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      <Navbar lang={lang} t={t.nav} onContactClick={() => setContactOpen(true)} />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} lang={lang} />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 md:pt-48 md:pb-40 overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y: springY }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/65 to-slate-900/90 z-10" />
          <img src={heroImg} alt="Business Background" className="w-full h-[120%] object-cover" />
        </motion.div>

        {/* Orbs — hidden on mobile for performance */}
        <FloatingOrb className="hidden md:block top-20 left-10 w-72 h-72 bg-primary opacity-30" />
        <FloatingOrb className="hidden md:block bottom-20 right-10 w-96 h-96 bg-blue-500 opacity-30" />

        <div className="container mx-auto px-4 md:px-8 relative z-20 w-full">
          <motion.div
            key={lang}
            className="max-w-3xl mx-auto md:mx-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs md:text-sm font-medium mb-6 md:mb-8">
                <motion.span
                  className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                {t.hero.badge}
              </div>
            </motion.div>

            {/* Title — smaller on mobile */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight"
            >
              {t.hero.title}{" "}
              <span className="relative inline-block">
                <span className="text-primary">{t.hero.titleAccent}</span>
                <motion.span
                  className="absolute bottom-0 left-0 h-1 bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>{" "}
              {t.hero.titleEnd}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg lg:text-xl text-slate-200 mb-8 md:mb-10 max-w-2xl leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-full"
                  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t.hero.cta1}
                  <ArrowRight className={`ml-2 h-4 w-4 ${lang === "ar" ? "rotate-180 mr-2 ml-0" : ""}`} />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-full"
                  onClick={() => setContactOpen(true)}
                >
                  {t.hero.cta2}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator — hide on small screens */}
        <motion.div
          className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/60 text-xs"
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span>{t.hero.scroll}</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-10 md:py-16 bg-primary text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{ background: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 60px)" }}
        />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          {/* grid-cols-3 on all sizes but with tighter spacing on mobile */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
            {[
              { val: 50, suffix: "+", label: t.stats.partners },
              { val: 3,  suffix: "+", label: t.stats.years },
              { val: 120, suffix: "+", label: t.stats.campaigns },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1">
                  <AnimatedCounter target={s.val} suffix={s.suffix} />
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium leading-tight">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-16 md:py-24 bg-card overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Image */}
            <motion.div
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: lang === "en" ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-3 md:-inset-4 bg-primary/10 rounded-3xl"
                  animate={{ rotate: [lang === "en" ? 3 : -3, lang === "en" ? 1 : -1, lang === "en" ? 3 : -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <img
                  src={aboutImg}
                  alt="Team Collaboration"
                  loading="lazy"
                  className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                />
                {/* Stats badge — repositioned so it doesn't overflow on mobile */}
                <motion.div
                  className={`absolute -bottom-4 ${lang === "en" ? "right-2 md:-right-6" : "left-2 md:-left-6"} bg-card p-3 md:p-5 rounded-xl shadow-2xl flex items-center gap-3 md:gap-4 border border-border`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="text-primary h-5 w-5 md:h-7 md:w-7" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      <AnimatedCounter target={50} suffix="+" />
                    </p>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">{t.about.stat}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="w-full md:w-1/2 pt-8 md:pt-0"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2 variants={itemVariants} className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">
                {t.about.label}
              </motion.h2>
              <motion.h3 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 md:mb-6">
                {t.about.title}
              </motion.h3>
              <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                {t.about.p1}
              </motion.p>
              <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                {t.about.p2}
              </motion.p>
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {[
                  { icon: Users, title: t.about.feat1, desc: t.about.feat1Desc },
                  { icon: TrendingUp, title: t.about.feat2, desc: t.about.feat2Desc },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-accent transition-colors"
                    whileHover={{ x: lang === "en" ? 4 : -4 }}
                  >
                    <div className="mt-1 p-2 bg-accent rounded-lg flex-shrink-0">
                      <Icon className="text-foreground h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm md:text-base">{title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
        <FloatingOrb className="hidden md:block top-0 right-0 w-96 h-96 bg-primary/50" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-10 md:mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">
              {t.services.label}
            </motion.h2>
            <motion.h3 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.services.title}
            </motion.h3>
            <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground">
              {t.services.description}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            {[
              { icon: BarChart3, ...t.services.s1 },
              { icon: Building2, ...t.services.s2 },
              { icon: TrendingUp, ...t.services.s3 },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border group cursor-default relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <motion.div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-accent border border-border flex items-center justify-center mb-5 md:mb-6 relative"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <service.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </motion.div>
                <h4 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3 relative">{service.title}</h4>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed relative">{service.desc}</p>
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-2xl"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
     {/*<PartnersSection lang={lang} />*/}

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden">
        <FloatingOrb className="top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/40" />
        <FloatingOrb className="bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500/40" />
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-white rounded-2xl p-3 md:p-4 mb-6 md:mb-8 shadow-2xl"
              whileHover={{ rotate: 10, scale: 1.1 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            >
              <img src={logo} alt="Easy Way Logo" className="w-full h-full object-contain" />
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {t.cta.title}
            </motion.h2>
            <motion.p
              className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 md:mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {t.cta.desc}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 text-base md:text-lg h-12 md:h-14 px-8 md:px-10 rounded-full"
                onClick={() => setContactOpen(true)}
              >
                {t.cta.button}
                <motion.span className="ml-2" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  →
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}