import assert from 'assert';
import { computeIndianGst } from '../src/utils/gst';
import { lookupPincode, isPincodeServiceable } from '../src/utils/pincodes';
import { optimizeImage } from '../src/utils/imageOptimizer';

export async function runUtilsTests() {
  console.log('\n\x1b[36m--- [1/3] Running Utilities & Business Logic Tests ---\x1b[0m');

  // 1. GST Calculation Tests
  console.log('  Testing Indian GST Computation Engine...');
  {
    // Intra-state (Delhi to Delhi -> 18% inclusive GST on Rs. 1000 MRP = Rs. 153 total: CGST Rs. 77 + SGST Rs. 76)
    const intra = computeIndianGst(1000, 'DL');
    assert.strictEqual(intra.taxType, 'INTRA_STATE', 'Delhi order must be INTRA_STATE');
    assert.strictEqual(intra.cgst, 77, 'CGST should be half of inclusive GST (77)');
    assert.strictEqual(intra.sgst, 76, 'SGST should be remaining half of inclusive GST (76)');
    assert.strictEqual(intra.igst, 0, 'IGST should be 0 for intra-state');
    assert.strictEqual(intra.totalGst, 153, 'Total inclusive GST on 1000 should be 153');

    // Inter-state (Delhi to Karnataka -> 18% inclusive IGST on Rs. 2000 MRP = Rs. 305)
    const inter = computeIndianGst(2000, 'KA');
    assert.strictEqual(inter.taxType, 'INTER_STATE', 'Karnataka order from DL store must be INTER_STATE');
    assert.strictEqual(inter.cgst, 0, 'CGST should be 0 for inter-state');
    assert.strictEqual(inter.sgst, 0, 'SGST should be 0 for inter-state');
    assert.strictEqual(inter.igst, 305, 'IGST should be 18% inclusive (305)');
    assert.strictEqual(inter.totalGst, 305, 'Total inclusive GST on 2000 should be 305');

    // Zero amount
    const zero = computeIndianGst(0, 'MH');
    assert.strictEqual(zero.totalGst, 0, 'Total GST for 0 amount should be 0');
    console.log('  \x1b[32m✔ GST Intra/Inter state calculations passed\x1b[0m');
  }

  // 2. Pincode Directory & Serviceability Tests
  console.log('  Testing Indian Pincode Directory & Serviceability...');
  {
    // Valid Metro (Delhi Connaught Place - 110001)
    const del = lookupPincode('110001');
    assert.ok(del, '110001 must be found in directory');
    assert.strictEqual(del?.city, 'New Delhi');
    assert.strictEqual(del?.serviceable, true);
    assert.strictEqual(del?.codAvailable, true);
    assert.strictEqual(del?.estimatedDays, 2);

    // Valid South (Bengaluru Indiranagar - 560038)
    const blr = lookupPincode('560038');
    assert.ok(blr, '560038 must be found');
    assert.strictEqual(blr?.city, 'Bengaluru');
    assert.strictEqual(blr?.estimatedDays, 2);

    // Serviceability check
    assert.strictEqual(isPincodeServiceable('110001'), true);
    assert.strictEqual(isPincodeServiceable('400001'), true);

    // Unknown pincode fallback
    const unknown = lookupPincode('999999');
    assert.ok(unknown, 'Unknown valid-length pincode should have default fallback');
    assert.strictEqual(unknown?.city, 'Local City');
    assert.strictEqual(unknown?.estimatedDays, 4);
    assert.strictEqual(unknown?.serviceable, true);
    console.log('  \x1b[32m✔ Pincode lookup & Tier serviceability passed\x1b[0m');
  }

  // 3. Image Optimizer Fallback & Options Test
  console.log('  Testing Image Optimizer & Format Support...');
  {
    const dummyBuffer = Buffer.from('mock-svg-image-content');
    const svgResult = await optimizeImage(dummyBuffer, 'svg', { format: 'original' });
    assert.strictEqual(svgResult.extension, 'svg');
    assert.strictEqual(svgResult.mimeType, 'image/svg+xml');
    assert.strictEqual(svgResult.optimized, false);

    // Format options verify
    const dummyImg = Buffer.from('binary-image-data-mock');
    const jpgResult = await optimizeImage(dummyImg, 'jpg', { format: 'jpg' });
    assert.ok(jpgResult.buffer, 'Buffer must be returned');
    assert.ok(jpgResult.extension, 'Extension must be defined');
    console.log('  \x1b[32m✔ Image optimizer fallback & JPG format option passed\x1b[0m');
  }
}
