import { getPermission } from "./permissions";
import { parseStringToFloat } from "./utils";
import {dateToCalendarFormat} from "./dateutils"
import type { Report } from "./types";
import type { FeatureCollection, Feature, Point, Position } from "geojson";

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

// function watchCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.watchPosition(resolve, reject, options);
//   });
// }

// export const watchGeolocation = async () => {
//   try {
//     const position = await watchCurrentPosition();
//     return position
//   } catch (error) {
//     console.log("Error getting geolocation:", error)
//   }
// }

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

export function featureToPositionURLString(feature: Feature) {
  if (feature.geometry.type === "Point") {
    return `${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]}`
  } else return `[${NaN}, ${NaN}]`
}

export function featureFromURLSearchParams(searchParams: URLSearchParams): Feature | undefined {
  const lng = parseStringToFloat(searchParams.get('lng'));
  const lat = parseStringToFloat(searchParams.get('lat'));
  if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
    return positionToFeature([lng, lat], 0);
  } else return undefined;
}

export function featuresFromURLSearchParams(searchParams: URLSearchParams, key: string): Feature[] {
  // let positions = searchParams.getAll('position')
  let features = searchParams.getAll(key)
    .map((position) => position.split(","))
    .map((position) => [parseStringToFloat(position[0]), parseStringToFloat(position[1])])
    .filter((position) => !Number.isNaN(position[0]) || !Number.isNaN(position[1]))
    .map((position, index) => positionToFeature(position, index))
  // let filtered = parsed
  // .filter((position) => Number.isNaN(position[0]) || Number.isNaN(position[1]))
  // let positions = searchParams.getAll('position').map((position) => [parseStringToFloat(position[0]), parseStringToFloat(position[1])]).filter((position) => Number.isNaN(position[0]) || Number.isNaN(position[1]))
  return features
  // console.log(positions)
  // return []
}

export function positionsFromURLSearchParams(searchParams: URLSearchParams): Position[] {
  let positions = searchParams.getAll('position')
  console.log(positions)
  return []
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

export const reportToFeature = (report: Report): Feature => {
  return {
    type: "Feature",
    properties: {
      id: report.id,
      description: "Near Miss",
      date: dateToCalendarFormat(report.date),
      submitted: report.submitted,
      // localeTime: report.incident.date.toLocaleTimeString(),
      // localeTime: report.date.toLocaleTimeString(),
      icon: 'walksign'
    },
    geometry: positionToPoint(report.position)
  }
}

export const positionToFeature = (position: Position | Point, id: string | number): Feature => {
  return {
    type: "Feature",
    properties: {
      id: id,
      icon: 'walksign'
    },
    geometry: positionToPoint(position)
  }
}

export const positionsToFeatureCollection = (positions: Position[]): FeatureCollection => {
  let fc: FeatureCollection = {
    type: "FeatureCollection",
    features: positions.map((position, index) => positionToFeature(position, index))
  }
  return fc
}


export const reportsToFeatureCollection = (reports: Report[]): FeatureCollection => {
  let fc: FeatureCollection = {
    type: "FeatureCollection",
    features: reports.map((report) => reportToFeature(report))
  }

  return fc
}
