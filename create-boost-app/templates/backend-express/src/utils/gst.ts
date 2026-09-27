// Indian GST calculation (Intra-State CGST/SGST vs Inter-State IGST)
export function computeIndianGst(
  taxableAmount: number,
  customerState: string = 'DL',
  sellerState: string = 'DL'
) {
  const isIntra = (customerState || '').toLowerCase() === (sellerState || '').toLowerCase();
  const gstRate = 0.18; // 18% standard inclusive tax
  const totalGst = Math.round(taxableAmount * (gstRate / (1 + gstRate)));

  if (isIntra) {
    const half = Math.round(totalGst / 2);
    return {
      taxType: 'INTRA_STATE' as const,
      cgst: half,
      sgst: totalGst - half,
      igst: 0,
      totalGst,
    };
  }

  return {
    taxType: 'INTER_STATE' as const,
    cgst: 0,
    sgst: 0,
    igst: totalGst,
    totalGst,
  };
}
