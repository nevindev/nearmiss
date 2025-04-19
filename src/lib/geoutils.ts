import { getPermission } from "./permissions";
import { parseStringToFloat } from "./utils";
import {dateToCalendarFormat} from "./dateutils"
import type { Report } from "./types";
import type { FeatureCollection, Feature, Point, Position } from "geojson";
import type { GeoJSONFeature } from "maplibre-gl";

const iconSize = 0.75
const iconScaleFactor = 1.6
const iconPriority = 0

export const fallback = [-77.357, 38.9586];
const walksignBase64: string =
  'data:image/png;base64,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';

export const pbotBase64: string =
  'data:image/webp;base64,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';


export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export async function getPosition(fallback?: Position): Promise<{ permission?: PermissionState, position?: Position }> {
  let state = await getPermission('geolocation');
  if (state !== undefined) {
    let geolocation = await getGeolocation();
    if (geolocation instanceof GeolocationPositionError) {
      return ({ permission: 'denied', position: fallback })
    } else {
      return ({ permission: 'granted', position: geolocation })
    }
  } else {
    return ({ permission: undefined, position: fallback })
  }
}


export const getGeolocation = async (): Promise<Position | GeolocationPositionError> => {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    return [longitude, latitude] as Position
  } catch (error: any) {
    return error as GeolocationPositionError
  }
}

export async function geolocationPromise(): Promise<Position> {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    return [longitude, latitude] as Position
  } catch (error: any) {
    throw error as GeolocationPositionError
  }
}

export function featureToPosition(feature: Feature | undefined): Position {
  if (
    feature &&
    feature.type === 'Feature' &&
    feature.geometry.type === 'Point' &&
    Array.isArray(feature.geometry.coordinates)
  ) {
    return feature.geometry.coordinates;
  } else {
    return [NaN, NaN];
  }
}

export function featureToPositionURLString(feature?: Feature) {
  if (feature?.geometry.type === "Point") {
    return `${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]}`
  } else return `[${NaN}, ${NaN}]`
}

export function positionToURLString(position?: Position) {
  if (position) {
    return `${position[0]}, ${position[1]}`
  } else return `[${NaN}, ${NaN}]`
}

export function featuresFromURLSearchParams(searchParams: URLSearchParams, key: string): Feature[] {
  let features = searchParams.getAll(key)
    .map((position) => position.split(","))
    .map((position) => [parseStringToFloat(position[0]), parseStringToFloat(position[1])])
    .filter((position) => !Number.isNaN(position[0]) || !Number.isNaN(position[1]))
    .map((position, index) => positionToFeature(position, index + 1, index === 0))
  return features

}

export const positionToPoint = (position: Position | Point): Point => {
  if ("type" in position && position.type === "Point") {
    return position
  }
  return {
    type: "Point",
    coordinates: position
  } as Point
}

export function updateProperty(active: boolean): { key: string; value: string | number }[] {
  return [
    { key: 'icon', value: active ? 'active' : 'default' },
    { key: 'priority', value: active ? iconPriority : iconPriority + 1 },
    { key: 'iconSize', value: active ? iconSize * iconScaleFactor : iconSize }
  ];
}

export const reportToFeature = (report: Report, active?: boolean): Feature => {
  return {
    id: report.id,
    type: "Feature",
    properties: {
      description: "Near Miss",
      date: dateToCalendarFormat(report.date),
      submitted: report.submitted,
      icon: active ? 'active' : 'default',
      priority: active ? iconPriority : iconPriority + 1,
      iconSize: active ? iconSize * iconScaleFactor : iconSize
      
    },
    geometry: positionToPoint(report.position)
  }
}

export const positionToFeature = (position: Position | Point, id: string | number, active?: boolean): Feature => {
  return {
    id: id,
    type: "Feature",
    properties: {
      icon: active ? 'active' : 'default',
      priority: active ? iconPriority : iconPriority + 1,
      iconSize: active ? iconSize * 2 : iconSize
    },
    geometry: positionToPoint(position)
  }
}


export const reportsToFeatureCollection = (reports: Report[], selected?: number | string): FeatureCollection => {
  let fc: FeatureCollection = {
    type: "FeatureCollection",
    features: reports.map((report) => reportToFeature(report))
  }

  return fc
}
