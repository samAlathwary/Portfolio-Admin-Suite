import { motion } from "framer-motion";
import { useListPartners } from "@workspace/api-client-react";

interface PartnersSectionProps {
  lang: "en" | "ar";
}

interface PartnerCardData {
  name: string;
  initials: string;
  color: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
}

const fallbackPartners: PartnerCardData[] = [
  { name: "Al-Amoudi Group", initials: "AG", color: "from-blue-500 to-blue-700" },
  { name: "Yemen Trading Co.", initials: "YT", color: "from-emerald-500 to-emerald-700" },
  { name: "Gulf Commerce", initials: "GC", color: "from-orange-500 to-orange-700" },
  { name: "Sana'a Distributors", initials: "SD", color: "from-purple-500 to-purple-700" },
  { name: "Al-Hayat Corp", initials: "AH", color: "from-rose-500 to-rose-700" },
  { name: "Hadramout Trading", initials: "HT", color: "from-cyan-500 to-cyan-700" },
  { name: "Yemen Foods Ltd", initials: "YF", color: "from-amber-500 to-amber-700" },
  { name: "Aden Commercial", initials: "AC", color: "from-teal-500 to-teal-700" },
];

const colorPalette = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-orange-500 to-orange-700",
  "from-purple-500 to-purple-700",
  "from-rose-500 to-rose-700",
  "from-cyan-500 to-cyan-700",
  "from-amber-500 to-amber-700",
  "from-teal-500 to-teal-700",
];

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const content = {
  en: {
    label: "Our Partners",
    title: "Trusted By Leading Companies",
    desc: "We collaborate with top commercial companies across Yemen to deliver exceptional marketing results.",
    badge: (count: number) => `${count}+ companies trust Easy Way`,
  },
  ar: {
    label: "شركاؤنا",
    title: "موثوق به من قبل الشركات الرائدة",
    desc: "نتعاون مع أبرز الشركات التجارية في جميع أنحاء اليمن لتحقيق نتائج تسويقية استثنائية.",
    badge: (count: number) => `+${count} شركة تثق في إيزي واي`,
  },
};

function PartnerCard({ partner }: { partner: PartnerCardData }) {
  const inner = (
    <motion.div
      className="flex-shrink-0 w-52 h-28 bg-background border border-border rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm cursor-default group overflow-hidden"
      whileHover={{ y: -4, scale: 1.03, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2 }}
    >
      {partner.logoUrl ? (
        <img
          src={partner.logoUrl}
          alt={partner.name}
          className="h-12 w-auto max-w-[80%] object-contain group-hover:scale-110 transition-transform duration-200"
          loading="lazy"
        />
      ) : (
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200`}>
          {partner.initials}
        </div>
      )}
      <span className="text-sm font-medium text-foreground text-center px-3 leading-tight line-clamp-1">
        {partner.name}
      </span>
    </motion.div>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={partner.name}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

export default function PartnersSection({ lang }: PartnersSectionProps) {
  const t = content[lang];
  const { data, isLoading } = useListPartners();

  const partners: PartnerCardData[] =
    !isLoading && data && data.length > 0
      ? data.map((p, i) => ({
          name: p.name,
          initials: makeInitials(p.name),
          color: colorPalette[i % colorPalette.length],
          logoUrl: p.logoUrl,
          websiteUrl: p.websiteUrl,
        }))
      : fallbackPartners;

  // Triple for seamless infinite loop
  const row1 = [...partners, ...partners, ...partners];
  const reversed = [...partners].reverse();
  const row2Full = [...reversed, ...reversed, ...reversed];

  const partnerCount = data?.length ?? partners.length;

  return (
    <section id="partners" className="py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">{t.label}</h2>
          <h3 className="text-4xl font-bold text-foreground mb-4">{t.title}</h3>
          <p className="text-lg text-muted-foreground">{t.desc}</p>
        </motion.div>
      </div>

      {/* Row 1 — left to right */}
      <div className="relative mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-card to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {row1.map((partner, i) => (
            <PartnerCard key={`r1-${i}`} partner={partner} />
          ))}
        </motion.div>
      </div>

      {/* Row 2 — right to left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-card to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-card to-transparent pointer-events-none" />
        <motion.div
          className="flex gap-6"
          animate={{ x: ["-33.33%", "0%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {row2Full.map((partner, i) => (
            <PartnerCard key={`r2-${i}`} partner={partner} />
          ))}
        </motion.div>
      </div>

      {/* Trust badge */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
          <motion.span className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          {t.badge(Math.max(partnerCount, 50))}
        </div>
      </motion.div>
    </section>
  );
}
