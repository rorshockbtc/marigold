import { describe, it, expect } from 'vitest';
import { 
  levenshtein, 
  jaroWinkler, 
  isNicknameMatch, 
  compareAddresses, 
  fellegiSunterScore 
} from '@/lib/linkage/fellegi-sunter';

describe('Fellegi-Sunter Algorithm Core Mathematics', () => {

  describe('String Distances', () => {
    it('levenshtein() correctly calculates edit distance', () => {
      expect(levenshtein('kitten', 'sitting')).toBe(3);
      expect(levenshtein('flitten', 'flitten')).toBe(0);
      expect(levenshtein('', 'sitting')).toBe(7);
      expect(levenshtein('kitten', '')).toBe(6);
    });

    it('jaroWinkler() calculates prefix-heavy similarity', () => {
      expect(jaroWinkler('MARTHA', 'MARHTA')).toBeGreaterThan(0.9);
      expect(jaroWinkler('JONES', 'JOHNSON')).toBeGreaterThan(0.7);
      expect(jaroWinkler('DIXON', 'DICKSONX')).toBeGreaterThan(0.7);
      expect(jaroWinkler('TEST', 'TEST')).toBe(1.0);
      expect(jaroWinkler('', 'TEST')).toBe(0.0);
    });
  });

  describe('Nickname Resolution', () => {
    it('isNicknameMatch() detects standard aliases', () => {
      expect(isNicknameMatch('Robert', 'Bob')).toBe(true);
      expect(isNicknameMatch('William', 'Bill')).toBe(true);
      expect(isNicknameMatch('Elizabeth', 'Liz')).toBe(true);
      expect(isNicknameMatch('Jonathan', 'Bob')).toBe(false);
      expect(isNicknameMatch('John', 'John')).toBe(true);
    });
  });

  describe('Address Comparison', () => {
    it('compareAddresses() standardizes and compares street strings', () => {
      expect(compareAddresses('123 MAIN STREET', '123 MAIN ST')).toBe(1.0);
      expect(compareAddresses('456 OAK AVENUE', '456 OAK AVE')).toBe(1.0);
      expect(compareAddresses('789 PINE BOULEVARD', '789 PINE BLVD')).toBe(1.0);
    });

    it('compareAddresses() heavily penalizes divergent house numbers', () => {
      const score = compareAddresses('123 MAIN ST', '124 MAIN ST');
      expect(score).toBeLessThan(0.4); // House number mismatch penalty
    });

    it('compareAddresses() handles missing data safely', () => {
      expect(compareAddresses('', '123 MAIN ST')).toBe(0.0);
      expect(compareAddresses(undefined, '123 MAIN ST')).toBe(0.0);
    });
  });

  describe('Fellegi-Sunter Log-Odds Engine', () => {
    it('computes MATCH_HIGH for identical records', () => {
      const record = {
        first_name: 'JOHN',
        last_name: 'SMITH',
        dob: '1980-01-01',
        address: '123 MAIN ST',
        zip: '12345'
      };
      
      const res = fellegiSunterScore(record, record);
      expect(res.verdict).toBe('MATCH_HIGH');
      expect(res.confidence).toBeGreaterThan(90);
      expect(res.totalScore).toBeGreaterThan(15.0);
    });

    it('computes MATCH_HIGH for records with nickname and typo', () => {
      const recordA = {
        first_name: 'ROBERT',
        last_name: 'JOHNSON',
        dob: '1975-06-15',
        address: '456 OAK AVENUE',
        zip: '90210'
      };
      
      const recordB = {
        first_name: 'BOB', // Nickname
        last_name: 'JOHNSEN', // Typo
        dob: '1975-06-15',
        address: '456 OAK AVE', // Abbreviation
        zip: '90210'
      };
      
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.verdict).toBe('MATCH_HIGH');
      expect(res.fieldScores.firstName).toBe(3.8); // Nickname score
      expect(res.fieldScores.lastName).toBe(4.0); // High typo match
    });

    it('triggers the Generational Traps (SR vs JR)', () => {
      const recordA = {
        first_name: 'JOHN',
        last_name: 'SMITH SR',
        dob: '1950-01-01',
        address: '123 MAIN ST',
        zip: '12345'
      };
      
      const recordB = {
        first_name: 'JOHN',
        last_name: 'SMITH JR',
        dob: '1975-01-01',
        address: '123 MAIN ST',
        zip: '12345'
      };
      
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.verdict).toBe('REJECT_LOW');
      expect(res.totalScore).toBe(-15.0);
      expect(res.explanation).toContain('Explicit generational suffix discrepancy detected');
    });

    it('triggers the DOB Generational Trap (>3 years apart)', () => {
      const recordA = {
        first_name: 'MARY',
        last_name: 'JOHNSON',
        dob: '1960-05-05',
        address: '123 MAIN ST',
        zip: '12345'
      };
      
      const recordB = {
        first_name: 'MARY',
        last_name: 'JOHNSON',
        dob: '1990-05-05', // 30 years apart
        address: '123 MAIN ST',
        zip: '12345'
      };
      
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.verdict).toBe('REJECT_LOW');
      expect(res.totalScore).toBe(-15.0);
      expect(res.explanation).toContain('Birth years diverge by 30 years');
    });

    it('handles missing fields gracefully', () => {
      const recordA = {
        first_name: 'JOHN',
        last_name: 'SMITH',
      };
      
      const recordB = {
        first_name: 'JOHN',
        last_name: 'SMITH',
      };
      
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.dob).toBe(0);
      expect(res.fieldScores.address).toBe(0);
      expect(res.fieldScores.zip).toBe(0);
      expect(res.fieldScores.firstName).toBe(4.2);
      expect(res.fieldScores.lastName).toBe(6.5);
    });

    it('penalizes completely different records', () => {
      const recordA = {
        first_name: 'WILLIAM',
        last_name: 'SHAKESPEARE',
        dob: '1564-04-26',
        address: 'STRATFORD UPON AVON',
        zip: '12345'
      };
      
      const recordB = {
        first_name: 'GEORGE',
        last_name: 'WASHINGTON',
        dob: '1732-02-22',
        address: 'MOUNT VERNON',
        zip: '54321'
      };
      
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.verdict).toBe('REJECT_LOW');
      expect(res.totalScore).toBeLessThan(0);
    });

    it('returns REVIEW_MODERATE for partial matches', () => {
      const recordA = {
        first_name: 'JONATHAN',
        last_name: 'SMITH',
        dob: '1980-01-01',
        address: '123 MAIN ST',
        zip: '12345'
      };
      
      const recordB = {
        first_name: 'JON',
        last_name: 'SMITH',
        dob: '1980-02-01', // Different month
        address: '999 OTHER ST', // Relocation
        zip: '54321' // Different zip
      };
      
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.verdict).toBe('REVIEW_MODERATE');
      expect(res.fieldScores.zip).toBe(-1.5);
    });

    it('handles empty strings for jaro winkler correctly', () => {
      const recordA = {
        first_name: 'JOHN',
        last_name: 'SMITH',
        dob: '',
        address: '',
        zip: ''
      };
      const recordB = {
        first_name: 'JOHN',
        last_name: 'SMITHSON',
        dob: '',
        address: '',
        zip: ''
      };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.lastName).toBe(4.0);
    });

    it('hits the 0.5 lastName score branch', () => {
      const recordA = { first_name: 'JOHN', last_name: 'SMITH' };
      const recordB = { first_name: 'JOHN', last_name: 'SMYTHE' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.lastName).toBe(1.0);
    });

    it('hits the address partial match branches', () => {
      const recordA = { address: '123 MAIN ST', first_name: 'A', last_name: 'B' };
      const recordB = { address: '123 MAIN STREET APT 4', first_name: 'A', last_name: 'B' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.address).toBeGreaterThan(0);
    });

    it('hits the generational surname penalty', () => {
      // Line 302
      // One has suffix, the other doesn't (to avoid the early return trap)
      const recordA = { first_name: 'JOHN', last_name: 'SMITH SR' };
      const recordB = { first_name: 'MICHAEL', last_name: 'SMITH' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.lastName).toBeLessThan(1.0);
    });

    it('hits the partial DOB match (same year)', () => {
      // Line 316
      const recordA = { first_name: 'A', last_name: 'B', dob: '1980-01-01' };
      const recordB = { first_name: 'A', last_name: 'B', dob: '1980-12-31' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.dob).toBe(1.5);
    });

    it('hits the REJECT_LOW confidence scaling', () => {
      // Lines 358-359
      const recordA = { first_name: 'ZZZ', last_name: 'XXX', dob: '1111-11-11', address: 'YYY', zip: '00000' };
      const recordB = { first_name: 'AAA', last_name: 'BBB', dob: '2222-22-22', address: 'CCC', zip: '99999' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.verdict).toBe('REJECT_LOW');
      expect(res.confidence).toBe(0); // Clamped to 0
    });

    it('handles first name missing data neutral', () => {
      // Line 278
      const recordA = { first_name: '', last_name: 'SMITH' };
      const recordB = { first_name: 'JOHN', last_name: 'SMITH' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.firstName).toBe(0);
    });

    it('hits the 1.0 lastName partial match branch', () => {
      // Lines 290-293 (jw >= 0.82 and < 0.90)
      // Jaro-Winkler of WILLIAMS and WILLIS is ~ 0.85
      const recordA = { first_name: 'JOHN', last_name: 'WILLIAMS' };
      const recordB = { first_name: 'JOHN', last_name: 'WILLIS' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.lastName).toBe(1.0);
    });

    it('hits the dob total mismatch branch', () => {
      // Line 318
      const recordA = { first_name: 'A', last_name: 'B', dob: '1980-01-01' };
      const recordB = { first_name: 'A', last_name: 'B', dob: '1981-12-31' };
      const res = fellegiSunterScore(recordA, recordB);
      expect(res.fieldScores.dob).toBe(-6.0);
    });
  });
});
