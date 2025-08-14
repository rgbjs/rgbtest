export function stringToHex(str) {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }
  return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

export function hexToString(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0) {
    throw new Error('Input must be a valid hex string');
  }
  if (hex === '') return '';
  
  return hex.match(/.{2}/g)
    .map(byte => String.fromCharCode(parseInt(byte, 16)))
    .join('');
}

export function numberToLittleEndianHex(num, bytes = 8) {
  if (typeof num !== 'number' || num < 0) {
    throw new Error('Input must be a non-negative number');
  }
  
  const hex = num.toString(16).padStart(bytes * 2, '0');
  return hex.match(/../g).reverse().join('');
}

export function littleEndianHexToNumber(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0) {
    throw new Error('Input must be a valid hex string');
  }
  
  const reversedHex = hex.match(/../g).reverse().join('');
  return parseInt(reversedHex, 16);
}

export function validateHex(hex) {
  return typeof hex === 'string' && /^[0-9a-fA-F]*$/.test(hex) && hex.length % 2 === 0;
}