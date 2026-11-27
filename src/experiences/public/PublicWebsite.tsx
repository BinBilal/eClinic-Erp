import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Eye,
  FileCheck2,
  FlaskConical,
  Headphones,
  HelpCircle,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Play,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingCart,
  Target,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Warehouse,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Modal } from '../../components/ui/Modal';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useDemoStore } from '../../store/demoStore';
import { ApplicationRecord, BusinessType, ExperienceRole, PublicPage } from '../../types/erp';

interface PublicWebsiteProps {
  onNavigateRole: (role: ExperienceRole) => void;
}

const HERO_IMAGE = '/src/assets/images/hero_pharmacy_erp_1795685737230.jpg';
const PHARMACY_IMAGE = '/src/assets/images/solution_pharmacy_1795685737184.jpg';
const PHARMACEUTICAL_IMAGE = '/src/assets/images/solution_wholesaler_1795685737597.jpg';
const LAB_IMAGE = '/src/assets/images/lab_diagnostics_1795685738275.jpg';

const NAV_ITEMS: { id: PublicPage; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'features', label: 'Features' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'apply', label: 'Apply Now' },
];

const PLATFORM_FEATURES = [
  {
    icon: <Package className="h-5 w-5 text-[#1E396A] dark:text-sky-300" />,
    title: 'Maamulka Badeecooyinka',
    desc: 'Diiwaanka daawooyinka, nooca guud, qiimaha iibka, iyo tirada taalla.',
  },
  {
    icon: <Warehouse className="h-5 w-5 text-[#396BA4] dark:text-sky-400" />,
    title: 'Maamulka Kaydka & Dufcadaha',
    desc: 'Kormeer kaydkaaga, Batch Number, iyo digniinaha daawada sii dhacaysa.',
  },
  {
    icon: <ShoppingCart className="h-5 w-5 text-[#F05D21]" />,
    title: 'Iibka (POS & Invoices)',
    desc: 'Maaree iibka maalinlaha ah ee farmashiyaha ama biilasha B2B ee shirkadaha.',
  },
  {
    icon: <ClipboardCheck className="h-5 w-5 text-[#1E396A] dark:text-sky-300" />,
    title: 'Maamulka Wax Iibsiga',
    desc: 'Hagaaji dalabyada iibsadka, helitaanka alaabta, iyo alaab-qeybiyeyaasha.',
  },
  {
    icon: <Users className="h-5 w-5 text-[#396BA4] dark:text-sky-400" />,
    title: 'Macaamiisha & Deymaha',
    desc: 'Diiwaanka macaamiisha tafaariiqda, ganacsiyada, iyo dabagalka receivables.',
  },
  {
    icon: <Truck className="h-5 w-5 text-[#F05D21]" />,
    title: 'Alaab-qeybiyeyaasha & Payables',
    desc: 'La soco warshadaha, keenayaasha daawada, iyo xisaabaadka bixinta.',
  },
  {
    icon: <Wallet className="h-5 w-5 text-[#16A34A] dark:text-emerald-400" />,
    title: 'Maaliyad Hufan & Kharashaadka',
    desc: 'Diiwaangeli dakhliga, kharashaadka hawlgalka, iyo xisaab-xirka maaliyadeed.',
  },
  {
    icon: <FlaskConical className="h-5 w-5 text-[#F05D21]" />,
    title: 'Warbixinnada Shaybaarka',
    desc: 'Diiwaangelinta bukaanka, baaritaanka, natiijada, iyo u dirista WhatsApp.',
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-[#396BA4] dark:text-sky-400" />,
    title: 'Warbixinno Falanqayn',
    desc: 'Hel warbixinno faahfaahsan oo iib, faa’iido, kayd, iyo dhicitaan ah.',
  },
  {
    icon: <Lock className="h-5 w-5 text-[#16A34A] dark:text-emerald-400" />,
    title: 'Amniga & Multi-Tenant',
    desc: 'Xog-ilaalin ku saleysan koonto u gaar ah ganacsi kasta oo si buuxda u kala xiran.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Sidee ganacsigaygu ugu soo biiri karaa eClinic ERP?',
    a: 'Tag bogga Apply Now, dooro Pharmacy ama Pharmaceutical, buuxi xogta ganacsiga iyo lambarka shatiga, kadibna hel lambarka tixraaca si aad ula socoto heerka codsiga.',
  },
  {
    q: 'Ma isku qasmayaan xogta farmashiyaha iyo ganacsiga Pharmaceutical?',
    a: 'Maya. Ganacsi kastaa wuxuu leeyahay koonto iyo kayd xog oo u gaar ah (Multi-Tenant Isolation), iyadoo POS iyo Shaybaarku ay si gaar ah ugu xiran yihiin Farmashiyeyaasha.',
  },
  {
    q: 'Sideen ula socon karaa heerka codsigayga?',
    a: 'Waxaad isticmaali kartaa bogga Application Status adigoo gelinaya lambarka tixraaca (tusaale: APP-2026-1051) si aad u aragto in la gudbiyay, dib-u-eegis ku jiro, la ansixiyay, ama la diiday.',
  },
  {
    q: 'Sidee bukaanadu u helayaan natiijada shaybaarka?',
    a: 'Maamulka farmashiyuhu marka uu geliyo natiijada baaritaanka, wuxuu daabici karaa warbixin nadiif ah ama si toos ah ugu diri karaa bukaanka WhatsApp.',
  },
];

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ onNavigateRole }) => {
  const { state, submitApplication, lookupApplicationByRef, submitContactMessage } = useDemoStore();
  const [page, setPage] = useState<PublicPage>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Apply Now state
  const [businessType, setBusinessType] = useState<BusinessType>('Pharmacy');
  const [applyForm, setApplyForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: 'Mogadishu',
    address: '',
    registrationNumber: '',
    licenseNumber: '',
    facilityDetail: '',
    notes: '',
  });
  const [applyError, setApplyError] = useState('');
  const [submittedApp, setSubmittedApp] = useState<ApplicationRecord | null>(null);

  // Status checker state
  const [refQuery, setRefQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<ApplicationRecord | null | undefined>(undefined);

  const navigateTo = (target: PublicPage) => {
    setPage(target);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    if (
      !contactForm.name.trim() ||
      !contactForm.email.includes('@') ||
      contactForm.phone.trim().length < 7 ||
      !contactForm.subject.trim() ||
      contactForm.message.trim().length < 10
    ) {
      setContactError(
        'Fadlan buuxi dhammaan meelaha lagama maarmaanka ah, hubina iimaylka iyo lambarka taleefanka.'
      );
      return;
    }
    submitContactMessage(contactForm);
    setContactSuccess(true);
    setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    if (
      !applyForm.businessName.trim() ||
      !applyForm.ownerName.trim() ||
      !applyForm.email.includes('@') ||
      applyForm.phone.trim().length < 7 ||
      !applyForm.address.trim() ||
      !applyForm.registrationNumber.trim() ||
      !applyForm.licenseNumber.trim()
    ) {
      setApplyError(
        'Fadlan buuxi dhammaan xogta ganacsiga, diiwaangelinta iyo ogolaanshaha sharciga.'
      );
      return;
    }

    const created = submitApplication({
      ...applyForm,
      businessType,
      facilityDetail:
        applyForm.facilityDetail.trim() ||
        (businessType === 'Pharmacy' ? '1 Xarun Farmashiye' : '1 Bakhaar Pharmaceutical'),
    });

    setSubmittedApp(created);
    setRefQuery(created.refNumber);
    setLookupResult(created);
    setApplyForm({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      city: 'Mogadishu',
      address: '',
      registrationNumber: '',
      licenseNumber: '',
      facilityDetail: '',
      notes: '',
    });
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refQuery.trim()) return;
    const found = lookupApplicationByRef(refQuery);
    setLookupResult(found || null);
  };

  const renderSubpageBanner = (title: string, breadcrumbLabel: string, imageSrc: string) => (
    <section className="relative bg-[#1E396A] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-200">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>&gt;</span>
            <span className="text-[#F05D21] font-semibold">{breadcrumbLabel}</span>
          </div>
        </div>
        <div className="lg:col-span-6 relative">
          <div className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/15 relative shadow-lg">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E396A]/70 via-[#1E396A]/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );

  const renderSectionTitle = (title: string, subtitle: string) => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-4">
        <span className="h-[2px] w-10 sm:w-14 bg-[#F05D21] rounded-full" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E396A] dark:text-white tracking-tight">
          {title}
        </h2>
        <span className="h-[2px] w-10 sm:w-14 bg-[#F05D21] rounded-full" />
      </div>
      <p className="mt-2 text-sm font-medium text-[#396BA4] dark:text-sky-400">{subtitle}</p>
    </div>
  );

  const renderStatusLookupCard = () => (
    <div className="max-w-3xl mx-auto rounded-2xl bg-[#EDF3FB]/70 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1E396A] dark:text-white">
          Raadi Heerka Codsigaaga
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Geli lambarka tixraaca codsiga (tusaale: APP-2026-1051) si aad u ogaato in la gudbiyay, dib-u-eegis ku jiro, la ansixiyay, ama la diiday.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={refQuery}
            onChange={(e) => setRefQuery(e.target.value)}
            placeholder="Geli Tixraaca Codsiga (APP-2026-XXXX)"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-full font-mono focus:outline-none focus:border-[#396BA4]"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-full bg-[#1E396A] hover:bg-[#162b52] text-white text-sm font-semibold whitespace-nowrap"
        >
          Hubi Hadda
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span>Tixraacyada tusaalaha:</span>
        {state.applications.slice(0, 5).map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => {
              setRefQuery(app.refNumber);
              setLookupResult(app);
            }}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 hover:border-[#1E396A] dark:hover:border-sky-400 font-mono text-[#1E396A] dark:text-sky-300 tabular-nums"
          >
            {app.refNumber}
          </button>
        ))}
      </div>

      {lookupResult === null && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-sm text-amber-900 dark:text-amber-200">
          Lama helin codsi leh lambarka tixraaca{' '}
          <span className="font-mono font-semibold">{refQuery}</span>. Fadlan hubi lambarkaaga.
        </div>
      )}

      {lookupResult && (
        <div className="rounded-xl bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {lookupResult.refNumber}
              </p>
              <h3 className="text-lg font-bold text-[#1E396A] dark:text-white">
                {lookupResult.businessName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {lookupResult.businessType === 'Pharmacy' ? 'Farmashiye' : 'Pharmaceutical'} ·{' '}
                {lookupResult.city} · Gudbiyay {lookupResult.submittedAt}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F6F9] dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {lookupResult.status === 'Approved' && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400" />
                  <span className="text-xs font-bold text-[#16A34A] dark:text-emerald-400">
                    Approved (La Ansixiyay)
                  </span>
                </>
              )}
              {lookupResult.status === 'Under Review' && (
                <>
                  <Clock className="h-4 w-4 text-[#396BA4] dark:text-sky-400" />
                  <span className="text-xs font-bold text-[#396BA4] dark:text-sky-400">
                    Under Review (Dib-u-eegis)
                  </span>
                </>
              )}
              {lookupResult.status === 'Submitted' && (
                <>
                  <Clock className="h-4 w-4 text-[#D97706] dark:text-amber-400" />
                  <span className="text-xs font-bold text-[#D97706] dark:text-amber-400">
                    Submitted (La Gudbiyay)
                  </span>
                </>
              )}
              {lookupResult.status === 'Rejected' && (
                <>
                  <XCircle className="h-4 w-4 text-[#DC2626] dark:text-red-400" />
                  <span className="text-xs font-bold text-[#DC2626] dark:text-red-400">
                    Rejected (La Diiday)
                  </span>
                </>
              )}
            </div>
          </div>

          {lookupResult.status === 'Rejected' && lookupResult.rejectionReason && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200">
              <span className="font-semibold">Sababta Diidmada: </span>
              {lookupResult.rejectionReason}
            </div>
          )}

          {lookupResult.status === 'Approved' && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <span>
                Hambalyo! Ganacsigaaga waa la ansixiyay waxaana loo diyaariyay koontada maamulka.
              </span>
              <button
                type="button"
                onClick={() => onNavigateRole('login')}
                className="px-4 py-1.5 rounded-full bg-[#16A34A] text-white font-semibold"
              >
                Gal Nidaamka
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100">
      {/* Navy Utility Top Strip */}
      <div className="bg-[#1E396A] dark:bg-[#0F1E3A] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Phone className="h-3.5 w-3.5 text-[#F05D21]" />
              +252 61 500 8420
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#F05D21]" />
              info@miahict.so
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#F05D21]" />
              Muqdisho, Soomaaliya
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-200">
            <button
              type="button"
              onClick={() => navigateTo('status')}
              className="hover:text-white transition-colors"
            >
              Application Status
            </button>
            <span className="opacity-40">|</span>
            <button
              type="button"
              onClick={() => navigateTo('terms')}
              className="hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </button>
            <span className="opacity-40">|</span>
            <button
              type="button"
              onClick={() => navigateTo('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#111B2E] border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="shrink-0 flex items-center focus-visible:outline-2 focus-visible:outline-[#F05D21] rounded-md"
          >
            <Logo />
          </button>

          <nav className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`text-sm font-semibold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    active
                      ? 'text-[#F05D21] border-[#F05D21]'
                      : 'text-[#1E396A] dark:text-slate-200 border-transparent hover:text-[#F05D21] dark:hover:text-[#F05D21]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <ThemeToggle variant="pill" />

            <button
              type="button"
              onClick={() => onNavigateRole('login')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-[#1E396A] dark:border-slate-600 text-[#1E396A] dark:text-slate-100 hover:bg-[#F4F6F9] dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              Login
            </button>

            <button
              type="button"
              onClick={() => navigateTo('apply')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              Apply Now
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2E] px-4 py-3 space-y-1">
            {[...NAV_ITEMS, { id: 'status' as PublicPage, label: 'Application Status' }].map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    page === item.id
                      ? 'bg-[#F4F6F9] dark:bg-slate-800 text-[#F05D21] font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {page === 'home' && (
          <>
            {/* 1. Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#F4F7FC] via-[#EDF3FB] to-[#E3ECF8] dark:from-[#0B1220] dark:via-[#0F1B31] dark:to-[#132341] pt-10 pb-20 lg:pt-14 lg:pb-24">
              <div className="pointer-events-none absolute -right-24 -top-24 h-[460px] w-[460px] rounded-full border-[28px] border-[#396BA4]/15" />
              <div className="pointer-events-none absolute right-20 -bottom-28 h-[320px] w-[320px] rounded-full border-[18px] border-[#F05D21]/20" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center relative z-10">
                <div className="lg:col-span-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-[#1E396A] dark:text-slate-100 mb-4">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#F05D21]" />
                    eClinic by MI&apos;AH ICT Solutions
                  </span>

                  <h1
                    className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#1E396A] dark:text-white leading-[1.15] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Maamul Farmashiyahaaga iyo Ganacsigaaga Pharmaceutical{' '}
                    <span className="text-[#F05D21]">Hal Nidaam.</span>
                  </h1>

                  <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                    eClinic ERP waa nidaam casri ah oo ay dhistay MI&apos;AH ICT Solutions si ay isugu xirto maamulka farmashiyeyaasha, shaybaarka bukaanada, iyo shirkadaha Pharmaceutical, kana caawiya inay si hufan u maareeyaan hawlahooda ganacsi.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => navigateTo('apply')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E396A] hover:bg-[#162b52] dark:bg-[#F05D21] dark:hover:bg-[#d94f18] text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Rocket className="h-4 w-4 text-[#F05D21] dark:text-white" />
                      Codso Hadda (Apply Now)
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-[#111B2E] border border-[#1E396A]/30 dark:border-slate-700 hover:border-[#1E396A] dark:hover:border-slate-500 text-[#1E396A] dark:text-slate-100 text-sm font-semibold transition-colors"
                    >
                      <span className="h-5 w-5 rounded-full bg-[#396BA4]/15 text-[#396BA4] dark:text-sky-400 flex items-center justify-center">
                        <Play className="h-3 w-3 fill-current" />
                      </span>
                      Daawo Hordhac
                    </button>
                  </div>
                </div>

                {/* Right Column: Interactive Dashboard Showcase + Pharmacist Hero Asset */}
                <div className="lg:col-span-6 relative">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-12 sm:col-span-8 bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                      <div className="bg-[#1E396A] px-4 py-2.5 flex items-center justify-between text-white">
                        <span className="text-xs font-semibold">eClinic ERP · Dashboard</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/15">
                          Al-Shifa
                        </span>
                      </div>
                      <div className="p-4 space-y-3 bg-[#F4F6F9] dark:bg-[#0B1220]">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-[#396BA4] text-white p-2.5">
                            <p className="text-sm font-bold tabular-nums">1,250</p>
                            <p className="text-[10px] opacity-90">Iibinta Maanta</p>
                          </div>
                          <div className="rounded-lg bg-[#16A34A] text-white p-2.5">
                            <p className="text-sm font-bold tabular-nums">850</p>
                            <p className="text-[10px] opacity-90">Kaydka Hadda</p>
                          </div>
                          <div className="rounded-lg bg-[#F05D21] text-white p-2.5">
                            <p className="text-sm font-bold tabular-nums">120</p>
                            <p className="text-[10px] opacity-90">Shaybaarka</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-7 bg-white dark:bg-[#111B2E] rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-[#1E396A] dark:text-slate-100 mb-2">
                              Iibinta Todobaadka
                            </p>
                            <div className="flex items-end gap-1.5 h-16 pt-2">
                              {[45, 65, 55, 80, 70, 95].map((h, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 rounded-t bg-[#396BA4]"
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="col-span-5 bg-white dark:bg-[#111B2E] rounded-lg p-2.5 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                            <p className="text-[10px] font-bold text-[#1E396A] dark:text-slate-100 mb-1">
                              Qaybaha
                            </p>
                            <div className="h-14 w-14 rounded-full border-[7px] border-[#1E396A] dark:border-[#396BA4] border-t-[#F05D21] border-r-[#16A34A]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block sm:col-span-4">
                      <div className="rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg h-64 bg-white dark:bg-[#111B2E]">
                        <img
                          src={HERO_IMAGE}
                          alt="Farmashiye casri ah oo adeegsanaya eClinic ERP"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Overlapping 4-Column Trust Bar */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
              <div className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-800">
                <div className="flex items-start gap-3.5 lg:pr-4">
                  <div className="h-10 w-10 rounded-xl bg-[#396BA4]/12 dark:bg-[#396BA4]/25 text-[#1E396A] dark:text-sky-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Ammaan &amp; La Isku Halayn Karo
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Xogtaada si ammaan ah ayaa loo ilaaliyaa
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 lg:pl-6 lg:pr-4">
                  <div className="h-10 w-10 rounded-xl bg-[#F05D21]/12 dark:bg-[#F05D21]/20 text-[#F05D21] flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Fudud in la Isticmaalo
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Interface casri ah oo sahlan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 lg:pl-6 lg:pr-4">
                  <div className="h-10 w-10 rounded-xl bg-[#396BA4]/12 dark:bg-[#396BA4]/25 text-[#396BA4] dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Taageero 24/7
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Koox taageero xirfad leh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 lg:pl-6">
                  <div className="h-10 w-10 rounded-xl bg-[#16A34A]/12 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                      Kobcinta Ganacsiga
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Si hufan u maamul ganacsigaaga
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. About eClinic Overview Section */}
            <section className="py-14 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-bold text-[#F05D21]">Nagu Saabsan · About eClinic</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E396A] dark:text-white">
                    Nidaamka Casriga ah ee eClinic by MI&apos;AH ICT Solutions
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    eClinic ERP waa madal ganacsi oo u gaar ah hay&apos;adaha caafimaadka, farmashiyeyaasha, iyo shirkadaha Pharmaceutical. Waxay bixisaa hal nidaam oo la isku halayn karo oo maamula iibka, kaydka daawada, dufcadaha, maaliyadda, iyo natiijooyinka shaybaarka.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                        Hadafkeena
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        In aan ganacsiyada caafimaadka u fududeyno maareynta hawlaha maalinlaha ah iyo badqabka daawada.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                        Aragtideena
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        Hoggaaminta xalalka ERP ee farmashiyeyaasha iyo shirkadaha Pharmaceutical ee gobolka.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigateTo('about')}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#396BA4] dark:text-sky-400 hover:underline"
                    >
                      Akhri Faahfaahinta About Us
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-72 shadow-sm">
                    <img
                      src={LAB_IMAGE}
                      alt="Shaybaarka iyo adeegga eClinic ERP"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Platform Features Summary (All 10 Features) */}
            <section className="py-14 lg:py-16 bg-[#F4F6F9] dark:bg-[#0F1829]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {renderSectionTitle(
                  'Astaamaha Nidaamka',
                  '10 Awoodood oo Casri ah oo Ku Jira eClinic ERP'
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {PLATFORM_FEATURES.map((f) => (
                    <div
                      key={f.title}
                      className="rounded-xl bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-4 space-y-2.5"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] flex items-center justify-center">
                        {f.icon}
                      </div>
                      <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                        {f.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigateTo('features')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1E396A] hover:bg-[#162b52] text-white text-xs font-semibold transition-colors"
                  >
                    Eeg Dhammaan Astaamaha (Features)
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* 4. Solutions Section (Pharmacy & Pharmaceutical) */}
            <section className="py-14 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {renderSectionTitle('Xalalka Aan Bixinno', 'Hal Nidaam, Labo Nooc oo Ganacsi')}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pharmacy Solution Card */}
                  <div className="rounded-2xl bg-[#EDF3FB]/75 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 grid sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-5 h-44 rounded-xl overflow-hidden bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700">
                      <img
                        src={PHARMACY_IMAGE}
                        alt="Xalka Farmashiyaha"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="sm:col-span-7 space-y-3">
                      <h3 className="text-xl font-bold text-[#1E396A] dark:text-white">
                        Xalka Farmashiyaha (Pharmacy)
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Maamul iibka POS, kaydka daawada, shaybaarka bukaanada, iyo warbixinnada maaliyadeed si casri ah oo fudud.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType('Pharmacy');
                            navigateTo('apply');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold transition-colors"
                        >
                          Codso Farmashiye
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('solutions')}
                          className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-[#1E396A] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                        >
                          Faahfaahin
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pharmaceutical Solution Card */}
                  <div className="rounded-2xl bg-[#EDF3FB]/75 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 grid sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-5 h-44 rounded-xl overflow-hidden bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700">
                      <img
                        src={PHARMACEUTICAL_IMAGE}
                        alt="Xalka Shirkadaha Pharmaceutical"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="sm:col-span-7 space-y-3">
                      <h3 className="text-xl font-bold text-[#1E396A] dark:text-white">
                        Xalka Pharmaceutical
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Maamul ganacsigaaga Pharmaceutical, kaydka bakhaarrada, iibka bulk-ga, iyo xisaabaadka macaamiisha B2B.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType('Pharmaceutical');
                            navigateTo('apply');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E396A] hover:bg-[#162b52] text-white text-xs font-semibold transition-colors"
                        >
                          Codso Pharmaceutical
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('solutions')}
                          className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-[#1E396A] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                        >
                          Faahfaahin
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. How eClinic Works (6-Step Flow) */}
            <section className="py-14 lg:py-16 bg-[#F4F6F9] dark:bg-[#0F1829]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {renderSectionTitle(
                  'Sida uu u Shaqeeyo eClinic',
                  '6 Tallaabo oo Fudud oo Ka Bilaabata Codsiga ilaa Maamulka Dashboard-ka'
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    {
                      step: '1',
                      title: 'Dooro Nooca Ganacsiga',
                      desc: 'Xulo Pharmacy ama Pharmaceutical adigoo ku salaynaya baahida xaruntaada.',
                    },
                    {
                      step: '2',
                      title: 'Buuxi Foomka Codsiga',
                      desc: 'Geli xogta ganacsiga, shatiga caafimaadka, iyo diiwaangelinta rasmiga ah.',
                    },
                    {
                      step: '3',
                      title: 'Hel Tixraac & Hubin',
                      desc: 'Hel lambarka tixraaca (APP-2026-XXXX) si aad ula socoto dib-u-eegista.',
                    },
                    {
                      step: '4',
                      title: 'Ansixinta MI’AH ICT',
                      desc: 'Super Admin ayaa hubiya shatiga ganacsiga isla markaana oggolaada codsiga.',
                    },
                    {
                      step: '5',
                      title: 'Diyaarinta Koontada',
                      desc: 'Waxaa laguu abuuraa workspace gaar ah iyo farriinta soo-dhaweynta (Email & WhatsApp).',
                    },
                    {
                      step: '6',
                      title: 'Ku Bilow Maamulka',
                      desc: 'Gal dashboard-kaaga si aad u maamusho kaydka, iibka, maaliyadda, ama shaybaarka.',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="rounded-xl bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-5 flex items-start gap-4"
                    >
                      <span className="h-9 w-9 rounded-full bg-[#1E396A] text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Business Registration / Apply Now Section */}
            <section className="py-14 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-[#EDF3FB] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-7 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-3">
                    <span className="text-xs font-bold text-[#F05D21]">
                      Diiwaangelinta Ganacsiga · Apply Now
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E396A] dark:text-white">
                      Diyaar Ma u Tahay inaad Ku Biirto eClinic ERP?
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Gudbi codsigaaga maanta haddii aad maamusho Farmashiye ama Shirkad Pharmaceutical. Kooxda MI&apos;AH ICT Solutions waxay hubinaysaa xogtaada si degdeg ah waxayna kuu furaysaa nidaamkaaga gaarka ah.
                    </p>
                  </div>
                  <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBusinessType('Pharmacy');
                        navigateTo('apply');
                      }}
                      className="px-5 py-3 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs sm:text-sm font-semibold transition-colors"
                    >
                      Codso Farmashiye
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBusinessType('Pharmaceutical');
                        navigateTo('apply');
                      }}
                      className="px-5 py-3 rounded-full bg-[#1E396A] hover:bg-[#162b52] text-white text-xs sm:text-sm font-semibold transition-colors"
                    >
                      Codso Pharmaceutical
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Application Status Section */}
            <section className="py-14 bg-[#F4F6F9] dark:bg-[#0F1829]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-3">
                  <span className="text-xs font-bold text-[#396BA4] dark:text-sky-400">
                    La Soco Codsigaaga · Application Status
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E396A] dark:text-white">
                    Hubi Heerka Codsigaaga Wakhti Kasta
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Marka aad gudbiso codsigaaga, waxaad helaysaa lambar tixraac oo u gaar ah. Ka hubi in codsigaagu marayo heerka La Gudbiyay, Dib-u-eegis, La Ansixiyay, ama Sababta Diidmada.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('status')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E396A] hover:bg-[#162b52] text-white text-xs font-semibold"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Fur Bogga Hubinta Codsiga
                  </button>
                </div>
                <div className="lg:col-span-6">
                  <div className="rounded-2xl bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <p className="text-xs font-bold text-[#1E396A] dark:text-white">
                      Hubin Degdeg ah (Quick Status Check)
                    </p>
                    <form
                      onSubmit={(e) => {
                        handleLookup(e);
                        navigateTo('status');
                      }}
                      className="flex flex-wrap gap-2.5"
                    >
                      <input
                        type="text"
                        value={refQuery}
                        onChange={(e) => setRefQuery(e.target.value)}
                        placeholder="APP-2026-1051"
                        className="flex-1 min-w-[180px] px-4 py-2 text-sm bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-full font-mono"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
                      >
                        Hubi Status
                      </button>
                    </form>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-center">
                      <span className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold">
                        Submitted
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/50 text-[#396BA4] dark:text-sky-300 font-semibold">
                        Under Review
                      </span>
                      <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-300 font-semibold">
                        Approved
                      </span>
                      <span className="px-2 py-1 rounded bg-red-50 dark:bg-red-950/50 text-[#DC2626] dark:text-red-300 font-semibold">
                        Rejected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Contact & Support Section */}
            <section className="py-14 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-3">
                  <span className="text-xs font-bold text-[#F05D21]">
                    Taageero &amp; La Xiriir · Contact Us
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E396A] dark:text-white">
                    Kooxda Taageerada MI&apos;AH ICT Solutions
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Waxaan diyaar u nahay caawinta farsamo, tababarka shaqaalaha, iyo ka jawaabidda su&apos;aalaha ku saabsan nidaamka eClinic ERP 24/7.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#396BA4] hover:bg-[#2d588a] text-white text-xs font-semibold"
                  >
                    Nala Soo Xiriir (Contact Us)
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="lg:col-span-6 grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800">
                    <Phone className="h-5 w-5 text-[#F05D21] mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Taleefanka Tooska ah</p>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white tabular-nums mt-0.5">
                      +252 61 500 8420
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800">
                    <Mail className="h-5 w-5 text-[#396BA4] dark:text-sky-400 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email-ka Taageerada</p>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white mt-0.5">
                      info@miahict.so
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800">
                    <MapPin className="h-5 w-5 text-[#1E396A] dark:text-sky-300 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Xarunta Dhexe</p>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white mt-0.5">
                      Maka Al-Mukarama, Muqdisho
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800">
                    <Headphones className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Saacadaha Adeegga</p>
                    <p className="text-sm font-bold text-[#1E396A] dark:text-white mt-0.5">
                      24/7 Taageero Joogto ah
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Frequently Asked Questions */}
            <section id="faq-section" className="py-14 bg-[#F4F6F9] dark:bg-[#0F1829]">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {renderSectionTitle(
                  "Su'aalaha Inta Badan La Isweydiiyo",
                  'Jawaabo Cad oo ku Saabsan eClinic ERP'
                )}

                <div className="space-y-3">
                  {FAQ_ITEMS.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div
                        key={faq.q}
                        className="rounded-xl bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                        >
                          <span className="flex items-center gap-2.5 text-sm font-bold text-[#1E396A] dark:text-white">
                            <HelpCircle className="h-4 w-4 text-[#F05D21] shrink-0" />
                            {faq.q}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 10. Final Call to Action */}
            <section className="py-14 bg-white dark:bg-[#0B1220]">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E396A] dark:text-white">
                  Ku Casriyeey Ganacsigaaga Caafimaadka eClinic ERP
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                  Codso koontada ganacsigaaga maanta ama gal nidaamka haddii aad horey u haysato koonto Pharmacy, Pharmaceutical, ama Super Admin.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('apply')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-sm font-semibold transition-colors"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateRole('login')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#1E396A] dark:border-slate-600 text-[#1E396A] dark:text-white hover:bg-[#F4F6F9] dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    Login to Portal
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'about' && (
          <>
            {renderSubpageBanner('Nagu Saabsan', 'About Us', HERO_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E396A] dark:text-white">
                      Waa Maxay eClinic ERP?
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      eClinic ERP waa nidaam casri ah oo ay dhistay MI&apos;AH ICT Solutions si ay isugu xirto maamulka farmashiyeyaasha, shaybaarka bukaanada, iyo shirkadaha Pharmaceutical, si loo helo adeeg hufan, amaan ah oo casri ah.
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-[#F05D21]/12 dark:bg-[#F05D21]/20 text-[#F05D21] flex items-center justify-center shrink-0">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                            Hadafkeena
                          </h3>
                          <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                            In aan taageerno ganacsiyada caafimaadka si ay u maareeyaan hawlahooda si fudud una kordhiyaan adeeggooda iyo badqabka bukaanada.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-[#396BA4]/12 dark:bg-[#396BA4]/25 text-[#396BA4] dark:text-sky-300 flex items-center justify-center shrink-0">
                          <Eye className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                            Aragtideena
                          </h3>
                          <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                            Inaan noqono hormuudka xalalka ERP ee warshadaha daawooyinka iyo xarumaha caafimaadka ee gobolka.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm h-72">
                      <img
                        src={PHARMACY_IMAGE}
                        alt="Adeegga eClinic ERP"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* Qiimayahayada Card */}
                <div className="rounded-2xl bg-[#EDF3FB]/75 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[#1E396A] dark:text-white text-center mb-6">
                    Qiimayahayada
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      {
                        icon: <ShieldCheck className="h-6 w-6 text-[#1E396A] dark:text-sky-300" />,
                        label: 'Kalsooni',
                        desc: 'Xog-ilaalin iyo isla-xisaabtan cad',
                      },
                      {
                        icon: <Lightbulb className="h-6 w-6 text-[#F05D21]" />,
                        label: 'Hal-abuurnimo',
                        desc: 'Tiknoolajiyad casri ah oo joogto ah',
                      },
                      {
                        icon: <Users className="h-6 w-6 text-[#396BA4] dark:text-sky-400" />,
                        label: 'Adeeg Wanaag',
                        desc: 'Taageero dhow oo lala garab taagan yahay',
                      },
                      {
                        icon: <TrendingUp className="h-6 w-6 text-[#16A34A] dark:text-emerald-400" />,
                        label: 'Horumar Joogto ah',
                        desc: 'Kobcin joogto ah oo ku saleysan suuqa',
                      },
                    ].map((v) => (
                      <div
                        key={v.label}
                        className="bg-white dark:bg-[#0D1628] rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center"
                      >
                        <div className="h-11 w-11 mx-auto rounded-xl bg-[#F4F6F9] dark:bg-slate-800 flex items-center justify-center mb-3">
                          {v.icon}
                        </div>
                        <h3 className="text-sm font-bold text-[#1E396A] dark:text-white">
                          {v.label}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'features' && (
          <>
            {renderSubpageBanner('Astaamaha Nidaamka', 'Features', HERO_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <p className="text-center text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                  eClinic ERP wuxuu leeyahay awoodaha casriga ah ee aad u baahan tahay si aad u maareyso ganacsigaaga daawada iyo shaybaarka si hufan.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PLATFORM_FEATURES.map((f) => (
                    <div
                      key={f.title}
                      className="rounded-2xl bg-[#EDF3FB]/70 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 flex items-start gap-4"
                    >
                      <div className="h-11 w-11 rounded-xl bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {f.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#1E396A] dark:text-white">
                          {f.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlighted Lab Feature Card */}
                <div className="rounded-2xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 h-60 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628]">
                    <img
                      src={LAB_IMAGE}
                      alt="Qaybta Shaybaarka Bukaanada"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="lg:col-span-7 space-y-3">
                    <span className="text-xs font-bold text-[#F05D21]">
                      Qayb Gaar u ah Farmashiyeyaasha
                    </span>
                    <h2 className="text-2xl font-bold text-[#1E396A] dark:text-white">
                      Nidaamka Warbixinta Shaybaarka iyo WhatsApp Delivery
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Farmashiyeyaasha leh qaybta shaybaarka waxay diiwaangelin karaan bukaanada, abuuri karaan codsiyada baaritaanka, gelin karaan natiijooyinka, daabici karaan warbixin nadiif ah, isla markaana si toos ah ugu diri karaan bukaanka iyagoo adeegsanaya WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'solutions' && (
          <>
            {renderSubpageBanner('Xalalka Ganacsiga', 'Solutions', PHARMACEUTICAL_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Pharmacy Solution */}
                  <div className="rounded-2xl bg-[#EDF3FB]/75 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="h-56 overflow-hidden">
                      <img
                        src={PHARMACY_IMAGE}
                        alt="Xalka Farmashiyaha"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-7 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1E396A] dark:text-white">
                          Xalka Farmashiyaha (Pharmacy)
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          Nidaam dhammeystiran oo loogu talagalay farmashiyeyaasha tafaariiqda iyo kuwa leh shaybaarka.
                        </p>
                        <ul className="mt-5 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Maamulka iibka iyo kaydka (POS &amp; Inventory)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Diiwaanka daawooyinka &amp; dabagalka dhicitaanka
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Diiwaangelinta bukaanada &amp; warbixinnada shaybaarka
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Warbixinno faahfaahsan &amp; amaan buuxa
                          </li>
                        </ul>
                      </div>
                      <div className="mt-7 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType('Pharmacy');
                            navigateTo('apply');
                          }}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1E396A] hover:bg-[#162b52] text-white text-xs font-semibold"
                        >
                          Codso Nidaamka Farmashiyaha
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateRole('pharmacy_admin')}
                          className="px-5 py-2.5 rounded-full bg-white dark:bg-[#0D1628] border border-slate-300 dark:border-slate-700 hover:border-[#1E396A] text-[#1E396A] dark:text-slate-100 text-xs font-semibold"
                        >
                          Daawo Dashboard-ka Farmashiyaha
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pharmaceutical Solution */}
                  <div className="rounded-2xl bg-[#EDF3FB]/75 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="h-56 overflow-hidden">
                      <img
                        src={PHARMACEUTICAL_IMAGE}
                        alt="Xalka Pharmaceutical"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-7 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1E396A] dark:text-white">
                          Xalka Pharmaceutical
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          Xalka ugu habboon ee shirkadaha Pharmaceutical, soo dejinta, iyo saadka daawada.
                        </p>
                        <ul className="mt-5 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Maamulka kaydka iyo bakhaarada waaweyn
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Iibka bulk-ga &amp; biilasha ganacsiyada (Invoices)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Maamulka macaamiisha &amp; lacagaha maqan (Receivables)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                            Warbixinno ganacsi oo dhammaystiran
                          </li>
                        </ul>
                      </div>
                      <div className="mt-7 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessType('Pharmaceutical');
                            navigateTo('apply');
                          }}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
                        >
                          Codso Nidaamka Pharmaceutical
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateRole('pharmaceutical_admin')}
                          className="px-5 py-2.5 rounded-full bg-white dark:bg-[#0D1628] border border-slate-300 dark:border-slate-700 hover:border-[#1E396A] text-[#1E396A] dark:text-slate-100 text-xs font-semibold"
                        >
                          Daawo Dashboard-ka Pharmaceutical
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Full-Width Highlight Pill */}
                <div className="rounded-xl bg-[#EDF3FB] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-center gap-3 text-center">
                  <CheckCircle2 className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                  <p className="text-sm font-bold text-[#1E396A] dark:text-white">
                    eClinic ERP – Xalka Dhammaystiran ee Maamulka Farmashiyeyaasha &amp; Shirkadaha Pharmaceutical
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'contact' && (
          <>
            {renderSubpageBanner('Nala Soo Xiriir', 'Contact Us', HERO_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1E396A] dark:text-white">
                      Waxaan diyaar u nahay inaan ka jawaabno su&apos;aalahaaga iyo codsiyadaada.
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      La xiriir kooxda MI&apos;AH ICT Solutions si aad u hesho faahfaahin, tababar, ama kaalmo farsamo.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-[#1E396A] text-white flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                        +252 61 500 8420
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-[#396BA4] text-white flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        info@miahict.so
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-[#F05D21] text-white flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Maka Al-Mukarama, Muqdisho, Soomaaliya
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                        <Headphones className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        24/7 Taageero
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="rounded-2xl bg-[#EDF3FB]/70 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-[#1E396A] dark:text-white">
                      Fariin Noogu Dir
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Waxaan kaaga soo jawaabi doonaa 24 saac gudahood.
                    </p>

                    {contactSuccess && (
                      <div className="mt-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                            Fariintaada si guul leh ayaa loo gudbiyay!
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">
                            Waad ku mahadsan tahay la xiriirka MI&apos;AH ICT Solutions.
                          </p>
                        </div>
                      </div>
                    )}

                    {contactError && (
                      <div className="mt-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-[#DC2626] dark:text-red-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{contactError}</span>
                      </div>
                    )}

                    <form onSubmit={handleContactSubmit} className="mt-5 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Magaca oo Buuxa *"
                          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                        />
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="Email-ka *"
                          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="Lambarka Taleefanka (+252...) *"
                          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                        />
                        <input
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          placeholder="Mawduuca *"
                          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                        />
                      </div>

                      <textarea
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Fariintaada *"
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                      />

                      <button
                        type="submit"
                        className="w-full py-3 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        Dir Fariin
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'apply' && (
          <>
            {renderSubpageBanner('Codso Hadda', 'Apply Now', PHARMACY_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="inline-flex items-center gap-2">
                    <span className="px-4 py-2 rounded-full bg-[#1E396A] text-white text-xs font-semibold">
                      Foomka Codsiga Ganacsiga
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateTo('status')}
                      className="px-4 py-2 rounded-full bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[#1E396A] dark:text-slate-200 hover:border-[#396BA4]"
                    >
                      Hubi Heerka Codsiga (Status)
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  {/* Left Guidance Column */}
                  <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-2xl font-bold text-[#1E396A] dark:text-white">
                      Buuxi foomkan si aad u codsato inaad ku biirto eClinic ERP.
                    </h2>

                    <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Xogtaada si ammaan ah ayaa loo ilaaliyaa</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Waxa la hubiyaa oo la xaqiijinayaa shatiga ganacsiga</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Waxaad heli doontaa jawaab iyo tixraac degdeg ah</span>
                      </li>
                    </ul>

                    <div className="rounded-xl bg-[#EDF3FB] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
                      <FileCheck2 className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-[#1E396A] dark:text-slate-200 font-medium leading-relaxed">
                        Kadib marka aad codsato, waxaan ku soo wargelin doonaa Email iyo WhatsApp, waxaadna bogga Application Status ka hubin kartaa heerka codsigaaga.
                      </p>
                    </div>
                  </div>

                  {/* Right Application Form */}
                  <div className="lg:col-span-8 rounded-2xl bg-[#EDF3FB]/70 dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-[#1E396A] dark:text-white mb-5">
                      Foomka Codsiga
                    </h3>

                    {submittedApp && (
                      <div className="mb-6 p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                              Codsigaaga waa la gudbiyay!
                            </h4>
                            <p className="mt-1 text-xs text-emerald-900 dark:text-emerald-200">
                              Waxaa la diiwaangeliyay codsigaaga{' '}
                              <span className="font-semibold">{submittedApp.businessName}</span> (
                              {submittedApp.businessType === 'Pharmacy'
                                ? 'Farmashiye'
                                : 'Pharmaceutical'}
                              ).
                            </p>
                            <div className="mt-3 p-3 rounded-lg bg-white dark:bg-[#0D1628] border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Lambarka Tixraaca Codsiga
                                </p>
                                <p className="text-base font-bold font-mono text-[#1E396A] dark:text-white tabular-nums">
                                  {submittedApp.refNumber}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => navigateTo('status')}
                                className="px-4 py-1.5 rounded-full bg-[#1E396A] text-white text-xs font-semibold hover:bg-[#162b52]"
                              >
                                Eeg Heerka Codsiga
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Business Type Toggle */}
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-[#1E396A] dark:text-slate-200 mb-2">
                        Nooca Ganacsiga *
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setBusinessType('Pharmacy')}
                          className={`p-3.5 rounded-xl border text-left bg-white dark:bg-[#0D1628] transition-colors ${
                            businessType === 'Pharmacy'
                              ? 'border-[#F05D21] ring-2 ring-[#F05D21]/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <p className="text-sm font-bold text-[#1E396A] dark:text-white">
                            Pharmacy (Farmashiye)
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            POS, kaydka daawada, iibsadka, iyo shaybaarka.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBusinessType('Pharmaceutical')}
                          className={`p-3.5 rounded-xl border text-left bg-white dark:bg-[#0D1628] transition-colors ${
                            businessType === 'Pharmaceutical'
                              ? 'border-[#1E396A] dark:border-[#396BA4] ring-2 ring-[#1E396A]/20 dark:ring-[#396BA4]/30'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <p className="text-sm font-bold text-[#1E396A] dark:text-white">
                            Pharmaceutical
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            Bakhaarka weyn, iibka bulk-ga &amp; deymaha B2B.
                          </p>
                        </button>
                      </div>
                    </div>

                    {applyError && (
                      <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-[#DC2626] dark:text-red-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{applyError}</span>
                      </div>
                    )}

                    <form onSubmit={handleApplySubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {businessType === 'Pharmacy'
                              ? 'Magaca Farmashiyaha *'
                              : 'Magaca Shirkadda Pharmaceutical *'}
                          </label>
                          <input
                            type="text"
                            value={applyForm.businessName}
                            onChange={(e) =>
                              setApplyForm({ ...applyForm, businessName: e.target.value })
                            }
                            placeholder={
                              businessType === 'Pharmacy'
                                ? 'Al-Shifa Modern Pharmacy'
                                : 'Benaadir Pharmaceutical Supply'
                            }
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Magaca Milkiilaha / Wakiilka *
                          </label>
                          <input
                            type="text"
                            value={applyForm.ownerName}
                            onChange={(e) =>
                              setApplyForm({ ...applyForm, ownerName: e.target.value })
                            }
                            placeholder="Dr. / Mudane / Marwo ..."
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Email-ka *
                          </label>
                          <input
                            type="email"
                            value={applyForm.email}
                            onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                            placeholder="admin@ganacsiga.so"
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Lambarka Taleefanka *
                          </label>
                          <input
                            type="tel"
                            value={applyForm.phone}
                            onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                            placeholder="+252 61 ..."
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Magaalada *
                          </label>
                          <select
                            value={applyForm.city}
                            onChange={(e) => setApplyForm({ ...applyForm, city: e.target.value })}
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          >
                            <option value="Mogadishu">Mogadishu</option>
                            <option value="Hargeisa">Hargeisa</option>
                            <option value="Garowe">Garowe</option>
                            <option value="Bosaso">Bosaso</option>
                            <option value="Kismayo">Kismayo</option>
                            <option value="Baidoa">Baidoa</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Cinwaanka Goobta Ganacsiga *
                          </label>
                          <input
                            type="text"
                            value={applyForm.address}
                            onChange={(e) =>
                              setApplyForm({ ...applyForm, address: e.target.value })
                            }
                            placeholder="Degmada, Wadada, iyo Aagga"
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Diiwaangelinta Ganacsiga *
                          </label>
                          <input
                            type="text"
                            value={applyForm.registrationNumber}
                            onChange={(e) =>
                              setApplyForm({
                                ...applyForm,
                                registrationNumber: e.target.value,
                              })
                            }
                            placeholder="SOM-REG-XXXXX"
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {businessType === 'Pharmacy'
                              ? 'Shatiga Farmashiyaha (MOH) *'
                              : 'Shatiga Pharmaceutical (MOH) *'}
                          </label>
                          <input
                            type="text"
                            value={applyForm.licenseNumber}
                            onChange={(e) =>
                              setApplyForm({ ...applyForm, licenseNumber: e.target.value })
                            }
                            placeholder={
                              businessType === 'Pharmacy' ? 'MOH-PH-2026-XXX' : 'MOH-PM-2026-XXX'
                            }
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {businessType === 'Pharmacy'
                              ? 'Laamaha & Shaybaarka'
                              : 'Baaxadda Bakhaarka'}
                          </label>
                          <input
                            type="text"
                            value={applyForm.facilityDetail}
                            onChange={(e) =>
                              setApplyForm({ ...applyForm, facilityDetail: e.target.value })
                            }
                            placeholder={
                              businessType === 'Pharmacy'
                                ? '1 Farmashiye + Shaybaar'
                                : '1,000 m² Bakhaar'
                            }
                            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                          />
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={applyForm.notes}
                        onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                        placeholder="Faahfaahin dheeraad ah (Ikhtiyaari)"
                        className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#0D1628] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#396BA4]"
                      />

                      <button
                        type="submit"
                        className="w-full py-3 rounded-full bg-[#F05D21] hover:bg-[#d94f18] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        Gudbi Codsiga
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'status' && (
          <>
            {renderSubpageBanner('Heerka Codsiga', 'Application Status', HERO_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderStatusLookupCard()}
              </div>
            </section>
          </>
        )}

        {page === 'privacy' && (
          <>
            {renderSubpageBanner('Siyaasadda Asturnaanta', 'Privacy Policy', HERO_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="rounded-2xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-7 space-y-4">
                  <h2 className="text-xl font-bold text-[#1E396A] dark:text-white">
                    Ilaalinta Xogta &amp; Sirta Ganacsiga ee eClinic ERP
                  </h2>
                  <p>
                    MI&apos;AH ICT Solutions waxay ilaalisaa sirta iyo amniga xogta ganacsi kasta oo ku jira madasha eClinic ERP. Xogta farmashiyaha, shirkadda Pharmaceutical, iyo diiwaanka bukaanada waa kuwo si buuxda u kala xiran (Multi-Tenant Isolation).
                  </p>
                  <p>
                    Xogta bukaanka iyo warbixinnada shaybaarka waxaa heli kara oo keliya maamulka farmashiyaha xaq u leh. Sirta furaha (Passwords) laguma keydiyo qaab qoraal cad ah (plaintext), waxaana la adeegsadaa habab sugnaan sare leh.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'terms' && (
          <>
            {renderSubpageBanner('Shuruudaha Adeegga', 'Terms & Conditions', HERO_IMAGE)}
            <section className="py-12 lg:py-16 bg-white dark:bg-[#0B1220]">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="rounded-2xl bg-[#F4F6F9] dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 p-7 space-y-4">
                  <h2 className="text-xl font-bold text-[#1E396A] dark:text-white">
                    Shuruudaha Isticmaalka Madasha eClinic ERP
                  </h2>
                  <p>
                    Isticmaalka madasha eClinic ERP wuxuu ku xiran yahay ansixinta diiwaangelinta ganacsiga iyo shatiga caafimaadka ee rasmiga ah ee uu bixiyo maamulka caafimaadka.
                  </p>
                  <p>
                    Ganacsi kastaa wuxuu mas&apos;uul ka yahay sugnaanta gelinta dufcadaha daawada, taariikhda dhicitaanka, iibka, iyo xisaabaadka gudaha. Koontada maamulka waxaa u furan keliya wakiilka la xaqiijiyay.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Dugsiiye-inspired Premium 4-Column Upper Footer + Modest Brand Wordmark Bottom Footer */}
      <footer className="bg-[#1E396A] dark:bg-[#0F1E3A] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
            {/* Brand Summary Column */}
            <div className="lg:col-span-4 space-y-4">
              <Logo variant="footer" />
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                eClinic ERP by MI&apos;AH ICT Solutions — Madal dhameystiran oo loogu talagalay maamulka Farmashiyeyaasha, Shaybaarka Bukaanada, iyo Shirkadaha Pharmaceutical.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#F05D21]" />
                  +252 61 500 8420
                </span>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#F05D21]" />
                  info@miahict.so
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {['FB', 'LI', 'YT', 'X'].map((social) => (
                  <button
                    key={social}
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="h-8 w-8 rounded-full border border-white/20 text-[11px] font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 1: Platform */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button type="button" onClick={() => navigateTo('home')} className="hover:text-white">
                    Home
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('about')} className="hover:text-white">
                    About Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('features')} className="hover:text-white">
                    Features
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('solutions')} className="hover:text-white">
                    Solutions
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Business Solutions */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Business Solutions
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessType('Pharmacy');
                      navigateTo('solutions');
                    }}
                    className="hover:text-white"
                  >
                    Pharmacy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessType('Pharmaceutical');
                      navigateTo('solutions');
                    }}
                    className="hover:text-white"
                  >
                    Pharmaceutical
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('apply')} className="hover:text-white">
                    Apply Now
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('status')} className="hover:text-white">
                    Application Status
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Support</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button type="button" onClick={() => navigateTo('contact')} className="hover:text-white">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('contact')} className="hover:text-white">
                    Help and Support
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo('home');
                      setTimeout(() => {
                        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 80);
                    }}
                    className="hover:text-white"
                  >
                    Frequently Asked Questions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateRole('login')}
                    className="hover:text-white"
                  >
                    Portal Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Legal</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button type="button" onClick={() => navigateTo('privacy')} className="hover:text-white">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('terms')} className="hover:text-white">
                    Terms &amp; Conditions
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer Bar with Modest Brand Wordmark */}
          <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-200 font-medium">
                © 2026 MI&apos;AH ICT Solutions. Dhammaan Xuquuqaha Way Ila Xafidanyihiin.
              </p>
              <p className="text-[11px] text-slate-300">
                eClinic ERP — Nidaamka Maamulka Farmashiyeyaasha &amp; Shirkadaha Pharmaceutical.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                eClinic
              </span>
              <span className="text-xs text-slate-300">by MI&apos;AH ICT Solutions</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Demo Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Daawo Hordhaca Nidaamka eClinic ERP"
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Dooro mid ka mid ah koontooyinka maamulka si aad u sahamiso awoodaha nidaamka eClinic ERP:
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setPreviewOpen(false);
                onNavigateRole('super_admin');
              }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#1E396A] dark:hover:border-[#396BA4] text-left bg-[#F4F6F9] dark:bg-[#0D1628]"
            >
              <Building2 className="h-5 w-5 text-[#1E396A] dark:text-sky-300 mb-2" />
              <p className="text-xs font-bold text-[#1E396A] dark:text-white">
                Super Admin
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Ansixinta codsiyada &amp; maamulka tenants-ka
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewOpen(false);
                onNavigateRole('pharmacy_admin');
              }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#F05D21] text-left bg-[#F4F6F9] dark:bg-[#0D1628]"
            >
              <ShoppingCart className="h-5 w-5 text-[#F05D21] mb-2" />
              <p className="text-xs font-bold text-[#1E396A] dark:text-white">Pharmacy Admin</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                POS, kaydka, dhicitaanka &amp; shaybaarka
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewOpen(false);
                onNavigateRole('pharmaceutical_admin');
              }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#396BA4] text-left bg-[#F4F6F9] dark:bg-[#0D1628]"
            >
              <Warehouse className="h-5 w-5 text-[#396BA4] dark:text-sky-400 mb-2" />
              <p className="text-xs font-bold text-[#1E396A] dark:text-white">
                Pharmaceutical Admin
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Bakhaarka, iibka bulk-ga &amp; receivables
              </p>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
