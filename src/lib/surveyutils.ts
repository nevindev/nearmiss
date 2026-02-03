import type { Survey } from "./types";

function keysForQuestionType(survey: Survey, type: string): string[] {
    let keys: string[] = []
    survey.pages.forEach((page) => page.questions?.forEach((question) => {
        if (question.type === type) {
            keys = [...keys, question.key]
        }
    }))

    return keys
}

export {keysForQuestionType}