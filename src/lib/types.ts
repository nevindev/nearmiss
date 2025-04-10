
import type { Point, Polygon, Position } from "geojson"
// type Point = {
//   type: "Point";
//   //              [long, lat]         
//   coordinates?: (number | null)[]
// }

type Notification = {
  id: number
  status: Status
}

type Status = {
  kind?: | "error" | "info" | "success" | "warning"
  title: string,
  subtitle?: string
  show: boolean
  timeout?: number
}

type AnonymousUser = {
  user_id: string
}

// type Endpoint = {
//   endpoint_id: string,
// }

// type Activity = "walking" | "running" | "cycling" | "scootering" | "driving" | "other"

type Actor = {
  name: string,
  point?: Point
}

type Option = {
  name: string;
  value?: string | boolean;
  checked?: boolean
};

// type Path = "crosswalk" | "sidewalk" | "trail" | "other"

// type Area = "mid-block" | "on street parking" | "parking lot" | "school zone" | "stop sign" | "traffic light" | "work zone" | "other"

// type TravelLane = "protected bike lane" | "unprotected bike lane (painted stripe only)" | "left turn lane" | "right turn lane" | "through lane"

// type PedestrianBehavior = "crossing against a pedestrian signal" | "crossing mid-block" | "walking outside crosswalk" | "other"

// type VehicleBehavior = "approaching/passing too closely" | "catching the yellow light" | "disracted" | "failure to yield to pedestrians/cyclists" | "improper right turn on red" | "jumping the curb" | "riding on sidewalk" | "running red light/stop sign" | "speeding" | "wrong way on a one-way" | "u-turn" | "other"

// type EnvironmentalFactors = "no crosswalk" | "no sidewalk" | "no stop signs or signals" | "not enough time for pedestrians to cross" | "obstruction in walkway or bike lane" | "poor visibility" | "other"

type Incident = {
  point: Point
  date: Date,
  report_types: string[]
  description: string
  reporting: string
  impacted: string[]
  children_present: string
  recurring_incident: string,
  along_paths: string[]
  areas: string[]
  travel_lanes: string[]
  weather_conditions: string
  pedestrian_behaviors: string[]
  vehicle_behaviors: string[]
  environmental_factors: string[]
  comments: string

}

// type ReportType = "near miss" | "dangerous location"

type SurveyStatus = "Not Started" | "In Progress" | "Submitted"

type Report = {
  id: number | string
  position: Position
  date: Date
  inserted_at: Date
  updated_at: Date
  survey?: Record<string, string>
  // user_id: string,
  // incident: Incident,
  // survey_page?: number,
  submitted: boolean
}

type OTPRequest = {
  secret?: string,
  user_id: string,
  otp?: string
}

type OTPResponse = {
  secret?: string,
  qr_code?: string
}

type APIResponse = {
  otp_response?: OTPResponse,
  error?: Error
  success: boolean
}

type Question = {
  legend: string
  key: string
  description: string[]
  required?: boolean
  choices?: string[]
  content?: string
  type: string
}

type SurveyPage = {
  title: string
  description?: string
  questions?: Question[]
}

type Survey = {
  title: string
  pages: SurveyPage[]
}

type Link = {
  href: string,
  title: string,
  icon?: string
}

export type { Question, SurveyPage, Survey, Notification, Status, AnonymousUser, Incident, Report, Actor, OTPResponse, OTPRequest, APIResponse, Option, SurveyStatus, Link }