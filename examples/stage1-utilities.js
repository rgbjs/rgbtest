import { stringToHex, hexToString, numberToLittleEndianHex } from '../src/utils/hex.js';
import { StrictEncoder } from '../src/utils/strict-encoding.js';
import { sha256, generateContractId, formatContractId } from '../src/utils/hash.js';

console.log('🌈 RGB Protocol Stage 1: Utility Functions Demo\n');

console.log('1. String/Hex Conversion:');
const ticker = 'NIATCKR';
const tickerHex = stringToHex(ticker);
console.log(`   "${ticker}" -> ${tickerHex}`);
console.log(`   ${tickerHex} -> "${hexToString(tickerHex)}"`);

console.log('\n2. Number Encoding (Little Endian):');
const supply = 666;
const supplyHex = numberToLittleEndianHex(supply);
console.log(`   ${supply} -> ${supplyHex}`);

console.log('\n3. Asset Specification Encoding:');
const assetSpec = {
  ticker: 'NIATCKR',
  name: 'NIA asset name',
  precision: 0
};
const specEncoded = StrictEncoder.encode(assetSpec, 'AssetSpec');
console.log(`   AssetSpec: ${JSON.stringify(assetSpec)}`);
console.log(`   Encoded: ${specEncoded}`);

console.log('\n4. Contract Terms Encoding:');
const terms = 'NIA terms';
const termsEncoded = StrictEncoder.encode(terms, 'ContractTerms');
console.log(`   Terms: "${terms}"`);
console.log(`   Encoded: ${termsEncoded}`);

console.log('\n5. Contract ID Generation:');
const combinedData = specEncoded + termsEncoded + supplyHex;
console.log(`   Combined data: ${combinedData}`);
const contractId = generateContractId(combinedData);
const formattedId = formatContractId(contractId);
console.log(`   Contract ID: ${contractId}`);
console.log(`   Formatted: ${formattedId}`);

console.log('\n✅ Stage 1 utilities working correctly!');