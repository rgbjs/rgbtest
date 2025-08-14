import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { Amount } from '../../src/types/amount.js';

describe('Amount', () => {
  test('creates valid Amount instance', () => {
    const amount = new Amount(100);
    assert.equal(amount.value, 100);
  });

  test('validates amount requirements', () => {
    assert.throws(() => new Amount(-1), /Amount must be a non-negative number/);
    assert.throws(() => new Amount(1.5), /Amount must be an integer/);
    assert.throws(() => new Amount('100'), /Amount must be a non-negative number/);
    assert.throws(() => new Amount(Number.MAX_SAFE_INTEGER + 1), /Amount exceeds maximum safe integer/);
  });

  test('encodes correctly', () => {
    const amount = new Amount(666);
    const encoded = amount.encode();
    const expected = '9a02000000000000';
    assert.equal(encoded, expected);
  });

  test('converts to number', () => {
    const amount = new Amount(123);
    assert.equal(amount.toNumber(), 123);
  });

  test('compares equality correctly', () => {
    const amount1 = new Amount(100);
    const amount2 = new Amount(100);
    const amount3 = new Amount(200);
    
    assert.equal(amount1.equals(amount2), true);
    assert.equal(amount1.equals(amount3), false);
    assert.equal(amount1.equals({}), false);
  });

  test('addition works correctly', () => {
    const amount1 = new Amount(100);
    const amount2 = new Amount(50);
    const sum = amount1.add(amount2);
    
    assert.equal(sum.value, 150);
    assert.throws(() => amount1.add({}), /Can only add Amount instances/);
  });

  test('subtraction works correctly', () => {
    const amount1 = new Amount(100);
    const amount2 = new Amount(30);
    const diff = amount1.subtract(amount2);
    
    assert.equal(diff.value, 70);
    assert.throws(() => amount2.subtract(amount1), /Cannot subtract larger amount from smaller amount/);
    assert.throws(() => amount1.subtract({}), /Can only subtract Amount instances/);
  });

  test('multiplication works correctly', () => {
    const amount = new Amount(100);
    const result = amount.multiply(2.5);
    
    assert.equal(result.value, 250);
    assert.throws(() => amount.multiply(-1), /Multiplication factor must be a non-negative number/);
  });

  test('division works correctly', () => {
    const amount = new Amount(100);
    const result = amount.divide(3);
    
    assert.equal(result.value, 33);
    assert.throws(() => amount.divide(0), /Division divisor must be a positive number/);
    assert.throws(() => amount.divide(-1), /Division divisor must be a positive number/);
  });

  test('comparison methods work correctly', () => {
    const amount1 = new Amount(100);
    const amount2 = new Amount(50);
    const amount3 = new Amount(100);
    
    assert.equal(amount1.greaterThan(amount2), true);
    assert.equal(amount2.greaterThan(amount1), false);
    
    assert.equal(amount2.lessThan(amount1), true);
    assert.equal(amount1.lessThan(amount2), false);
    
    assert.equal(amount1.greaterThanOrEqual(amount3), true);
    assert.equal(amount1.greaterThanOrEqual(amount2), true);
    
    assert.equal(amount1.lessThanOrEqual(amount3), true);
    assert.equal(amount2.lessThanOrEqual(amount1), true);
  });

  test('state check methods work correctly', () => {
    const zero = new Amount(0);
    const positive = new Amount(100);
    
    assert.equal(zero.isZero(), true);
    assert.equal(positive.isZero(), false);
    
    assert.equal(zero.isPositive(), false);
    assert.equal(positive.isPositive(), true);
  });

  test('toString and toJSON work correctly', () => {
    const amount = new Amount(123);
    assert.equal(amount.toString(), '123');
    assert.equal(amount.toJSON(), 123);
  });

  test('static factory methods work correctly', () => {
    const fromNumber = Amount.fromNumber(456);
    const zero = Amount.zero();
    
    assert.equal(fromNumber.value, 456);
    assert.equal(zero.value, 0);
  });

  test('static max works correctly', () => {
    const amounts = [new Amount(10), new Amount(50), new Amount(30)];
    const max = Amount.max(...amounts);
    
    assert.equal(max.value, 50);
    assert.throws(() => Amount.max(), /Must provide at least one amount/);
  });

  test('static min works correctly', () => {
    const amounts = [new Amount(10), new Amount(50), new Amount(30)];
    const min = Amount.min(...amounts);
    
    assert.equal(min.value, 10);
    assert.throws(() => Amount.min(), /Must provide at least one amount/);
  });

  test('static sum works correctly', () => {
    const amounts = [new Amount(10), new Amount(20), new Amount(30)];
    const sum = Amount.sum(...amounts);
    
    assert.equal(sum.value, 60);
    
    const emptySum = Amount.sum();
    assert.equal(emptySum.value, 0);
  });

  test('overflow protection works', () => {
    const large = new Amount(Number.MAX_SAFE_INTEGER);
    const one = new Amount(1);
    
    assert.throws(() => large.add(one), /Addition would exceed maximum safe integer/);
    assert.throws(() => large.multiply(2), /Multiplication would exceed maximum safe integer/);
  });
});