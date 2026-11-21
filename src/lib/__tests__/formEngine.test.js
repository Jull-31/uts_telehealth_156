import { describe, it, expect } from 'vitest';
import {
  isFilled,
  isVisible,
  handleMultiChoiceChange,
  cleanAnswersForServer,
  validateAnswers,
} from '../formEngine';

describe('Form Engine Unit Tests', () => {
  describe('isFilled', () => {
    it('treats 0 as filled (valid value for scales & numbers)', () => {
      expect(isFilled(0)).toBe(true);
      expect(isFilled('0')).toBe(true);
    });

    it('treats empty string, null, undefined, empty array as not filled', () => {
      expect(isFilled('')).toBe(false);
      expect(isFilled(null)).toBe(false);
      expect(isFilled(undefined)).toBe(false);
      expect(isFilled([])).toBe(false);
    });

    it('treats strings, booleans, and non-empty arrays as filled', () => {
      expect(isFilled('ya')).toBe(true);
      expect(isFilled(false)).toBe(true);
      expect(isFilled(['hipertensi'])).toBe(true);
    });
  });

  describe('isVisible conditions', () => {
    it('returns true when cond is null or undefined', () => {
      expect(isVisible(null, {})).toBe(true);
      expect(isVisible(undefined, {})).toBe(true);
    });

    it('handles equals condition', () => {
      const cond = { question: 'ada_keluhan', equals: 'ya' };
      expect(isVisible(cond, { ada_keluhan: 'ya' })).toBe(true);
      expect(isVisible(cond, { ada_keluhan: 'tidak' })).toBe(false);
      expect(isVisible(cond, {})).toBe(false);
    });

    it('handles in condition', () => {
      const cond = { question: 'sumber_pengisi', in: ['pendamping', 'keluarga'] };
      expect(isVisible(cond, { sumber_pengisi: 'pendamping' })).toBe(true);
      expect(isVisible(cond, { sumber_pengisi: 'pasien' })).toBe(false);
    });

    it('handles includes condition for multi_choice', () => {
      const cond = { question: 'riwayat_penyakit', includes: 'lainnya' };
      expect(isVisible(cond, { riwayat_penyakit: ['hipertensi', 'lainnya'] })).toBe(true);
      expect(isVisible(cond, { riwayat_penyakit: ['hipertensi'] })).toBe(false);
      expect(isVisible(cond, {})).toBe(false);
    });

    it('handles filled condition', () => {
      const cond = { question: 'suhu_tubuh', filled: true };
      expect(isVisible(cond, { suhu_tubuh: 36.5 })).toBe(true);
      expect(isVisible(cond, { suhu_tubuh: 0 })).toBe(true);
      expect(isVisible(cond, { suhu_tubuh: null })).toBe(false);
      expect(isVisible(cond, {})).toBe(false);
    });

    it('handles any condition (OR)', () => {
      const cond = {
        any: [
          { question: 'suhu_tubuh', filled: true },
          { question: 'berat_badan', filled: true },
        ],
      };
      expect(isVisible(cond, { suhu_tubuh: 37 })).toBe(true);
      expect(isVisible(cond, { berat_badan: 60 })).toBe(true);
      expect(isVisible(cond, {})).toBe(false);
    });

    it('handles all condition (AND)', () => {
      const cond = {
        all: [
          { question: 'ada_keluhan', equals: 'ya' },
          { question: 'mengganggu_aktivitas', equals: 'ya' },
        ],
      };
      expect(isVisible(cond, { ada_keluhan: 'ya', mengganggu_aktivitas: 'ya' })).toBe(true);
      expect(isVisible(cond, { ada_keluhan: 'ya', mengganggu_aktivitas: 'tidak' })).toBe(false);
    });
  });

  describe('Exclusive Options in Multi-Choice', () => {
    const options = [
      { code: 'hipertensi', label: 'Tekanan darah tinggi' },
      { code: 'diabetes', label: 'Diabetes' },
      { code: 'tidak_ada', label: 'Tidak ada', exclusive: true },
    ];

    it('clears all other selections when exclusive option is selected', () => {
      const current = ['hipertensi', 'diabetes'];
      const updated = handleMultiChoiceChange(current, 'tidak_ada', true, options);
      expect(updated).toEqual(['tidak_ada']);
    });

    it('removes exclusive option when a normal option is clicked', () => {
      const current = ['tidak_ada'];
      const updated = handleMultiChoiceChange(current, 'hipertensi', false, options);
      expect(updated).toEqual(['hipertensi']);
    });

    it('unchecks an option if clicked again', () => {
      const current = ['hipertensi', 'diabetes'];
      const updated = handleMultiChoiceChange(current, 'diabetes', false, options);
      expect(updated).toEqual(['hipertensi']);
    });
  });

  describe('cleanAnswersForServer', () => {
    const mockForm = {
      sections: [
        {
          id: 's1',
          questions: [
            { id: 'sumber_pengisi' },
            {
              id: 'nama_pendamping',
              show_if: { question: 'sumber_pengisi', equals: 'pendamping' },
            },
          ],
        },
      ],
    };

    it('replaces hidden question answer with null', () => {
      const currentAnswers = {
        sumber_pengisi: 'pasien',
        nama_pendamping: 'Budi (sebelumnya)',
      };
      const cleaned = cleanAnswersForServer(mockForm, currentAnswers);
      expect(cleaned.sumber_pengisi).toBe('pasien');
      expect(cleaned.nama_pendamping).toBe(null);
    });
  });

  describe('validateAnswers', () => {
    const questions = [
      { id: 'q_req', question: 'Wajib', required: true, type: 'text' },
      { id: 'q_num', question: 'Jumlah Hari', required: true, type: 'number', min: 0, max: 7 },
      { id: 'q_date', question: 'Tanggal', required: false, type: 'date' },
    ];

    it('returns error if required field is missing', () => {
      const res = validateAnswers(questions, { q_num: 3 });
      expect(res.valid).toBe(false);
      expect(res.errors.q_req).toBeDefined();
    });

    it('returns error if number is outside min/max range', () => {
      const res = validateAnswers(questions, { q_req: 'Halo', q_num: 9 });
      expect(res.valid).toBe(false);
      expect(res.errors.q_num).toContain('maksimal adalah 7');
    });

    it('passes when all requirements are met', () => {
      const res = validateAnswers(questions, { q_req: 'Halo', q_num: 4 });
      expect(res.valid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });
  });
});
