/**
 * Telehealth Dynamic Form Engine
 * Handles branching logic (show_if), exclusive choices, and clean state mutations.
 */

export function isFilled(v) {
  if (v === undefined || v === null || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

/**
 * Evaluates whether a question or section is visible based on condition and current answers.
 * Implements the exact recursive specification from the API documentation.
 */
export function isVisible(cond, answers = {}) {
  if (!cond) return true;
  if (cond.any && Array.isArray(cond.any)) {
    return cond.any.some((c) => isVisible(c, answers));
  }
  if (cond.all && Array.isArray(cond.all)) {
    return cond.all.every((c) => isVisible(c, answers));
  }

  const v = answers[cond.question];
  const filled = isFilled(v);

  if ('equals' in cond) return v === cond.equals;
  if ('in' in cond && Array.isArray(cond.in)) return cond.in.includes(v);
  if ('includes' in cond) return Array.isArray(v) && v.includes(cond.includes);
  if ('filled' in cond) return filled === Boolean(cond.filled);

  return true;
}

/**
 * Returns visible sections given the full sections array and current answers.
 */
export function getVisibleSections(sections = [], answers = {}) {
  return sections.filter((sec) => isVisible(sec.show_if, answers));
}

/**
 * Returns visible questions inside a section.
 */
export function getVisibleQuestions(section, answers = {}) {
  if (!section || !section.questions) return [];
  return section.questions.filter((q) => isVisible(q.show_if, answers));
}

/**
 * Computes which questions are currently visible across the entire form.
 */
export function getAllVisibleQuestionIds(formDefinition, answers = {}) {
  const visibleIds = new Set();
  const sections = getVisibleSections(formDefinition?.sections || [], answers);
  for (const sec of sections) {
    const questions = getVisibleQuestions(sec, answers);
    for (const q of questions) {
      visibleIds.add(q.id);
    }
  }
  return visibleIds;
}

/**
 * Cleans answers by setting currently-hidden questions to null,
 * so PATCH properly empties them on the server.
 */
export function cleanAnswersForServer(formDefinition, currentAnswers = {}) {
  const visibleQuestionIds = getAllVisibleQuestionIds(formDefinition, currentAnswers);
  const cleaned = { ...currentAnswers };

  // Collect all known question IDs in the form
  for (const sec of formDefinition?.sections || []) {
    for (const q of sec.questions || []) {
      if (!visibleQuestionIds.has(q.id)) {
        // If it had a value, set to null so server removes it
        if (cleaned[q.id] !== undefined && cleaned[q.id] !== null) {
          cleaned[q.id] = null;
        }
      }
    }
  }

  return cleaned;
}

/**
 * Handles multi-choice selection with support for exclusive options.
 * e.g., if 'tidak_ada' is selected, clear everything else; if another is clicked, remove 'tidak_ada'.
 */
export function handleMultiChoiceChange(currentValues = [], optionCode, isExclusive, allOptions = []) {
  let values = Array.isArray(currentValues) ? [...currentValues] : [];
  const alreadySelected = values.includes(optionCode);

  if (alreadySelected) {
    // Uncheck
    return values.filter((v) => v !== optionCode);
  }

  if (isExclusive) {
    // Picking an exclusive option clears all other options
    return [optionCode];
  }

  // Picking a regular option: add it and strip any exclusive options
  const exclusiveCodes = allOptions.filter((opt) => opt.exclusive).map((opt) => opt.code || opt.value || opt.id);
  values = values.filter((v) => !exclusiveCodes.includes(v));
  values.push(optionCode);
  return values;
}

/**
 * Client-side validation helper before next step or submit.
 * Returns { valid: boolean, errors: { [questionId]: errorMessage } }
 */
export function validateAnswers(questions = [], answers = {}) {
  const errors = {};
  const todayStr = new Date().toISOString().split('T')[0];

  for (const q of questions) {
    if (!isVisible(q.show_if, answers)) continue;

    const val = answers[q.id];
    const filled = isFilled(val);

    // Required check
    if (q.required && !filled) {
      errors[q.id] = q.error_message || q.pesan_wajib || `Silakan isi ${q.label || 'pertanyaan ini'}.`;
      continue;
    }

    if (!filled) continue; // Optional and empty is fine

    // Type specific checks
    if (q.type === 'number') {
      const num = Number(val);
      if (isNaN(num)) {
        errors[q.id] = 'Format angka tidak valid.';
      } else {
        if (q.min !== undefined && num < q.min) {
          errors[q.id] = `Nilai minimal adalah ${q.min}${q.unit ? ' ' + q.unit : ''}.`;
        } else if (q.max !== undefined && num > q.max) {
          errors[q.id] = `Nilai maksimal adalah ${q.max}${q.unit ? ' ' + q.unit : ''}.`;
        }
      }
    } else if (q.type === 'text' || q.type === 'textarea') {
      if (q.max_length && String(val).length > q.max_length) {
        errors[q.id] = `Maksimal ${q.max_length} karakter.`;
      }
    } else if (q.type === 'date') {
      if (val > todayStr) {
        errors[q.id] = 'Tanggal tidak boleh di masa depan (maksimal hari ini).';
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
