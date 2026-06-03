/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import {
  Calculator,
  Percent,
  FileText,
  AlertTriangle,
  RotateCcw,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  Coins,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { TaxInputState, CalculationResult, EntityType, PTPeroranganAge } from '../types';

// Helper to convert a number to Rupiah format
const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Parser to extract raw number from formatted currency string
const parseRupiahInput = (input: string): number => {
  // Strip non-digit characters
  const cleaned = input.replace(/[^0-9]/g, '');
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
};

export default function TaxCalculator() {
  // State for form inputs
  const [inputs, setInputs] = useState<TaxInputState>({
    entityType: 'PT_UMUM',
    grossRevenue: 1200000000, // Rp 1.2M default
    businessCosts: 800000000, // Rp 800jt default
    taxCredits: 20000000,    // Rp 20jt default
    ptPeroranganAge: 'TAHUN_1',
  });

  // State for raw typing buffers (stores what user types to ensure smooth input flow)
  const [revenueInput, setRevenueInput] = useState<string>(formatRupiah(1200000000));
  const [costsInput, setCostsInput] = useState<string>(formatRupiah(800000000));
  const [creditsInput, setCreditsInput] = useState<string>(formatRupiah(20000000));

  // Handler for custom formatted input change
  const handleRevenueChange = (valStr: string) => {
    const numericValue = parseRupiahInput(valStr);
    // Limit to safe integer range to prevent UI breaking
    if (numericValue > 999999999999999) return;
    setInputs(prev => ({ ...prev, grossRevenue: numericValue }));
    setRevenueInput(numericValue === 0 ? 'Rp 0' : formatRupiah(numericValue));
  };

  const handleCostsChange = (valStr: string) => {
    const numericValue = parseRupiahInput(valStr);
    if (numericValue > 999999999999999) return;
    setInputs(prev => ({ ...prev, businessCosts: numericValue }));
    setCostsInput(numericValue === 0 ? 'Rp 0' : formatRupiah(numericValue));
  };

  const handleCreditsChange = (valStr: string) => {
    const numericValue = parseRupiahInput(valStr);
    if (numericValue > 999999999999999) return;
    setInputs(prev => ({ ...prev, taxCredits: numericValue }));
    setCreditsInput(numericValue === 0 ? 'Rp 0' : formatRupiah(numericValue));
  };

  // Perform tax calculations reactively based on input changes
  const calculation: CalculationResult = useMemo(() => {
    const { entityType, grossRevenue, businessCosts, taxCredits, ptPeroranganAge } = inputs;
    const netProfitBeforeTax = grossRevenue - businessCosts;
    const isLoss = netProfitBeforeTax < 0;

    let facilityCategory: CalculationResult['facilityCategory'] = 'A_UNDER_4_8B';
    let appliedSchemeName = 'Tarif Umum Pasal 17 (Fasilitas Pasal 31E)';
    let appliedRateDescription = 'Tarif Diskonted 50% (Efektif 11%)';
    let taxableProfitWithFacility = 0;
    let taxableProfitWithoutFacility = 0;
    let taxWithFacility = 0;
    let taxWithoutFacility = 0;
    let finalTaxAmount = 0;
    let totalTaxDue = 0;
    let explanation = '';
    const lawReferences: string[] = ['UU No. 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan (UU HPP)'];

    // PT Perorangan has specific final tax privileges under certain bounds
    const isEligibleForPTPeroranganFinalSch = 
      entityType === 'PT_PERORANGAN' && 
      grossRevenue <= 4800000000 && 
      ptPeroranganAge !== 'LEBIH_3_TAHUN';

    if (isEligibleForPTPeroranganFinalSch) {
      facilityCategory = 'FINAL_0_5';
      appliedSchemeName = 'Skema PPh Final 0.5% (Eksklusif PT Perorangan - PP 55/2022)';
      appliedRateDescription = 'Tarif Final 0.5% terutang dari Total Omzet Bruto';
      finalTaxAmount = Math.max(0, Math.round(0.005 * grossRevenue));
      totalTaxDue = finalTaxAmount;
      lawReferences.push('PP No. 55 Tahun 2022 Pasal 56 tentang Penyesuaian Pengaturan di Bidang PPh');
      explanation = 'Sesuai PP No. 55 Tahun 2022, PT Perorangan dengan omzet tahunan di bawah Rp 4,8 Miliar berhak memanfaatkan PPh Final 0,5% dari peredaran bruto untuk jangka waktu maksimal 3 tahun pajak sejak terdaftar.';
    } else {
      // General Scheme (Tarif Umum Pasal 17 & Pasal 31E)
      lawReferences.push('PP No. 20 Tahun 2026 tentang Tarif Pajak Penghasilan Badan');
      
      if (entityType === 'PT_PERORANGAN') {
        const triggers: string[] = [];
        if (grossRevenue > 4800000000) triggers.push('omzet melebihi Rp 4,8 Miliar');
        if (ptPeroranganAge === 'LEBIH_3_TAHUN') triggers.push('jangka waktu pemanfaatan (3 tahun pajak) telah berakhir');
        explanation = `PT Perorangan Anda otomatis berpindah ke Tarif Umum Pasal 17 karena ${triggers.join(' dan ')} sesuai ketentuan penyesuaian PP 55/2022.`;
      } else if (entityType === 'PT_UMUM') {
        explanation = 'Berdasarkan PP No. 20 Tahun 2026, PT Biasa wajib menggunakan Tarif Umum PPh Badan Badan (Pasal 17) berbasis Laba Bersih Fiskal dan tidak diperbolehkan lagi menggunakan tarif PPh Final 0,5% dari omzet.';
      } else {
        explanation = 'CV wajib menyelenggarakan pembukuan fungsional dan terutang pajak menggunakan Tarif Umum PPh Badan berbasis Laba Bersih Fiskal (tidak diperkenankan PPh Final 0.5% berdasarkan regulasi PP No. 20 Tahun 2026).';
      }

      // Classification of General Scheme
      if (grossRevenue <= 4800000000) {
        facilityCategory = 'A_UNDER_4_8B';
        appliedRateDescription = 'Tarif Fasilitas 50% dari tarif umum (Efektif 11%) atas Laba Bersih Fiskal';
        if (!isLoss) {
          taxableProfitWithFacility = netProfitBeforeTax;
          taxWithFacility = Math.round(taxableProfitWithFacility * 0.11);
          totalTaxDue = taxWithFacility;
        }
      } else if (grossRevenue <= 50000000000) {
        facilityCategory = 'B_PROP_4_8B_50B';
        appliedRateDescription = 'Kombinasi Tarif Proporsional: 11% (Fasilitas) & 22% (Non-Fasilitas)';
        if (!isLoss) {
          // Proportion calculation: (Rp 4.8 Billion / Gross Revenue) * Laba Bersih
          taxableProfitWithFacility = Math.round((4800000000 / grossRevenue) * netProfitBeforeTax);
          // Clamp to ensure it doesn't exceed net profit
          taxableProfitWithFacility = Math.min(taxableProfitWithFacility, netProfitBeforeTax);
          taxableProfitWithoutFacility = Math.max(0, netProfitBeforeTax - taxableProfitWithFacility);
          
          taxWithFacility = Math.round(taxableProfitWithFacility * 0.11);
          taxWithoutFacility = Math.round(taxableProfitWithoutFacility * 0.22);
          totalTaxDue = taxWithFacility + taxWithoutFacility;
        }
      } else {
        facilityCategory = 'C_OVER_50B';
        appliedRateDescription = 'Tarif Standar PPh Badan 22% tanpa fasilitas diskon';
        if (!isLoss) {
          taxableProfitWithoutFacility = netProfitBeforeTax;
          taxWithoutFacility = Math.round(taxableProfitWithoutFacility * 0.22);
          totalTaxDue = taxWithoutFacility;
        }
      }
    }

    // Taxes Net of Credits
    const netTaxPayableOrRefundable = totalTaxDue - taxCredits;
    let paymentStatus: CalculationResult['paymentStatus'] = 'NIHIL';
    if (netTaxPayableOrRefundable > 0) {
      paymentStatus = 'KURANG_BAYAR';
    } else if (netTaxPayableOrRefundable < 0) {
      paymentStatus = 'LEBIH_BAYAR';
    }

    return {
      entityType,
      grossRevenue,
      businessCosts,
      taxCredits,
      netProfitBeforeTax,
      isLoss,
      facilityCategory,
      appliedSchemeName,
      appliedRateDescription,
      taxableProfitWithFacility,
      taxableProfitWithoutFacility,
      taxWithFacility,
      taxWithoutFacility,
      finalTaxAmount,
      totalTaxDue,
      netTaxPayableOrRefundable: Math.abs(netTaxPayableOrRefundable),
      paymentStatus,
      lawReferences,
      explanation
    };
  }, [inputs]);

  // Reset inputs to default values
  const handleReset = () => {
    setInputs({
      entityType: 'PT_UMUM',
      grossRevenue: 1200000000,
      businessCosts: 800000000,
      taxCredits: 20000000,
      ptPeroranganAge: 'TAHUN_1',
    });
    setRevenueInput(formatRupiah(1200000000));
    setCostsInput(formatRupiah(800000000));
    setCreditsInput(formatRupiah(20000000));
  };

  // Helper function to print summary
  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div id="calculator-main" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">
      
      {/* LEFT COLUMN: Input Form */}
      <div id="calculator-inputs" className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2 ml-1 bg-teal-50 text-teal-600 rounded-lg">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Parameter Fiskal</h2>
            <p className="text-xs text-slate-500 font-medium">Lengkapi profil finansial badan usaha</p>
          </div>
        </div>

        {/* INPUT: Entity Type */}
        <div className="space-y-2">
          <label htmlFor="entityType" className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span>Jenis Badan Usaha</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">PP 20/2026 Pajak</span>
          </label>
          <div className="relative">
            <select
              id="entityType"
              value={inputs.entityType}
              onChange={(e) => setInputs(prev => ({ ...prev, entityType: e.target.value as EntityType }))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-sm appearance-none cursor-pointer"
            >
              <option value="PT_UMUM">Perseroan Terbatas (PT Umum / Non-Perorangan)</option>
              <option value="CV">Persekutuan Komanditer (CV / Firma)</option>
              <option value="PT_PERORANGAN">PT Perorangan (Micro & Small Business)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CONDITIONAL INPUT: PT Perorangan Age */}
        {inputs.entityType === 'PT_PERORANGAN' && (
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-150 space-y-3 animate-fadeIn duration-200">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800">
                <span className="font-semibold block mb-0.5">Masa Berlaku Tarif PPh Final PT Perorangan</span>
                Menurut PP 55/2022, PPh Final 0.5% hanya berlaku maksimal 3 tahun pajak sejak pendaftaran perusahaan.
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <label htmlFor="ptPeroranganAge" className="text-xs font-semibold text-slate-700">Tahun Pajak Keberjalanan PT Perorangan:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInputs(prev => ({ ...prev, ptPeroranganAge: 'TAHUN_1' }))}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    inputs.ptPeroranganAge === 'TAHUN_1'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Tahun ke-1
                </button>
                <button
                  type="button"
                  onClick={() => setInputs(prev => ({ ...prev, ptPeroranganAge: 'TAHUN_2' }))}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    inputs.ptPeroranganAge === 'TAHUN_2'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Tahun ke-2
                </button>
                <button
                  type="button"
                  onClick={() => setInputs(prev => ({ ...prev, ptPeroranganAge: 'TAHUN_3' }))}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    inputs.ptPeroranganAge === 'TAHUN_3'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Tahun ke-3
                </button>
                <button
                  type="button"
                  onClick={() => setInputs(prev => ({ ...prev, ptPeroranganAge: 'LEBIH_3_TAHUN' }))}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    inputs.ptPeroranganAge === 'LEBIH_3_TAHUN'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  &gt; 3 Tahun (Pindah Tarif)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INPUT: Annual Gross Revenue / Omzet */}
        <div className="space-y-2">
          <label htmlFor="grossRevenue" className="text-sm font-semibold text-slate-700 flex justify-between items-center">
            <span>Pendapatan / Omzet Bruto (Setahun)</span>
            {inputs.grossRevenue > 0 && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {inputs.grossRevenue >= 50000000000 
                  ? 'Omzet di atas Rp 50M' 
                  : inputs.grossRevenue > 4800000000 
                    ? 'Omzet Rp 4.8M - Rp 50M' 
                    : 'Omzet s/d Rp 4.8M'}
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              id="grossRevenue"
              value={revenueInput}
              onChange={(e) => handleRevenueChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono font-semibold rounded-xl pl-4 pr-4 py-3 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base text-left"
              placeholder="Rp 0"
            />
          </div>
          <p className="text-[11px] text-slate-400">Total omset kotor dalam satu tahun buku perpajakan.</p>
        </div>

        {/* INPUT: Business Costs */}
        <div className="space-y-2">
          <label htmlFor="businessCosts" className="text-sm font-semibold text-slate-700 flex justify-between items-center">
            <span>Biaya Usaha Pengurang (Biaya 3M)</span>
            <span className="text-[10px] text-slate-400 font-mono">Deductible Expenses</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="businessCosts"
              value={costsInput}
              onChange={(e) => handleCostsChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono font-semibold rounded-xl pl-4 pr-4 py-3 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base text-left"
              placeholder="Rp 0"
            />
          </div>
          <p className="text-[11px] text-slate-400">Biaya Mendapatkan, Menagih, Memelihara penghasilan (Biaya fiskal).</p>
        </div>

        {/* INPUT: Tax Credits */}
        <div className="space-y-2">
          <label htmlFor="taxCredits" className="text-sm font-semibold text-slate-700 flex justify-between items-center">
            <span>Kredit Pajak Terbayar</span>
            <span className="text-[10px] text-slate-400 font-mono">PPh 22, 23, & 25</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="taxCredits"
              value={creditsInput}
              onChange={(e) => handleCreditsChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono font-semibold rounded-xl pl-4 pr-4 py-3 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base text-left"
              placeholder="Rp 0"
            />
          </div>
          <p className="text-[11px] text-slate-400">Pajak yang sudah dipotong pihak ketiga atau diangsur mandiri.</p>
        </div>

        {/* Action Buttons inside Input Column */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800 font-medium text-sm transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Reset Inputs
          </button>
          <button
            type="button"
            onClick={handlePrintSummary}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-950 text-white font-medium text-sm transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            Cetak Hasil
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: Output Analysis Dashboard */}
      <div id="calculator-outputs-right" className="lg:col-span-7 space-y-6">
        
        {/* UPPER PANEL: Financial Health and Status Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 leading-none flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-50 text-sky-600 rounded-md">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span>Analisis Laba & Skema Perpajakan</span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md">STATUS EKSTRAKSI</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Net Fiscal Profit / Loss Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              calculation.isLoss 
                ? 'bg-rose-50/40 border-rose-150 text-rose-950' 
                : 'bg-teal-50/30 border-teal-150 text-slate-900'
            }`}>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Laba Bersih Sebelum Pajak
              </span>
              <span className={`text-2xl font-mono font-bold block ${
                calculation.isLoss ? 'text-rose-600' : 'text-teal-700'
              }`}>
                {calculation.isLoss ? '-' : ''}{formatRupiah(Math.abs(calculation.netProfitBeforeTax))}
              </span>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                {calculation.isLoss ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-medium text-rose-700 leading-normal">
                      Posisi Rugi Fiskal (Deductible Loss)
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-emerald-700 leading-normal">
                      Posisi Laba Fiskal Positif
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Scheme Applied Status Card */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Skema Pajak Teridentifikasi
                </span>
                <span className="text-sm font-bold text-slate-800 block line-clamp-2">
                  {calculation.appliedSchemeName}
                </span>
              </div>
              <div className="mt-2 text-xs font-medium text-slate-500 leading-tight">
                {calculation.appliedRateDescription}
              </div>
            </div>

          </div>

          {/* Conditional Alert Banner if loss occurs */}
          {calculation.isLoss && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex gap-3 text-sm text-rose-800 leading-relaxed">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5">Sinyal Peringatan Perpajakan:</strong>
                Perusahaan dalam posisi rugi fiskal berdasarkan pengurang biaya 3M. PPh Badan Terutang untuk Tarif Umum otomatis <strong className="font-bold">Rp 0</strong> (tidak minus). Kerugian ini dapat dikompensasikan ke depan maksimal 5 tahun pajak berikutnya sesuai ketentuan UU Pajak Penghasilan.
              </div>
            </div>
          )}

          {/* Educational Note explaining why the specific scheme was chosen */}
          <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100/80 text-xs text-sky-850 leading-relaxed space-y-1.5">
            <span className="font-bold text-sky-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" /> Analisis Kebijakan Hukum:
            </span>
            <p>{calculation.explanation}</p>
          </div>

        </div>

        {/* LOWER PANEL: Tax Calculation Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 shrink-0">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Rincian Perhitungan Pajak</h3>
          </div>

          <div className="space-y-4">
            
            {/* Calculation details depending on active scheme */}
            {calculation.facilityCategory === 'FINAL_0_5' ? (
              // PT Perorangan PPh Final 0.5% Detailed Lines
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-200">
                  Rincian Skema PPh Final (Peraturan Pemerintah No. 55/2022)
                </span>
                
                <div className="flex justify-between items-center text-sm font-medium py-1">
                  <span className="text-slate-600">Total Omzet Bruto (Setahun)</span>
                  <span className="font-mono text-slate-800">{formatRupiah(calculation.grossRevenue)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm font-medium py-1">
                  <span className="text-slate-600">Tarif PPh Final</span>
                  <span className="font-mono text-amber-600">0.5% (Setengah Persen)</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-dashed border-slate-200">
                  <span className="text-slate-700">Perhitungan Pajak:</span>
                  <span className="font-mono text-slate-900">0.5% x {formatRupiah(calculation.grossRevenue)}</span>
                </div>
              </div>
            ) : (
              // General Scheme (A, B, C) Detailed Lines
              <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-200">
                  Rincian Skema Tarif Pasal 17 & Fasilitas Pasal 31E UU HPP
                </span>

                <div className="flex justify-between items-center text-xs font-medium py-1">
                  <span className="text-slate-600">Laba Bersih Fiskal (Dasar Pengenaan Pajak)</span>
                  <span className="font-mono text-slate-800 font-bold">{formatRupiah(Math.max(0, calculation.netProfitBeforeTax))}</span>
                </div>

                {/* Sub-breakdowns of Category */}
                {calculation.facilityCategory === 'A_UNDER_4_8B' && (
                  <div className="space-y-2 pt-1 border-t border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 italic">Mendapat fasilitas penuh 50% potongan tarif karena omzet tahunan s/d Rp 4,8 Miliar.</p>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-700">Laba yang mendapat fasilitas (LKP)</span>
                      <span className="font-mono text-teal-600">{formatRupiah(Math.max(0, calculation.netProfitBeforeTax))}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600 pl-4 py-1 border-l-2 border-emerald-500 bg-emerald-50/40 rounded-r-md">
                      <span>PPh Pasal 31E Terutang (11% x Laba)</span>
                      <span className="font-mono text-slate-900">{formatRupiah(calculation.taxWithFacility)}</span>
                    </div>
                  </div>
                )}

                {calculation.facilityCategory === 'B_PROP_4_8B_50B' && (
                  <div className="space-y-3 pt-1 border-t border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 italic">Mendapat fasilitas proporsional (Sebagian diskon 11%, sebagian tarif normal 22%).</p>
                    
                    {/* Proportional breakdown calculations */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-600 leading-tight">
                          1. Bagian Laba Bersih yang mendapat Fasilitas:<br />
                          <span className="text-[10px] text-slate-400 font-mono">(Rp 4,8M / {formatRupiah(calculation.grossRevenue)}) x LABA</span>
                        </span>
                        <span className="font-mono text-slate-800">{formatRupiah(calculation.taxableProfitWithFacility)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 pl-3 py-1 border-l-2 border-teal-500 bg-teal-50/40 rounded-r-md">
                        <span>Pajak Fasilitas (11% x {formatRupiah(calculation.taxableProfitWithFacility)})</span>
                        <span className="font-mono text-slate-900">{formatRupiah(calculation.taxWithFacility)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-600 leading-tight">
                          2. Bagian Laba Bersih yang TIDAK mendapat Fasilitas:<br />
                          <span className="text-[10px] text-slate-400 font-mono">LABA - Bagian Fasilitas</span>
                        </span>
                        <span className="font-mono text-slate-800">{formatRupiah(calculation.taxableProfitWithoutFacility)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 pl-3 py-1 border-l-2 border-slate-400 bg-slate-100 rounded-r-md">
                        <span>Pajak Standar (22% x {formatRupiah(calculation.taxableProfitWithoutFacility)})</span>
                        <span className="font-mono text-slate-900">{formatRupiah(calculation.taxWithoutFacility)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {calculation.facilityCategory === 'C_OVER_50B' && (
                  <div className="space-y-2 pt-1 border-t border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 italic">Omzet tahunan melebihi Rp 50 Miliar, tidak berhak mendapat fasilitas diskon apapun.</p>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-700">Laba yang tidak mendapat fasilitas</span>
                      <span className="font-mono text-rose-600">{formatRupiah(Math.max(0, calculation.netProfitBeforeTax))}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600 pl-4 py-1 border-l-2 border-rose-500 bg-rose-50/40 rounded-r-md">
                      <span>PPh Pasal 17 Terutang (22% x Laba)</span>
                      <span className="font-mono text-slate-900">{formatRupiah(calculation.taxWithoutFacility)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Total PPh Terutang Line */}
            <div className="flex justify-between items-center p-4 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-100">
              <span className="font-bold text-sm tracking-tight">TOTAL PPH BADAN TERUTANG (A)</span>
              <span className="font-mono font-bold text-xl text-emerald-800">{formatRupiah(calculation.totalTaxDue)}</span>
            </div>

            {/* Kredit Pajak Input offset Line */}
            <div className="flex justify-between items-center p-4 bg-slate-50 text-slate-800 rounded-xl border border-slate-200">
              <span className="font-semibold text-sm">Kredit Pajak Pengurang Terbayar (B)</span>
              <span className="font-mono text-slate-700 font-bold">-{formatRupiah(calculation.taxCredits)}</span>
            </div>

            {/* Sisa Kurang/Lebih Bayar Output Panel */}
            <div className={`p-5 rounded-2xl border ${
              calculation.paymentStatus === 'KURANG_BAYAR'
                ? 'bg-amber-50 text-amber-950 border-amber-200'
                : calculation.paymentStatus === 'LEBIH_BAYAR'
                  ? 'bg-sky-50 text-sky-950 border-sky-150'
                  : 'bg-teal-50 text-teal-950 border-teal-150'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-70 block mb-0.5">
                    Hasil Akhir Status SPT Tahunan (A - B)
                  </span>
                  <span className="text-sm font-extrabold leading-none">
                    {calculation.paymentStatus === 'KURANG_BAYAR' && 'Pajak Kurang Bayar (PPh Pasal 29)'}
                    {calculation.paymentStatus === 'LEBIH_BAYAR' && 'Pajak Lebih Bayar (Restitusi / PPh Pasal 28A)'}
                    {calculation.paymentStatus === 'NIHIL' && 'Pajak Nihil'}
                  </span>
                </div>
                <span className="font-mono font-black text-2xl">
                  {formatRupiah(calculation.paymentStatus === 'NIHIL' ? 0 : calculation.netTaxPayableOrRefundable)}
                </span>
              </div>
              
              {/* Context text for payout state */}
              <div className="mt-3.5 text-xs opacity-90 border-t border-black/10 pt-2.5 leading-relaxed flex items-start gap-2">
                <div className="mt-0.5 shrink-0">
                  {calculation.paymentStatus === 'KURANG_BAYAR' && <ShieldAlert className="w-4 h-4 text-amber-700" />}
                  {calculation.paymentStatus === 'LEBIH_BAYAR' && <CheckCircle2 className="w-4 h-4 text-sky-700" />}
                  {calculation.paymentStatus === 'NIHIL' && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                </div>
                <div>
                  {calculation.paymentStatus === 'KURANG_BAYAR' && 
                    'Wajib disetor ke kas negara menggunakan kode billing KAP-KJS Pajak sebelum batas akhir penyampaian SPT Tahunan (30 April tahun pajak berikutnya).'}
                  {calculation.paymentStatus === 'LEBIH_BAYAR' && 
                    'Wajib Pajak berhak mengajukan restitusi ke kantor DJP atau memperhitungkannya dengan utang pajak lain melalui mekanisme pemeriksaan pajak.'}
                  {calculation.paymentStatus === 'NIHIL' && 
                    'Tidak ada kekurangan atau kelebihan setoran pajak badan untuk tahun pajak ini. Pajak Anda dalam status balance.'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM LEGAL PANEL: References & Regulations Explanation */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-800">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4 shrink-0">
            <Scale className="w-5 h-5 text-teal-400" />
            <h4 className="text-base font-bold text-slate-100">Dasar Hukum & Regulasi Indonesia</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400">
            <div className="space-y-2 leading-relaxed">
              <span className="font-semibold text-slate-200 block">1. PP No. 20 Tahun 2026</span>
              <p>
                Menetapkan tarif fungsional baru untuk Pajak Penghasilan Badan (PPh Badan) Umum serta menghapus skema PPh Final 0,5% untuk badan usaha berbentuk PT Biasa dan CV. Penyetoran pajak wajib diselenggarakan secara full-accrual pembukuan fiskal pasal 17.
              </p>
            </div>
            
            <div className="space-y-2 leading-relaxed">
              <span className="font-semibold text-slate-200 block">2. Fasilitas Pasal 31E UU HPP</span>
              <p>
                Memberikan insentif berbentuk reduksi tarif 50% untuk Wajib Pajak Badan dalam negeri dengan peredaran bruto s.d Rp 50 Miliar. Fasilitas 50% diskon diberlakukan secara eksklusif atas Laba Kena Pajak yang merupakan porsi omzet s/d Rp 4,8 Miliar.
              </p>
            </div>

            <div className="space-y-2 leading-relaxed">
              <span className="font-semibold text-slate-200 block">3. PP No. 55 Tahun 2022</span>
              <p>
                Menyediakan masa toleransi PPh Final 0,5% bagi PT Perorangan dengan omset di bawah Rp 4,8 Miliar selama maksimal 3 tahun pajak. Menjadi jembatan keringanan bagi pengusaha mikro dan UMKM sebelum beralih ke pembukuan fiskal.
              </p>
            </div>

            <div className="space-y-2 leading-relaxed flex flex-col justify-between">
              <div>
                <span className="font-semibold text-slate-200 block mb-1">Rujukan Hukum Terpilih:</span>
                <ul className="space-y-1 list-disc pl-4 text-[11px]">
                  {calculation.lawReferences.map((ref, idx) => (
                    <li key={idx} className="line-clamp-1">{ref}</li>
                  ))}
                </ul>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-3 pt-2 border-t border-slate-800/60 font-mono">
                Terakhir Diupdate: {new Date().getFullYear()} Regulasi Perpajakan NKRI
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
