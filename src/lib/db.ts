import Dexie, { type EntityTable } from "dexie";
import type { AnonymousUser, Notification, Report, Status, Incident, SurveyStatus } from "./types";
import type { Position } from "geojson";
import { positionToPoint } from "./geoutils";


const db = new Dexie('NearMissLocal') as Dexie & {
  anonymousUsers: EntityTable<AnonymousUser, 'user_id'>,
  reports: EntityTable<Report, 'id'>
  notifications: EntityTable<Notification, 'id'>
};
db.version(1).stores({
  // anonymousUsers: '++id',
  // reports: '++id, date, location, user_id, endpoints',
  reports: '++id, date, location, report_types, description, reporting, impacted, children_present, along_paths, areas, travel_lanes, weather_conditions, pedestrian_behaviors, vehicle_behaviors, environmental_factors, comments, survey_status',
  // notifications: '++id, kind, title, subtitle, show, timeout'
});

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

// async function createReport(user_id: string, incident: Incident): Promise<number> {
//   try {
//     const id = await db.reports.add({
//       user_id: user_id,
//       incident: incident
//     });

//     return id;
//   } catch (error: unknown) {
//     console.log(error)
//     throw Error("Could not save report locally")
//   }
// }

async function createReport(date: Date, position: Position): Promise<string | number | null> {
  try {
    const now = new Date()
    const id = await db.reports.add({
      position: position,
      date: date,
      inserted_at: now,
      updated_at: now,
      submitted: false
    })
    return id
  } catch (error: unknown) {
    console.log(error)
    return null
  }
}

// async function createReport(incident: Incident): Promise<number> {
//   try {
//     const id = await db.reports.add({
//       // user_id: user_id,
//       // incident: incident,
//       date: new Date()
//       submitted: false
//     });

//     return id;
// } catch (error: unknown) {
//   console.log(error)
//   throw Error("Could not save report locally")
// }
// }

async function updateReportPosition(position: Position, id: string | number): Promise<number> {
  return db.reports.update(id, { "position": position })
}

// async function updateReportSurveyPage(id: number, page: number): Promise<number> {
//   return db.reports.update(id, { "survey_page": page })
// }

async function updateReportSubmitted(id: string | number): Promise<number> {
  return db.reports.update(id, { "submitted": true })
}

// async function updateReportIncident(id: number, incident: Incident): Promise<number> {
//   // const {point, ...incidentWithoutPoint} = incident
//   return db.reports.update(id, { "incident": incident })
// }

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

export { db, dropDB, clearReports, createAnonymousUser, createReport, updateReportPosition, updateReportSubmitted, createNotification };