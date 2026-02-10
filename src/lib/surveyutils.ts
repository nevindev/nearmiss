import type { Survey, Report } from "./types";

function keysForQuestionType(survey: Survey, type: string): string[] {
    let keys: string[] = []
    survey.pages.forEach((page) => page.questions?.forEach((question) => {
        if (question.type === type) {
            keys = [...keys, question.key]
        }
    }))

    return keys
}

function isStringArray(value: any): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(item => typeof item === 'string');
}

export {keysForQuestionType, isStringArray}