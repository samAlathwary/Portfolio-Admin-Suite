interface FooterProps {
  lang: "en" | "ar";
}

export default function Footer({ lang }: FooterProps) {
  const isAr = lang === "ar";
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={isAr ? 'text-right' : 'text-left'}>
            <h3 className="text-2xl font-bold text-white mb-4">Easy Way</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              {isAr 
                ? "تأسست إيزي واي في عام 2022، وهي وكالة تسويق رائدة متخصصة في تسويق المنتجات والتعاون التجاري مع كبرى الشركات اليمنية."
                : "Established in 2022, Easy Way is a leading marketing agency specializing in product marketing and commercial cooperation with top Yemeni companies."}
            </p>
          </div>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <h4 className="text-lg font-semibold text-white mb-4">{isAr ? "روابط سريعة" : "Quick Links"}</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm hover:text-primary transition-colors">{isAr ? "من نحن" : "About Us"}</a></li>
              <li><a href="#services" className="text-sm hover:text-primary transition-colors">{isAr ? "خدماتنا" : "Services"}</a></li>
              <li><a href="#partners" className="text-sm hover:text-primary transition-colors">{isAr ? "شركاؤنا" : "Partners"}</a></li>
            </ul>
          </div>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <h4 className="text-lg font-semibold text-white mb-4">{isAr ? "اتصال" : "Contact"}</h4>
            <ul className="space-y-2 text-sm">
              <li>{isAr ? "البريد الإلكتروني" : "Email"}: contact@easyway.agency</li>
              <li>{isAr ? "الهاتف" : "Phone"}: +967 713611170</li>
              <li>{isAr ? "العنوان: صنعاء، اليمن" : "Address: Sana'a, Yemen"}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Easy Way. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 rtl:space-x-reverse">
           <a 
            href="https://www.facebook.com/profile.php?id=100079420779774"
            target="_blank"
            rel="noopener noreferrer"  
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
            <span className="text-xs">F</span>
          </a>
            {/* <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
              <span className="text-xs">Instagram</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
              <span className="text-xs">WhatsApp</span>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}