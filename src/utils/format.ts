// Convert number to words in Indian numbering system
export function amountInWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function twoDigits(num: number): string {
    if (num < 20) return ones[num];
    return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  }
  
  function threeDigits(num: number): string {
    if (num === 0) return '';
    if (num < 100) return twoDigits(num);
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + twoDigits(num % 100) : '');
  }
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  if (rupees === 0) {
    result = 'Zero';
  } else {
    // Indian numbering: Crore, Lakh, Thousand, Hundred
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;
    
    if (crore > 0) {
      result += threeDigits(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += twoDigits(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += twoDigits(thousand) + ' Thousand ';
    }
    if (hundred > 0) {
      result += threeDigits(hundred);
    }
  }
  
  result = result.trim();
  
  if (paise > 0) {
    result += ' and ' + twoDigits(paise) + ' Paise';
  }
  
  result += ' Rupees Only';
  
  return result;
}

export function formatCurrency(amountPaise: number): string {
  const amount = amountPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
