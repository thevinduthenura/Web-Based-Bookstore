export interface PromotionInfo {
  code: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number; // percentage (e.g. 10 for 10%) or flat LKR amount (e.g. 500)
  description: string;
  minSpend?: number;
  maxDiscount?: number;
}

export const VALID_PROMOTIONS: Record<string, PromotionInfo> = {
  PAGE10: {
    code: 'PAGE10',
    type: 'PERCENTAGE',
    value: 10,
    description: '10% Storewide Discount',
    minSpend: 0,
    maxDiscount: 1000
  },
  WELCOME10: {
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    description: '10% Welcome Discount for New Readers',
    minSpend: 0,
    maxDiscount: 1000
  },
  WELCOME20: {
    code: 'WELCOME20',
    type: 'PERCENTAGE',
    value: 20,
    description: '20% Welcome Voucher for Book Lovers',
    minSpend: 0,
    maxDiscount: 2000
  },
  SARASAVI20: {
    code: 'SARASAVI20',
    type: 'PERCENTAGE',
    value: 20,
    description: '20% Sarasavi Seasonal Celebration Discount',
    minSpend: 0,
    maxDiscount: 2000
  },
  STUDENT15: {
    code: 'STUDENT15',
    type: 'PERCENTAGE',
    value: 15,
    description: '15% Student & Academic Patron Discount',
    minSpend: 0,
    maxDiscount: 1500
  },
  SLIITBOOK: {
    code: 'SLIITBOOK',
    type: 'PERCENTAGE',
    value: 15,
    description: '15% Special SLIIT Student Literary Discount',
    minSpend: 0,
    maxDiscount: 1500
  },
  SAVE500: {
    code: 'SAVE500',
    type: 'FLAT',
    value: 500,
    description: 'LKR 500 Flat Savings Voucher',
    minSpend: 500
  },
  READ500: {
    code: 'READ500',
    type: 'FLAT',
    value: 500,
    description: 'LKR 500 Off Reading Festival Coupon',
    minSpend: 500
  },
  BOOK10: {
    code: 'BOOK10',
    type: 'PERCENTAGE',
    value: 10,
    description: '10% Off Literary Catalog',
    minSpend: 0,
    maxDiscount: 1000
  },
  SARASAVI10: {
    code: 'SARASAVI10',
    type: 'PERCENTAGE',
    value: 10,
    description: '10% Off Sarasavi Publications',
    minSpend: 0,
    maxDiscount: 1000
  }
};

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  discountPercentage: number;
  finalTotal: number;
  message: string;
}

export function evaluatePromoCode(rawCode: string, totalAmount: number): PromoValidationResult {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      code: '',
      discountAmount: 0,
      discountPercentage: 0,
      finalTotal: totalAmount,
      message: 'Please enter a promo code.'
    };
  }

  const promo = VALID_PROMOTIONS[code];
  if (!promo) {
    return {
      valid: false,
      code,
      discountAmount: 0,
      discountPercentage: 0,
      finalTotal: totalAmount,
      message: `Invalid promo code "${code}". Try PAGE10, WELCOME20, SARASAVI20, SLIITBOOK or SAVE500.`
    };
  }

  if (promo.minSpend && totalAmount < promo.minSpend) {
    return {
      valid: false,
      code,
      discountAmount: 0,
      discountPercentage: 0,
      finalTotal: totalAmount,
      message: `Minimum order of LKR ${promo.minSpend.toLocaleString()} required for ${code}.`
    };
  }

  let discount = 0;
  let pct = 0;

  if (promo.type === 'PERCENTAGE') {
    pct = promo.value;
    discount = (totalAmount * pct) / 100;
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else {
    discount = Math.min(promo.value, totalAmount);
    pct = totalAmount > 0 ? Math.round((discount / totalAmount) * 100) : 0;
  }

  discount = Math.round(discount * 100) / 100;
  const finalTotal = Math.max(0, Math.round((totalAmount - discount) * 100) / 100);

  return {
    valid: true,
    code: promo.code,
    discountAmount: discount,
    discountPercentage: pct,
    finalTotal,
    message: `${promo.description} (${promo.type === 'PERCENTAGE' ? `${pct}%` : `LKR ${discount}`}) applied successfully!`
  };
}
