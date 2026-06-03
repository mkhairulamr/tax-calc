/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import TaxCalculator from './components/TaxCalculator';
import { 
  Building2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  FileCheck2, 
  BookOpen, 
  Scale, 
  LineChart, 
  ShieldCheck 
} from 'lucide-react';

export default function App() {
  // Simple state for FAQ accordion
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  const faqs = [
    {
      q: "Bagaimana PP No. 20 Tahun 2026 berdampak pada CV dan PT Biasa?",
      a: "Sebelumnya, CV dan PT Biasa dengan omzet di bawah Rp 4,8 Miliar dapat menikmati PPh Final 0.5% dari Omzet. Berdasarkan PP No. 20 Tahun 2026, kemudahan ini dihapus untuk CV dan PT Biasa (luar PT Perorangan). Mereka wajib menyelenggarakan pembukuan fiskal dan menghitung pajak berdasarkan Laba Bersih sesuai tarif Pasal 17 dan Fasilitas Pasal 31E (diskon 50% tarif)."
    },
    {
      q: "Apakah PT Perorangan masih boleh menggunakan PPh Final 0.5%?",
      a: "Ya. Berdasarkan PP No. 55 Tahun 2022 Pasal 56, PT Perorangan (yang didirikan secara mandiri untuk usaha mikro & kecil) masih diizinkan menggunakan PPh Final 0.5% dari Omzet Bruto. Syaratnya adalah omzet tahunan maksimal Rp 4,8 Miliar dan waktu pemanfaatan maksimal 3 tahun pajak sejak terdaftar."
    },
    {
      q: "Apa yang dimaksud dengan Biaya Pengurang Usaha (Biaya 3M)?",
      a: "Biaya 3M adalah biaya untuk Mendapatkan, Menagih, dan Memelihara penghasilan. Biaya ini merupakan pengurang omzet bruto untuk mendapatkan nilai Laba Bersih Fiskal (dasar pengenaan Pajak Pasal 17). Biaya yang tidak berkaitan langsung dengan usaha (non-deductible) tidak boleh dimasukkan sebagai pengurang."
    },
    {
      q: "Bagaimana cara kerja insentif Fasilitas Pasal 31E?",
      a: "Wajib pajak badan dalam negeri dengan omset s.d Rp 50 Miliar mendapatkan diskon 50% dari tarif umum 22% (sehingga tarif efektif menjadi 11%). Jika omset s.d Rp 4,8 Miliar, seluruh laba bersih mendapat diskon ini. Jika omset berkisar antara Rp 4,8 M s.d Rp 50 M, diskon ini diberikan secara proporsional sesuai porsi Rp 4,8 M dari total omset bruto."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 pb-16">
      
      {/* PROFESSIONAL FINANCIAL HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">TAX-CALC INDONESIA</h1>
                <span className="hidden sm:inline-block text-[10px] font-mono leading-none bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  PP 20/2026 Compliant
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium">Kalkulator Pajak Badan (PT & CV) Tersinkronisasi Regulasi Terkini</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-5 text-xs text-slate-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>UU HPP & PP 55/2022</span>
            </div>
            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Format Input Rupiah Dinamis</span>
            </div>
          </div>
        </div>
      </header>

      {/* AMBIENT HERO BANNER */}
      <section className="bg-slate-950 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-40 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left lg:flex lg:items-center lg:justify-between gap-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/15 rounded-full text-xs font-semibold mb-1">
              <Scale className="w-3.5 h-3.5" />
              Regulasi Terkini Perpajakan RI
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Kalkulator Pajak Badan <br />
              <span className="text-teal-400">PT, CV &amp; PT Perorangan</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-350 leading-relaxed max-w-xl">
              Simulasikan kewajiban SPT Tahunan PPh Badan Anda secara presisi. Mendukung formula fasilitas Pasal 31E potongan 50% secara proporsional dan masa transisi khusus PT Perorangan sesuai UU Pajak Penghasilan terbaru.
            </p>
          </div>
          
          <div className="hidden lg:grid grid-cols-2 gap-4 max-w-md w-full">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                <span className="text-xs font-bold text-slate-300">PP 20/2026</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">Penghapusan PPh Final 0.5% secara bertahap bagi badan hukum CV dan PT Umum.</p>
            </div>
            
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                <span className="text-xs font-bold text-slate-300">Pasal 31E Fasilitas</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">Potongan tarif umum 50% (sehingga tarif efektif 11%) bagi badan beromzet s/d Rp 50 Miliar.</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span className="text-xs font-bold text-slate-300">PP 55/2022</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">Masa pemanfaatan tarif final 0.5% s/d 3 tahun untuk bentuk PT Perorangan.</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                <span className="text-xs font-bold text-slate-300">Kredit Pajak</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">Offset langsung PPh Pasal 22, 23 (pemotongan pihak ketiga) &amp; PPh 25 bulanan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-25">
        <TaxCalculator />
      </main>

      {/* INTERACTIVE FAQ - HELP CENTER SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-6">
        <div className="flex items-center gap-2.5 pb-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold text-slate-800">Panduan Teknis & FAQ Pajak Badan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-xl border border-slate-200/70 p-5 cursor-pointer hover:border-teal-500/40 hover:shadow-xs transition-all space-y-2.5"
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-sm font-bold text-slate-800 leading-snug flex items-center gap-2">
                    <span className="font-mono text-teal-500">Q{idx+1}.</span>
                    {faq.q}
                  </h4>
                  <div className="text-slate-400 hover:text-slate-600">
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </div>
                </div>
                {isOpen && (
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* DISCLAIMER AND LEGAL FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 space-y-4">
        <div className="p-4 bg-slate-150 rounded-xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
          <p>
            <strong>Disclaimer / Batasan Tanggung Jawab:</strong> Simulasi perhitungan perpajakan ini didasarkan pada interpretasi regulasi perpajakan Republik Indonesia yang berlaku secara umum (termasuk UU HPP, PP 55/2022, dan Peraturan Pemerintah terkait lainnya). Hasil perhitungan bersifat estimasi edukatif dan perencanaan pajak awal. Segala bentuk kewajiban perpajakan sesungguhnya dari Wajib Pajak ditentukan berdasarkan SPT Tahunan resmi yang divalidasi oleh Direktorat Jenderal Pajak (DJP). Silakan hubungi konsultan pajak tersertifikasi atau Kantor Pelayanan Pajak (KPP) setempat untuk konsultasi formal.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 font-mono">
          <span>&copy; {new Date().getFullYear()} Tax-Calc Indonesia. All rights reserved.</span>
          <span>Sesuai PP No. 20 Tahun 2026 &amp; UU HPP Indonesia</span>
        </div>
      </footer>

    </div>
  );
}
