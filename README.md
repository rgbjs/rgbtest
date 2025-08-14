# RGB Protocol JavaScript Implementation

A comprehensive, modular JavaScript implementation of the RGB protocol, focusing on RGB20 non-inflatable assets. Built with a test-driven approach for learning and production use.

## 🌈 Features

- **Full RGB20 Support**: Complete implementation of non-inflatable asset contracts
- **Modular Architecture**: Clean separation of concerns across 5 development stages
- **Type Safety**: Comprehensive validation and error handling
- **Extensive Testing**: 134+ test cases covering all functionality
- **RGB Test Suite Compatible**: Validated against official RGB protocol tests
- **Production Ready**: Optimized for performance and reliability
- **Learning Friendly**: Well-documented, progressive complexity

## 🚀 Quick Start

### Interactive Demo
**[🌈 Try the Live Demo](./demo.html)** - Interactive RGB20 contract creation with real-time visualization

### Code Example
```javascript
import { RGB20Contract } from 'rgbtest';

// Create a simple RGB20 asset
const contract = RGB20Contract.create({
  ticker: 'SBTC',
  name: 'Synthetic Bitcoin',
  precision: 8,
  terms: 'Bitcoin-backed synthetic asset',
  supply: 2100000000000000, // 21M BTC in satoshis
  utxoRef: '1a2b3c4d5e6f78901234567890abcdef1234567890abcdef1234567890abcdef:0'
});

console.log(`Contract ID: ${contract.getFormattedContractId()}`);
console.log(`Total Supply: ${contract.getTotalSupply().toNumber()} satoshis`);
```

## 📦 Installation

```bash
npm install rgbtest
```

## 🏗️ Architecture

The library is organized into 5 development stages:

### Stage 1: Core Utilities
- **Hex encoding/decoding**: String ↔ hex conversion utilities
- **Strict encoding**: RGB-specific serialization format
- **Hashing**: SHA256 and contract ID generation

### Stage 2: Type System
- **AssetSpec**: Asset metadata with validation
- **ContractTerms**: Contract legal terms handling  
- **Amount**: Safe arithmetic operations on token amounts

### Stage 3: Genesis Components
- **BlindSeal**: UTXO sealing with privacy features
- **Assignment**: Token assignment to UTXOs
- **FungibleState**: Token state management

### Stage 4: Contract Management
- **Genesis**: Complete contract genesis structure
- **RGB20Contract**: High-level contract interface

### Stage 5: Integration
- **Full API**: Complete library exports
- **Examples**: Real-world usage patterns

## 📚 Examples

### Creating Different Asset Types

```javascript
import { RGB20Contract } from 'rgbtest';

// Stablecoin (6 decimals like USDC)
const stablecoin = RGB20Contract.create({
  ticker: 'SUSD',
  name: 'Synthetic USD',
  precision: 6,
  terms: 'USD-backed stablecoin',
  supply: 1000000000000, // 1M USD
  utxoRef: 'abc123...def:1'
});

// NFT-like collection (0 decimals)
const nft = RGB20Contract.create({
  ticker: 'RARE',
  name: 'Digital Art Collection',
  precision: 0,
  terms: 'Limited edition digital art',
  supply: 100,
  utxoRef: 'def456...abc:2'
});
```

### Validating Transfers

```javascript
// Check if a transfer is valid
try {
  const validation = contract.validateTransfer(
    'source_utxo:0',
    1000, // amount
    'destination_utxo:1'
  );
  console.log(`Transfer valid: ${validation.amount} tokens`);
} catch (error) {
  console.log(`Transfer failed: ${error.message}`);
}
```

### Working with Precision

```javascript
const btcAsset = RGB20Contract.create({
  ticker: 'BTC',
  name: 'Bitcoin',
  precision: 8, // 8 decimal places
  // ... other params
});

// Convert between atomic and decimal amounts
const atomic = btcAsset.getAssetInfo().totalSupply; // in satoshis
const decimal = atomic / Math.pow(10, btcAsset.getPrecision()); // in BTC
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test files
npm test test/types/asset-spec.test.js
npm test test/genesis/genesis.test.js
npm test test/contract/rgb20.test.js
```

## 🔧 Development

```bash
# Clone and install
git clone https://github.com/rgbjs/rgbtest.git
cd rgbtest
npm install

# Run examples
node examples/stage1-utilities.js
node examples/stage2-types.js
node examples/complete-rgb20-example.js

# Run all tests
npm test
```

## 📖 API Reference

### RGB20Contract

Main contract interface:

- `RGB20Contract.create(params)` - Create new contract
- `getContractId()` - Get deterministic contract ID
- `getFormattedContractId()` - Get RGB-formatted ID
- `getTicker()`, `getName()`, `getPrecision()` - Asset info
- `getTotalSupply()` - Get total token supply
- `getGenesisAssignments()` - Get initial token assignments
- `validateTransfer(from, amount, to)` - Validate transfer

### Core Types

#### AssetSpec
- `AssetSpec.createNonInflatable(ticker, name, precision)`
- `encode()` - Strict encoding
- `getAtomicAmount(decimal)` / `getDecimalAmount(atomic)` - Unit conversion

#### Amount
- `new Amount(value)` - Create amount instance
- `add()`, `subtract()`, `multiply()`, `divide()` - Safe arithmetic
- `equals()`, `greaterThan()`, `lessThan()` - Comparisons

#### ContractTerms
- `new ContractTerms(text, media?)` - Create terms
- `getWordCount()`, `preview(maxLength)` - Text utilities

## 🔒 Security

- **Input Validation**: All inputs are validated before processing
- **Safe Arithmetic**: Amount operations prevent overflow/underflow
- **Privacy**: Blinding factors protect transaction privacy
- **Deterministic**: Contract IDs are deterministically generated

## 🎯 Use Cases

- **Digital Assets**: Create tokens, stablecoins, loyalty points
- **NFT Collections**: Non-fungible token management
- **DeFi**: Decentralized finance applications
- **Gaming**: In-game currency and assets
- **Supply Chain**: Tracking and verification tokens

## 📋 Roadmap

- [x] RGB20 non-inflatable assets
- [x] Complete test coverage
- [x] Performance optimization
- [ ] RGB21 NFT support
- [ ] RGB25 collectible support
- [ ] Browser compatibility
- [ ] React/Vue components

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- RGB protocol specification and community
- Bitcoin development ecosystem
- All contributors and testers

---

**Built with ❤️ for the RGB ecosystem**