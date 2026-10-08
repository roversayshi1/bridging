import type { AnswerConstraints, RequiredForm } from '../types.js';
import { splitValueAndUnit, unitsMatch } from '../normalizers/text.js';
import { detectNumericForm } from '../parsers/rational.js';
import {
  containsDecimalApproximation,
  containsSurd,
  isExpandedPolynomial,
  isFactorisedForm,
} from '../parsers/expression.js';
import { isIntervalNotation } from '../parsers/interval.js';
import { isSetRosterForm } from '../parsers/set.js';

export function resolveConstraints(constraints?: AnswerConstraints): AnswerConstraints {
  return {
    allowEquivalentForms: constraints?.allowEquivalentForms ?? true,
    requireExactForm: constraints?.requireExactForm ?? false,
    requiredForm: constraints?.requiredForm ?? null,
    decimalPlaces: constraints?.decimalPlaces ?? null,
    significantFigures: constraints?.significantFigures ?? null,
    tolerance: constraints?.tolerance ?? null,
    requireUnits: constraints?.requireUnits ?? false,
    acceptedUnits: constraints?.acceptedUnits ?? [],
    ordered: constraints?.ordered ?? false,
    simplifyRequired: constraints?.simplifyRequired ?? false,
  };
}

export function studentFormAllowed(
  studentRaw: string,
  canonicalRaw: string,
  constraints: AnswerConstraints
): boolean {
  const required = constraints.requiredForm;
  if (!required && !constraints.requireExactForm) return true;

  const form = required ?? inferRequiredForm(constraints, canonicalRaw);
  if (!form) {
    if (
      constraints.requireExactForm &&
      containsSurd(canonicalRaw) &&
      containsDecimalApproximation(studentRaw)
    ) {
      return false;
    }
    return true;
  }

  switch (form) {
    case 'fraction':
      return isFractionNotation(studentRaw);
    case 'decimal':
      return (
        detectNumericForm(studentRaw) === 'decimal' ||
        detectNumericForm(studentRaw) === 'integer'
      );
    case 'percentage':
      return /%|percent/i.test(studentRaw);
    case 'simplified-surds':
      return containsSurd(studentRaw) && !containsDecimalApproximation(studentRaw);
    case 'factorised':
      return isFactorisedForm(studentRaw);
    case 'expanded':
      return isExpandedPolynomial(studentRaw);
    case 'set-roster':
      return isSetRosterForm(studentRaw);
    case 'interval':
      return isIntervalNotation(studentRaw);
    default:
      return true;
  }
}

function inferRequiredForm(constraints: AnswerConstraints, canonicalRaw: string): RequiredForm {
  if (constraints.requiredForm) return constraints.requiredForm;
  if (containsSurd(canonicalRaw)) return 'simplified-surds';
  return null;
}

function isFractionNotation(input: string): boolean {
  const form = detectNumericForm(input);
  return form === 'fraction' || form === 'mixed';
}

export function checkUnits(studentRaw: string, constraints: AnswerConstraints): boolean {
  if (!constraints.requireUnits) return true;
  const accepted = constraints.acceptedUnits ?? [];
  if (accepted.length === 0) return true;
  const { unit } = splitValueAndUnit(studentRaw);
  if (!unit) return false;
  return unitsMatch(unit, accepted);
}

export function extractValuePart(input: string, constraints: AnswerConstraints): string {
  if (!constraints.requireUnits) return input;
  return splitValueAndUnit(input).value;
}
