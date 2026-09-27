export const PINCODE_MAP: Record<string, { city: string; state: string; metro: boolean }> = {
  '11': { city: 'New Delhi', state: 'Delhi', metro: true },
  '12': { city: 'Gurugram / Faridabad', state: 'Haryana', metro: true },
  '14': { city: 'Amritsar / Jalandhar', state: 'Punjab', metro: false },
  '16': { city: 'Chandigarh', state: 'Punjab', metro: false },
  '20': { city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', metro: true },
  '22': { city: 'Varanasi', state: 'Uttar Pradesh', metro: false },
  '30': { city: 'Jaipur', state: 'Rajasthan', metro: false },
  '38': { city: 'Ahmedabad', state: 'Gujarat', metro: true },
  '39': { city: 'Surat', state: 'Gujarat', metro: false },
  '40': { city: 'Mumbai', state: 'Maharashtra', metro: true },
  '41': { city: 'Pune', state: 'Maharashtra', metro: true },
  '45': { city: 'Indore', state: 'Madhya Pradesh', metro: false },
  '46': { city: 'Bhopal', state: 'Madhya Pradesh', metro: false },
  '50': { city: 'Hyderabad', state: 'Telangana', metro: true },
  '56': { city: 'Bengaluru', state: 'Karnataka', metro: true },
  '60': { city: 'Chennai', state: 'Tamil Nadu', metro: true },
  '68': { city: 'Kochi', state: 'Kerala', metro: false },
  '70': { city: 'Kolkata', state: 'West Bengal', metro: true },
  '75': { city: 'Bhubaneswar', state: 'Odisha', metro: false },
  '78': { city: 'Guwahati', state: 'Assam', metro: false },
  '80': { city: 'Patna', state: 'Bihar', metro: false },
};

export function lookupPincode(pincode: string) {
  const clean = (pincode || '').toString().replace(/\D/g, '');
  const prefix2 = clean.slice(0, 2);
  const found = PINCODE_MAP[prefix2] || { city: 'Local City', state: 'India', metro: false };

  return {
    pincode: clean,
    city: found.city,
    state: found.state,
    serviceable: true,
    codAvailable: true,
    estimatedDays: found.metro ? 2 : 4,
    courier: 'Delhivery Surface Premium',
  };
}

export function isPincodeServiceable(pincode: string): boolean {
  const clean = (pincode || '').toString().replace(/\D/g, '');
  return clean.length === 6;
}
