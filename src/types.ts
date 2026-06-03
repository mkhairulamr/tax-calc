/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EntityType = 'PT_UMUM' | 'CV' | 'PT_PERORANGAN';

export type PTPeroranganAge = 'TAHUN_1' | 'TAHUN_2' | 'TAHUN_3' | 'LEBIH_3_TAHUN';

export interface TaxInputState {
  entityType: EntityType;
  grossRevenue: number;          // Omzet Bruto Setahun
  businessCosts: number;         // Total Biaya Usaha (3M)
  taxCredits: number;            // Kredit Pajak (PPh 22, 23, 25)
  ptPeroranganAge: PTPeroranganAge; // Usia PT Perorangan (untuk validasi 3 tahun)
}

export type FacilityCategory = 'A_UNDER_4_8B' | 'B_PROP_4_8B_50B' | 'C_OVER_50B' | 'FINAL_0_5';

export interface CalculationResult {
  entityType: EntityType;
  grossRevenue: number;
  businessCosts: number;
  taxCredits: number;
  netProfitBeforeTax: number;     // Laba Bersih Sebelum Pajak
  isLoss: boolean;                // Apakah Rugi Fiskal
  facilityCategory: FacilityCategory;
  appliedSchemeName: string;
  appliedRateDescription: string;
  
  // Breakdown of General Scheme (Pasal 17 & 31E)
  taxableProfitWithFacility: number;    // Laba yang mendapat fasilitas
  taxableProfitWithoutFacility: number; // Laba yang tidak mendapat fasilitas
  taxWithFacility: number;              // PPh 11%
  taxWithoutFacility: number;           // PPh 22%
  
  // Final Scheme Breakdown (0.5%)
  finalTaxAmount: number;
  
  // Totals
  totalTaxDue: number;            // PPh Badan Terutang
  netTaxPayableOrRefundable: number; // Kurang / Lebih Bayar setelah kredit pajak
  paymentStatus: 'KURANG_BAYAR' | 'LEBIH_BAYAR' | 'NIHIL';
  
  // Legal citations
  lawReferences: string[];
  explanation: string;
}
