import type { Incident } from "./types";
import type { Point, Position } from "geojson";
import { positionToPoint } from "./geoutils";

function createDefaultIncident(position: Position | Point) {
  const incident: Incident = {
    point: positionToPoint(position),
    date: new Date(),
    report_types: [],
    description: "",
    reporting: "",
    impacted: [],
    children_present: "",
    recurring_incident: "",
    along_paths: [],
    areas: [],
    travel_lanes: [],
    weather_conditions: "",
    pedestrian_behaviors: [],
    vehicle_behaviors: [],
    environmental_factors: [],
    comments: ""
  };

  return incident
}

export { createDefaultIncident }