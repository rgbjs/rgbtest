import { AssetSpec } from '../src/types/asset-spec.js';
import { ContractTerms } from '../src/types/contract-terms.js';
import { Amount } from '../src/types/amount.js';

console.log('🌈 RGB Protocol Stage 2: Type System Demo\n');

console.log('1. Asset Specification:');
const assetSpec = AssetSpec.createNonInflatable('NIATCKR', 'NIA asset name', 0);
console.log(`   Ticker: ${assetSpec.ticker}`);
console.log(`   Name: ${assetSpec.name}`);
console.log(`   Precision: ${assetSpec.precision}`);
console.log(`   Is Non-Inflatable: ${assetSpec.isNonInflatable()}`);
console.log(`   Encoded: ${assetSpec.encode()}`);

console.log('\n2. Contract Terms:');
const terms = ContractTerms.createSimple('NIA terms and conditions for this asset');
console.log(`   Text: ${terms.preview(30)}`);
console.log(`   Word Count: ${terms.getWordCount()}`);
console.log(`   Character Count: ${terms.getCharacterCount()}`);
console.log(`   Has Media: ${terms.hasMedia()}`);
console.log(`   Encoded: ${terms.encode()}`);

console.log('\n3. Amount Operations:');
const totalSupply = new Amount(666);
const userBalance = new Amount(100);
console.log(`   Total Supply: ${totalSupply}`);
console.log(`   User Balance: ${userBalance}`);
console.log(`   After Transfer (50): ${userBalance.subtract(new Amount(50))}`);
console.log(`   Remaining Supply: ${totalSupply.subtract(userBalance)}`);

console.log('\n4. Amount Calculations:');
const amounts = [new Amount(10), new Amount(25), new Amount(15)];
console.log(`   Individual Amounts: ${amounts.map(a => a.toString()).join(', ')}`);
console.log(`   Sum: ${Amount.sum(...amounts)}`);
console.log(`   Max: ${Amount.max(...amounts)}`);
console.log(`   Min: ${Amount.min(...amounts)}`);

console.log('\n5. Precision Handling:');
const btcSpec = AssetSpec.createNonInflatable('BTC', 'Bitcoin', 8);
console.log(`   Asset: ${btcSpec.name} (${btcSpec.ticker})`);
console.log(`   Precision: ${btcSpec.precision} decimals`);
console.log(`   1 BTC = ${btcSpec.getAtomicAmount(1)} satoshis`);
console.log(`   50,000,000 satoshis = ${btcSpec.getDecimalAmount(50000000)} BTC`);

console.log('\n✅ Stage 2 type system working correctly!');