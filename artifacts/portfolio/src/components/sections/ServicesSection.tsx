import { motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  Building2,
  Globe,
  Layers,
  Megaphone,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useListServices } from "@workspace/api-client-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ServicesSectionProps {
  lang: "en" | "ar";
}

const IconMap: Record<string, React.ElementType> = {
  TrendingUp,
  Megaphone,
  BarChart3,
  Briefcase,
  Globe,
  Target,
  Sparkles,
  Users,
  MessageSquare,
  Layers,
};

const fallbackServices = [
  {
    title: "Market Analysis",
    description:
      "In-depth research and data analysis to identify target demographics and market opportunities.",
    icon: "BarChart3",
  },
  {
    title: "Corporate Partnership",
    description:
      "Facilitating strategic alliances between brands and commercial distributors across Yemen.",
    icon: "Building2",
  },
  {
    title: "Product Marketing",
    description:
      "Developing and executing comprehensive campaigns to elevate brand presence and drive sales.",
    icon: "TrendingUp",
  },
];

const content = {
  en: {
    label: "What We Do",
    title: "Comprehensive Marketing Solutions",
    description:
      "We provide end-to-end marketing services for commercial companies, ensuring your products reach their maximum potential.",
    empty: "Services will appear here once they are added in the admin panel.",
    prev: "Previous services",
    next: "Next services",
  },
  ar: {
    label: "ماذا نفعل",
    title: "حلول تسويقية شاملة",
    description:
      "نقدم خدمات تسويقية متكاملة للشركات التجارية، مما يضمن وصول منتجاتك إلى أقصى إمكاناتها.",
    empty: "ستظهر الخدمات هنا بعد إضافتها من لوحة الإدارة.",
    prev: "الخدمات السابقة",
    next: "الخدمات التالية",
  },
};

function renderServiceIcon(iconName: string | null | undefined) {
  const IconComponent =
    (iconName && IconMap[iconName]) ||
    (iconName === "Building2" ? Building2 : null) ||
    Layers;

  return <IconComponent className="h-7 w-7 md:h-8 md:w-8 text-primary" />;
}

export default function ServicesSection({ lang }: ServicesSectionProps) {
  const t = content[lang];
  const { data, isLoading } = useListServices();

  const services = Array.isArray(data) && data.length > 0 ? data : fallbackServices;
  const visibleServices =
    Array.isArray(data) && data.length > 0
      ? data.filter((service) => service.active)
      : fallbackServices;

  return (
    <section id="services" className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
      <motion.div
        className="hidden md:block absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl bg-primary/20 pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-primary font-semibold tracking-wider uppercase text-sm mb-3">
            {t.label}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.title}
          </h3>
          <p className="text-base md:text-lg text-muted-foreground">{t.description}</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 min-h-[280px] animate-pulse"
              >
                <div className="h-16 w-16 rounded-xl bg-accent mb-6" />
                <div className="h-6 w-2/3 bg-accent rounded mb-3" />
                <div className="h-4 w-full bg-accent rounded mb-2" />
                <div className="h-4 w-5/6 bg-accent rounded" />
              </div>
            ))}
          </div>
        ) : visibleServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/70 px-6 py-12 text-center text-muted-foreground">
            {t.empty}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: visibleServices.length > 3,
            }}
            className="mx-auto max-w-6xl px-2 md:px-12"
          >
            <CarouselContent className="-ml-5">
              {visibleServices.map((service, index) => (
                <CarouselItem
                  key={"id" in service ? service.id : `${service.title}-${index}`}
                  className="pl-5 basis-full md:basis-1/2 xl:basis-1/3"
                >
                  <motion.div
                    className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border group h-full relative overflow-hidden"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-accent border border-border flex items-center justify-center mb-5 md:mb-6 relative">
                      {renderServiceIcon(service.icon)}
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3 relative">
                      {service.title}
                    </h4>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed relative line-clamp-4">
                      {service.description || t.empty}
                    </p>
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary rounded-b-2xl transition-all duration-300 group-hover:w-full" />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              className="left-0 top-[45%] h-10 w-10 border-border bg-background/90 backdrop-blur"
              aria-label={t.prev}
            />
            <CarouselNext
              className="right-0 top-[45%] h-10 w-10 border-border bg-background/90 backdrop-blur"
              aria-label={t.next}
            />
          </Carousel>
        )}

        {!isLoading && visibleServices.length > 0 && visibleServices.length < services.length ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {lang === "ar"
              ? "يتم عرض الخدمات النشطة فقط."
              : "Only active services are shown."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
