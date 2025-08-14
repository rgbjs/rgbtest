import { StrictEncoder } from '../utils/strict-encoding.js';

export class ContractTerms {
  constructor(terms, media = null) {
    this.validate(terms, media);
    
    this.text = terms;
    this.media = media;
  }

  validate(terms, media) {
    if (!terms || typeof terms !== 'string') {
      throw new Error('Contract terms text is required and must be a string');
    }
    
    if (terms.length > 65536) {
      throw new Error('Contract terms must be 65536 characters or less');
    }
    
    if (media !== null && typeof media !== 'string') {
      throw new Error('Media reference must be a string or null');
    }
    
    if (media && media.length > 256) {
      throw new Error('Media reference must be 256 characters or less');
    }
  }

  encode() {
    return StrictEncoder.encode(this.text, 'ContractTerms');
  }

  toPlainObject() {
    return {
      text: this.text,
      media: this.media
    };
  }

  toJSON() {
    return this.toPlainObject();
  }

  equals(other) {
    if (!(other instanceof ContractTerms)) {
      return false;
    }
    
    return this.text === other.text && this.media === other.media;
  }

  static fromPlainObject(obj) {
    return new ContractTerms(obj.text, obj.media);
  }

  static createSimple(terms) {
    return new ContractTerms(terms);
  }

  static createWithMedia(terms, mediaRef) {
    return new ContractTerms(terms, mediaRef);
  }

  hasMedia() {
    return this.media !== null && this.media.length > 0;
  }

  getWordCount() {
    return this.text.trim().split(/\s+/).length;
  }

  getCharacterCount() {
    return this.text.length;
  }

  preview(maxLength = 100) {
    if (this.text.length <= maxLength) {
      return this.text;
    }
    
    return this.text.substring(0, maxLength - 3) + '...';
  }
}