import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Shield,
  BookOpen,
  Scale,
  FileCheck2,
  Award,
  Leaf,
  Globe,
  LogIn,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Search,
  FileText
} from 'lucide-react';

export const LandingPage = ({ onNavigateLogin, onNavigateRegister, onStartAnalysis }) => {
  const { lang, setLang, t } = useTranslation();
  const { user, updateUserLanguage } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeStatuteTab, setActiveStatuteTab] = useState('patents');

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'हिं' },
    { code: 'mr', label: 'मराठी', short: 'मरा' }
  ];

  const handleAnalyzeClick = () => {
    if (user) {
      onStartAnalysis?.();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLanguageChange = (code) => {
    if (updateUserLanguage) {
      updateUserLanguage(code);
    } else {
      setLang(code);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Primary Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0F2A4A]/95 backdrop-blur-md border-b border-amber-500/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">IP-SAKTI SAHAYAK</span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block line-clamp-1">
                {lang === 'hi'
                  ? 'आयुर्वेद बौद्धिक संपदा एवं विनियामक मार्गदर्शन सहायक'
                  : lang === 'mr'
                  ? 'आयुर्वेद बौद्धिक संपदा व विनियामक मार्गदर्शन सहाय्यक'
                  : 'Ayurveda Intellectual Property & Regulatory Guidance Assistant'}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector & Auth CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Language Selector Bar */}
            <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-700">
              <Globe className="w-3.5 h-3.5 ml-1 mr-1 text-slate-400 hidden sm:inline" />
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageChange(l.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    lang === l.code
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'लॉग इन' : lang === 'mr' ? 'लॉग इन' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="hidden sm:flex px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition cursor-pointer items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पंजीकरण करें' : lang === 'mr' ? 'नोंदणी करा' : 'Register'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            IP-SAKTI SAHAYAK
          </h1>

          <p className="text-base sm:text-xl font-semibold text-amber-300 max-w-3xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'आयुर्वेद के लिए बौद्धिक संपदा, पारंपरिक ज्ञान एवं विनियामक मार्गदर्शन हेतु बहुभाषी एआई सहायक'
              : lang === 'mr'
              ? 'आयुर्वेदासाठी बौद्धिक संपदा, पारंपारिक ज्ञान व विनियामक मार्गदर्शनासाठी बहुभाषिक एआय सहाय्यक'
              : 'Multilingual AI Assistant for Intellectual Property, Traditional Knowledge and Regulatory Guidance for Ayurveda'}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'सत्यापित वैधानिक नियमों, आयुष संहिताओं, पेटेंट अधिनियम 1970 की धारा 3(p) व 3(e), जैव विविधता अधिनियम 2002 और टीकेडीएल (TKDL) पूर्व कला संग्रह पर आधारित आधिकारिक निर्णय सहायता।'
              : lang === 'mr'
              ? 'सत्यापित कायदेशीर नियम, आयुष संहिता, पेटंट कायदा १९७० चे कलम ३(p) व ३(e), जैविक विविधता कायदा २००२ आणि टीकेडीएल पूर्व कला संदर्भांवर आधारित अधिकृत निर्णय सहाय्य.'
              : 'A citation-grounded statutory decision support system designed to evaluate patentability, traditional knowledge prior art (TKDL), ABS mandates under the Biological Diversity Act 2002, and regulatory licensing pathways for Ayurvedic formulations.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <FileCheck2 className="w-4 h-4 text-slate-950" />
              <span>{lang === 'hi' ? 'उत्पाद का विश्लेषण करें' : lang === 'mr' ? 'उत्पादनाचे विश्लेषण करा' : 'Analyze a Formulation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('statutory-framework-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'वैधानिक रूपरेखा देखें' : lang === 'mr' ? 'कायदेशीर चौकट पहा' : 'Explore Statutory Framework'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'hi' ? 'शून्य भ्रम (No Hallucination)' : lang === 'mr' ? 'अचूक कायदेशीर पुरावा' : 'Zero Hallucination'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'सत्यापित विधिक साक्ष्य' : lang === 'mr' ? 'सत्यापित कायदेशीर पुरावा' : 'Grounded Citations'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'hi' ? '7 विधिक श्रेणियां' : lang === 'mr' ? '७ कायदेशीर वर्ग' : '7 Statutory Classes'}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 6 Key Statutory Capabilities Grid */}
      <section className="py-12 bg-slate-950/60 border-y border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              {lang === 'hi' ? 'प्रमुख क्षमताएं एवं सुरक्षा' : lang === 'mr' ? 'प्रमुख वैशिष्ट्ये व सुरक्षा' : 'Core Statutory Capabilities'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'hi'
                ? 'आयुर्वेद के लिए व्यापक विधिक एवं विनियामक सुरक्षा'
                : lang === 'mr'
                ? 'आयुर्वेदासाठी सर्वसमावेशक कायदेशीर व विनियामक संरक्षण'
                : 'Comprehensive Legal & Regulatory Decision Engine'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {lang === 'hi'
                ? 'प्रामाणिक संहिताओं एवं सरकारी राजपत्रों से सीधे उद्धृत साक्ष्यों द्वारा समर्थित।'
                : lang === 'mr'
                ? 'प्रमाणित संहिता आणि सरकारी राजपत्रांमधील पुराव्यांवर थेट आधारित.'
                : 'Anchored directly in codified pharmacopoeias, gazette notifications, and statutory rules.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: 7-Category Product Classification */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'hi' ? '7 वैधानिक श्रेणियों में वर्गीकरण' : lang === 'mr' ? '७ वैधानिक प्रकारांमध्ये वर्गीकरण' : '7-Category Formulation Classification'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'शास्त्रीय औषधि, प्रोप्रायटरी औषधि, फाइटोफार्मास्युटिकल, आयुर्वेद आहार, कॉस्मेटिक, नई दवा और अनिश्चित/मानव समीक्षा में सटीक वर्गीकरण।'
                  : lang === 'mr'
                  ? 'शास्त्रीय औषध, प्रोप्रायटरी औषध, फायटोफार्मास्युटिकल, आयुर्वेद आहार, कॉस्मेटिक, नवीन औषध आणि मानवी पडताळणीमध्ये अचूक वर्गीकरण.'
                  : 'Deterministic classification across Classical Medicine, Proprietary, Phytopharmaceutical, Ayurveda Aahar, Cosmetic, New Drug, and Uncertain cases.'}
              </p>
              <div className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1 pt-1">
                <span>Drugs and Cosmetics Act, 1940</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 2: 7 IP Protection Pathways */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'hi' ? '7 बौद्धिक संपदा (IP) संरक्षण मार्ग' : lang === 'mr' ? '७ बौद्धिक संपदा (IP) संरक्षण मार्ग' : '7 IP Protection Regimes'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'पेटेंट (धारा 3(p) व 3(e) जांच), ट्रेडमार्क, कॉपीराइट, औद्योगिक डिजाइन, जीआई, पादप किस्म और पारंपरिक ज्ञान का एक साथ मूल्यांकन।'
                  : lang === 'mr'
                  ? 'पेटंट (कलम ३(p) व ३(e) तपासणी), ट्रेडमार्क, कॉपीराइट, डिझाइन, जीआय आणि पारंपारिक ज्ञानाचे एकाच वेळी मूल्यांकन.'
                  : 'Multi-regime evaluation covering Patents, Trademarks, Copyrights, Industrial Designs, GIs, Plant Variety, and Prior Art defense.'}
              </p>
              <div className="text-[11px] font-semibold text-blue-400 flex items-center space-x-1 pt-1">
                <span>The Patents Act 1970 • Trade Marks Act 1999</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 3: ABS & Regulatory Compliance */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'hi' ? 'जैव विविधता (ABS) एवं एनबीए अनुपालन' : lang === 'mr' ? 'जैविक विविधता (ABS) व एनबीए अनुपालन' : 'ABS & Regulatory Compliance'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'राष्ट्रीय जैव विविधता प्राधिकरण (NBA फॉर्म 1 व 3), राज्य जैव विविधता बोर्ड (धारा 7 पूर्व सूचना) और शेड्यूल T GMP का पूर्ण आकलन।'
                  : lang === 'mr'
                  ? 'राष्ट्रीय जैवविविधता प्राधिकरण (NBA फॉर्म १ व ३), राज्य जैवविविधता मंडळ (कलम ७ पूर्वसूचना) आणि शेड्यूल T GMP चे संपूर्ण मूल्यांकन.'
                  : 'Automated evaluation for National Biodiversity Authority (Form 1 & 3), SBB Section 7 intimation, and Schedule T GMP manufacturing licenses.'}
              </p>
              <div className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1 pt-1">
                <span>Biological Diversity Act, 2002</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 4: TKDL Prior-Art Screening */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'hi' ? 'टीकेडीएल (TKDL) एवं पूर्व कला जांच' : lang === 'mr' ? 'टीकेडीएल व पूर्व कला तपासणी' : 'TKDL & Traditional Knowledge Screening'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'चरक, सुश्रुत और अष्टांग हृदय संहिताओं के आधार पर पारंपरिक ज्ञान के सार्वजनिक अधिकार की रक्षा और बायोपायरेसी की रोकथाम।'
                  : lang === 'mr'
                  ? 'चरक, सुश्रुत आणि अष्टांग हृदय संहितेच्या आधारे पारंपारिक ज्ञानाचे सार्वजनिक संरक्षण व बायोपायरसी रोखणे.'
                  : 'Defends public domain Ayurveda against biopiracy and invalid patent claims by screening against 54 Schedule 1 Samhitas and TKDL.'}
              </p>
              <div className="text-[11px] font-semibold text-orange-400 flex items-center space-x-1 pt-1">
                <span>Section 3(p) Non-Patentability Bar</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 5: Citation-Grounded RAG */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'hi' ? 'सत्यापित उद्धरण-आधारित आरएजी' : lang === 'mr' ? 'अधिकृत संदर्भ-आधारित आरएजी' : 'Citation-Grounded RAG Engine'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'हर निष्कर्ष के साथ सटीक विधिक अधिनियम, धारा, उप-धारा, सरकारी राजपत्र और आधिकारिक स्रोत का सत्यापित उद्धरण।'
                  : lang === 'mr'
                  ? 'प्रत्येक निष्कर्षासोबत अचूक कायदेशीर कायदा, कलम, उप-कलम आणि अधिकृत राजपत्राचा संदर्भ.'
                  : 'Every AI finding is visibly backed by official statutes, rules, gazettes, section numbers, and verified government portal links.'}
              </p>
              <div className="text-[11px] font-semibold text-purple-400 flex items-center space-x-1 pt-1">
                <span>Qdrant Vector Database • Ayush Legal Corpus</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 6: Human Facilitator Escalation */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'hi' ? 'मानव सुविधा प्रदाता समीक्षा एवं केस डोजियर' : lang === 'mr' ? 'तज्ज्ञ मानवी पडताळणी व केस डॉझियर' : 'Case Dossier & Facilitator Review'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'जटिल या संदिग्ध मामलों में स्वचालित वैधानिक केस डोजियर (PDF निर्यात) तैयार कर पंजीकृत आयुष पेटेंट वकीलों को समीक्षा हेतु अग्रेषित करना।'
                  : lang === 'mr'
                  ? 'गुंतागुंतीच्या प्रकरणांमध्ये वैधानिक केस डॉझियर (PDF निर्यात) तयार करून अधिकृत आयुष पेटंट वकिलांकडे पाठवणे.'
                  : 'Generates structured statutory Case Dossiers (downloadable in PDF) with seamless escalation to certified Ayush patent facilitators.'}
              </p>
              <div className="text-[11px] font-semibold text-rose-400 flex items-center space-x-1 pt-1">
                <span>Certified Facilitator Workflow</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Statutory Explorer (Viewable without logging in) */}
      <section id="statutory-framework-section" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              {lang === 'hi' ? 'सार्वजनिक विधिक संदर्भ' : lang === 'mr' ? 'सार्वजनिक कायदेशीर संदर्भ' : 'Public Statutory Explorer'}
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">
              {lang === 'hi' ? 'सत्यापित आयुर्वेदिक वैधानिक संग्रह' : lang === 'mr' ? 'सत्यापित आयुर्वेदिक कायदेशीर संग्रह' : 'Verified Ayurvedic Statutory Regimes'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'hi'
                ? 'सार्वजनिक उपयोग हेतु उपलब्ध विधिक नियम (बिना लॉगिन के देखा जा सकता है)'
                : lang === 'mr'
                ? 'सार्वजनिक माहितीसाठी उपलब्ध कायदे (लॉगिन न करता वाचता येते)'
                : 'Public statutory information accessible to all researchers without authentication'}
            </p>
          </div>

          {/* Statute Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStatuteTab('patents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeStatuteTab === 'patents' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Patents Act 1970
            </button>
            <button
              type="button"
              onClick={() => setActiveStatuteTab('bda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeStatuteTab === 'bda' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              BDA 2002
            </button>
            <button
              type="button"
              onClick={() => setActiveStatuteTab('dnc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeStatuteTab === 'dnc' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              D&C Act 1940
            </button>
            <button
              type="button"
              onClick={() => setActiveStatuteTab('aahar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeStatuteTab === 'aahar' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ayurveda Aahar
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          {activeStatuteTab === 'patents' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-white">The Patents Act, 1970 (as amended)</h3>
                  <p className="text-xs text-amber-400">Jurisdiction: India • Controlling Authority: Controller General of Patents (CGPDTM)</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                  IP Regime
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 block text-sm">Section 3(p) — Traditional Knowledge Non-Patentability Bar</span>
                  <p className="text-slate-300 leading-relaxed">
                    An invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable.
                  </p>
                  <span className="text-[11px] text-slate-500 block pt-1">Prevents biopiracy of classical formulations codified in the 54 First Schedule Ayurvedic Samhitas.</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 block text-sm">Section 3(e) — Synergistic Efficacy Requirement</span>
                  <p className="text-slate-300 leading-relaxed">
                    A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof is not patentable.
                  </p>
                  <span className="text-[11px] text-slate-500 block pt-1">Ayurvedic proprietary formulations must experimentally prove synergistic interaction (CI &lt; 1) beyond mere additive mixing.</span>
                </div>
              </div>
            </div>
          )}

          {activeStatuteTab === 'bda' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-white">Biological Diversity Act, 2002 (as amended 2023)</h3>
                  <p className="text-xs text-emerald-400">Controlling Authority: National Biodiversity Authority (NBA) & State Biodiversity Boards (SBB)</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                  ABS Regime
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">Section 3 — Foreign Entity Approval (Form I)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Non-Indian individuals or foreign-equity entities must obtain prior approval from NBA before accessing Indian biological resources.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">Section 6 — Prior NBA Approval for IP (Form III)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Mandatory approval from NBA prior to applying for or obtaining any intellectual property right inside or outside India based on Indian biological resources.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">Section 7 — SBB Prior Intimation</span>
                  <p className="text-slate-300 leading-relaxed">
                    Indian commercial manufacturers must give prior intimation to the concerned State Biodiversity Board before commercial access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStatuteTab === 'dnc' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-white">Drugs and Cosmetics Act, 1940 & Rules, 1945</h3>
                  <p className="text-xs text-blue-400">Controlling Authority: State Licensing Authority (Ayush)</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 text-xs font-mono font-bold border border-blue-500/30">
                  Manufacturing License
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-blue-400 block">Section 3(a) & 3(h) — Classical vs Proprietary</span>
                  <p className="text-slate-300 leading-relaxed">
                    Section 3(a) defines classical medicines conforming strictly to First Schedule Samhitas. Section 3(h) defines proprietary medicines using Ayurvedic ingredients with modified recipes or modern dosage forms.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-blue-400 block">Rule 158B & Schedule T GMP</span>
                  <p className="text-slate-300 leading-relaxed">
                    Rule 158B mandates safety pilot studies for proprietary medicines. Schedule T prescribes strict Good Manufacturing Practices for premise hygiene, equipment, quality control, and testing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStatuteTab === 'aahar' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-white">Food Safety & Standards (Ayurveda Aahar) Regulations, 2022</h3>
                  <p className="text-xs text-purple-400">Controlling Authority: Food Safety and Standards Authority of India (FSSAI)</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 text-xs font-mono font-bold border border-purple-500/30">
                  Dietary Wellness
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-purple-400 block">Regulation 3 & Schedule IV Mandates</span>
                <p className="text-slate-300 leading-relaxed">
                  Ayurveda Aahar covers food preparations prepared in accordance with recipes or processes described in authoritative books of Ayurveda. Must display the official Ayurveda Aahar Logo and carry the statutory warning: "FOR DIETARY USE ONLY - NOT FOR MEDICINAL USE". Cannot make disease curative claims.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mandatory Statutory Advisory & Disclaimer */}
      <section className="py-8 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 text-xs leading-relaxed flex items-start space-x-3 shadow-md">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">
              {lang === 'hi' ? 'वैधानिक सलाह एवं विधिक सूचना' : lang === 'mr' ? 'कायदेशीर सल्ला व सूचना' : 'Statutory Advisory & Research Limitation Notice'}
            </h4>
            <p>
              {lang === 'hi'
                ? 'यह प्रणाली केवल उद्धृत आधिकारिक स्रोतों पर आधारित सूचना और अनुसंधान सहायता प्रदान करती है। यह पेशेवर कानूनी सलाह अथवा विनियामक प्राधिकरणों (NBA, SLA, CDSCO, CGPDTM) के आधिकारिक निर्णयों का स्थान नहीं लेती है।'
                : lang === 'mr'
                ? 'ही प्रणाली केवळ अधिकृत संदर्भांवर आधारित माहिती आणि संशोधन सहाय्य पुरवते. हे व्यावसायिक कायदेशीर सल्ला किंवा अधिकृत नियामक निर्णयांचा पर्याय नाही.'
                : 'This system provides information and research assistance based strictly on cited statutory sources and codified reference corpora. It does not replace professional legal advice or official regulatory decisions.'}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#071524] border-t border-slate-800 py-6 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-white">IP-SAKTI SAHAYAK</span>
          </div>
          <div className="flex items-center space-x-4">
            <button type="button" onClick={onNavigateLogin} className="hover:text-amber-400 transition cursor-pointer">
              {lang === 'hi' ? 'लॉग इन' : lang === 'mr' ? 'लॉग इन' : 'Sign In'}
            </button>
            <button type="button" onClick={onNavigateRegister} className="hover:text-amber-400 transition cursor-pointer">
              {lang === 'hi' ? 'पंजीकरण' : lang === 'mr' ? 'नोंदणी' : 'Register'}
            </button>
            <button type="button" onClick={handleAnalyzeClick} className="text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer">
              {lang === 'hi' ? 'विश्लेषण' : lang === 'mr' ? 'विश्लेषण' : 'Analyze'}
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication Required Modal (When unauthenticated visitor clicks Analyze) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/70 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">
                {lang === 'hi' ? 'लॉगिन अथवा पंजीकरण आवश्यक है' : lang === 'mr' ? 'लॉगिन किंवा नोंदणी आवश्यक आहे' : 'Authentication Required'}
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                {lang === 'hi'
                  ? 'उत्पाद का विश्लेषण करने के लिए कृपया लॉगिन अथवा पंजीकरण करें।'
                  : lang === 'mr'
                  ? 'उत्पादनाचे विश्लेषण करण्यासाठी कृपया लॉगिन किंवा नोंदणी करा.'
                  : 'Please login or register to analyze a product.'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {lang === 'hi'
                  ? 'विधिक सुरक्षा, उपयोगकर्ता डेटा अलगाव एवं आधिकारिक केस डोजियर निर्माण हेतु विश्लेषण केवल पंजीकृत उपयोगकर्ताओं के लिए उपलब्ध है।'
                  : lang === 'mr'
                  ? 'कायदेशीर सुरक्षितता, वापरकर्ता डेटा गोपनीयता आणि केस डॉझियर निर्मितीसाठी विश्लेषण केवळ नोंदणीकृत वापरकर्त्यांसाठी उपलब्ध आहे.'
                  : 'Product formulation classification, patentability assessment, ABS compliance checks, and case dossier generation require an authorized user session.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  onNavigateLogin?.();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>{lang === 'hi' ? 'खाते में लॉगिन करें' : lang === 'mr' ? 'लॉगिन करा' : 'Sign In to Account'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  onNavigateRegister?.();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>{lang === 'hi' ? 'नया खाता बनाएं' : lang === 'mr' ? 'नवीन खाते तयार करा' : 'Register Free'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer pt-1"
            >
              {lang === 'hi' ? 'रद्द करें / सार्वजनिक जानकारी देखें' : lang === 'mr' ? 'रद्द करा' : 'Cancel / Continue Exploring'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
