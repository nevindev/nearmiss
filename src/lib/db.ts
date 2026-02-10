import Dexie, { type EntityTable, type Table } from "dexie";
import type { AnonymousUser, Notification, Report, Status, Incident, SurveyStatus, SurveyAnswer } from "./types";
import type { Position } from "geojson";
import { positionToPoint } from "./geoutils";


const db = new Dexie('NearMissLocal') as Dexie & {
  anonymousUsers: EntityTable<AnonymousUser, 'user_id'>,
  reports: EntityTable<Report, 'id'>,
  notifications: EntityTable<Notification, 'id'>,
  // surveyAnswers: EntityTable<SurveyAnswer, '[report_id+survey_id]'>
  surveyAnswers: Table<SurveyAnswer, '[report_id+survey_id]'>
};
// db.version(1).stores({
// anonymousUsers: '++id',
// reports: '++id, date, location, user_id, endpoints',
// reports: '++id, date, location, report_types, description, reporting, impacted, children_present, along_paths, areas, travel_lanes, weather_conditions, pedestrian_behaviors, vehicle_behaviors, environmental_factors, comments, survey_status',
// notifications: '++id, kind, title, subtitle, show, timeout'
// });

db.version(1).stores({
  reports: '++id, date, position, inserted_at, updated_at',
  surveyAnswers: '[report_id+survey_id], submitted, report_id, survey_id'
})


function clearReports() {
  db.reports.clear();
}

function dropDB() {
  db.delete();
}

async function createAnonymousUser(user_id: string): Promise<string> {
  try {
    const id = await db.anonymousUsers.add(({ user_id: user_id }))
    return id
  } catch (error: unknown) {
    console.log(error)
    throw Error("Could not save anonymous user locally")
  }
}

async function createReport(date: Date, position: Position): Promise<string | number | null> {
  try {
    const now = new Date()
    const id = await db.reports.add({
      position: position,
      date: date,
      inserted_at: now,
      updated_at: now,
    })
    return id
  } catch (error: unknown) {
    console.log(error)
    return null
  }
}

async function createSurveyAnswer(survey_id: string | number, report_id: string | number): Promise<string | number | null> {
  try {
    const id = await db.surveyAnswers.add({
      survey_id: survey_id,
      report_id: report_id,
      submitted: false,
      last_page_viewed: 1,
      answer_string: ""
    })
    return id
  } catch (error: unknown) {
    console.log(error)
    return null
  }
}

async function getSurveyAnswerBySurveyAndReport(survey_id: string | number, report_id: string | number): Promise<SurveyAnswer | undefined> {
  return db.surveyAnswers.where({ survey_id: survey_id, report_id: report_id }).first()
}

async function getOrCreateSurveyAnswer(survey_id: string | number, report_id: string | number): Promise<SurveyAnswer | undefined> {
  let surveyAnswer = await getSurveyAnswerBySurveyAndReport(survey_id, report_id)
  if (surveyAnswer !== undefined) {
    return surveyAnswer
  } else {
    let id = await createSurveyAnswer(survey_id, report_id)
    if (id === null) {
      return undefined
    } else {
      surveyAnswer = await getSurveyAnswerBySurveyAndReport(survey_id, report_id)
      return surveyAnswer
    }
  }
}

async function getAllSurveyAnswersForReportIds(report_ids: (string | number)[]): Promise<SurveyAnswer[]> {
  return db.surveyAnswers.where('report_id').anyOf(report_ids).toArray();
  
}

// async function deleteReport(id: string | number): Promise<number> {
//   db.reports.delete(id)
// }


async function updateReportPosition(position: Position, id: string | number): Promise<number> {
  return db.reports.update(id, { "position": position })
}

async function updateSurveyAnswerText(answer_string: string, surveyAnswer: SurveyAnswer): Promise<number> {
  return db.surveyAnswers.update(surveyAnswer, { "answer_string": answer_string })
}

async function updateSurveyAnswerSubmitted(submitted: boolean, surveyAnswer: SurveyAnswer): Promise<number> {
  return db.surveyAnswers.update(surveyAnswer, { "submitted": submitted })
}

async function updateSurveyAnswerLastPageViewed(page: number, surveyAnswer: SurveyAnswer): Promise<number> {
  return db.surveyAnswers.update(surveyAnswer, { "last_page_viewed": page })
}

async function createNotification(status: Status): Promise<number> {
  try {
    const id = await db.notifications.add({
      status: status
    });

    return id;
  } catch (error: unknown) {
    throw Error('Could not save notification');
  }
}

export { db, dropDB, clearReports, createAnonymousUser, createReport, createSurveyAnswer, getOrCreateSurveyAnswer, getAllSurveyAnswersForReportIds, updateSurveyAnswerText, updateSurveyAnswerSubmitted, updateSurveyAnswerLastPageViewed, updateReportPosition, createNotification };