import { stringToHex, numberToLittleEndianHex } from './hex.js';

export class StrictEncoder {
  constructor () {
    this.buffer = [];
  }

  encodeString (str) {
    if (typeof str !== 'string') {
      throw new Error('Input must be a string');
    }

    const length = str.length;
    const lengthHex = length.toString(16).padStart(2, '0');
    const stringHex = stringToHex(str);

    return lengthHex + stringHex;
  }

  encodeAssetSpec (assetSpec) {
    const { ticker, name, precision = 0, details = 2 } = assetSpec;

    if (!ticker || !name) {
      throw new Error('AssetSpec requires ticker and name');
    }

    if (precision < 0 || precision > 18) {
      throw new Error('Precision must be between 0 and 18');
    }

    const tickerEncoded = this.encodeString(ticker);
    const nameEncoded = this.encodeString(name);
    const precisionHex = precision.toString(16).padStart(2, '0');
    const detailsHex = details.toString(16).padStart(2, '0');

    return tickerEncoded + nameEncoded + precisionHex + detailsHex;
  }

  encodeContractTerms (terms) {
    if (typeof terms !== 'string') {
      throw new Error('Contract terms must be a string');
    }

    const termsEncoded = this.encodeString(terms);
    // Add protocol byte (00) after the length field
    const lengthHex = terms.length.toString(16).padStart(2, '0');
    const termsHex = stringToHex(terms);
    return lengthHex + '00' + termsHex + '00';
  }

  encodeAmount (amount) {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    return numberToLittleEndianHex(amount, 8);
  }

  encodeUtxoRef (utxoRef) {
    const [txid, vout] = utxoRef.split(':');

    if (!txid || !vout) {
      throw new Error('UTXO reference must be in format "txid:vout"');
    }

    if (txid.length !== 64 || !/^[0-9a-fA-F]+$/.test(txid)) {
      throw new Error('Invalid transaction ID format');
    }

    const voutNum = parseInt(vout);
    if (isNaN(voutNum) || voutNum < 0) {
      throw new Error('Invalid vout format');
    }

    return txid + voutNum.toString(16).padStart(8, '0');
  }

  static encode (data, type) {
    const encoder = new StrictEncoder();

    switch (type) {
      case 'AssetSpec':
        return encoder.encodeAssetSpec(data);
      case 'ContractTerms':
        return encoder.encodeContractTerms(data);
      case 'Amount':
        return encoder.encodeAmount(data);
      case 'UtxoRef':
        return encoder.encodeUtxoRef(data);
      default:
        throw new Error(`Unknown encoding type: ${type}`);
    }
  }
}