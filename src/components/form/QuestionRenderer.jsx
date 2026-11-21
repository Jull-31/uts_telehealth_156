import React from 'react';
import SingleChoiceQ from './SingleChoiceQ';
import MultiChoiceQ from './MultiChoiceQ';
import ScaleQ from './ScaleQ';
import GadScaleQ from './GadScaleQ';
import TextQ from './TextQ';
import TextareaQ from './TextareaQ';
import NumberQ from './NumberQ';
import DateQ from './DateQ';

export default function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  formId,
}) {
  const isPengukuran = question.data_type === 'pengukuran';
  const isGadQuestion = formId === 'FRM-GAD7' || (question.type === 'scale' && question.max === 3);

  const renderInput = () => {
    switch (question.type) {
      case 'single_choice':
        return (
          <SingleChoiceQ
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        );

      case 'multi_choice':
        return (
          <MultiChoiceQ
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        );

      case 'scale':
        if (isGadQuestion) {
          return (
            <GadScaleQ
              question={question}
              value={value}
              onChange={onChange}
              error={error}
            />
          );
        }
        return (
          <ScaleQ
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        );

      case 'number':
        return (
          <NumberQ
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        );

      case 'date':
        return (
          <DateQ
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        );

      case 'textarea':
        return (
          <TextareaQ
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        );

      case 'text':
      default:
        return (
          <TextQ
            question={question}
            value={value}
            onChange={onChange}
            error={error}
          />
        );
    }
  };

  return (
    <div
      id={`question-${question.id}`}
      className="p-4 sm:p-5 bg-surface rounded-card border border-border/80 shadow-2xs space-y-3 scroll-mt-20 transition-all hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <label
          id={`label-${question.id}`}
          htmlFor={`input-${question.id}`}
          className="text-sm sm:text-base font-semibold text-text leading-snug cursor-pointer"
        >
          {question.question || question.label}
          {question.required && (
            <span className="text-danger ml-1 font-bold" title="Wajib diisi">
              *
            </span>
          )}
        </label>

        {isPengukuran && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            pengukuran
          </span>
        )}
      </div>

      {question.keterangan && (
        <p className="text-xs sm:text-sm text-muted leading-relaxed -mt-1">
          {question.keterangan}
        </p>
      )}

      <div className="pt-1">{renderInput()}</div>
    </div>
  );
}
