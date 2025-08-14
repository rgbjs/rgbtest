import { createHash } from 'crypto';

export function sha256(data) {
  if (typeof data === 'string') {
    data = Buffer.from(data, 'hex');
  }
  
  if (!Buffer.isBuffer(data)) {
    throw new Error('Data must be a hex string or Buffer');
  }
  
  return createHash('sha256').update(data).digest('hex');
}

export function generateContractId(encodedData) {
  const hash = sha256(encodedData);
  return hash;
}

export function formatContractId(contractId) {
  if (typeof contractId !== 'string' || contractId.length !== 64) {
    throw new Error('ContractId must be a 64-character hex string');
  }
  
  const segments = contractId.match(/.{8}/g);
  if (!segments || segments.length !== 8) {
    throw new Error('Invalid ContractId format');
  }
  
  return `rgb:${segments.join('-')}`;
}

export function parseContractId(formattedId) {
  if (typeof formattedId !== 'string') {
    throw new Error('Formatted ID must be a string');
  }
  
  if (!formattedId.startsWith('rgb:')) {
    throw new Error('Formatted ID must start with "rgb:"');
  }
  
  const segments = formattedId.slice(4).split('-');
  if (segments.length !== 8 || !segments.every(s => s.length === 8)) {
    throw new Error('Invalid formatted ContractId structure');
  }
  
  return segments.join('');
}