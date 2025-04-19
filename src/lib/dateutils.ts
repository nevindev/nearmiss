// function dateToLocaleDate(d: string): string {
//   return new Date(d).toLocaleDateString('en-US', {
//     year: 'numeric',
//     weekday: 'long',
//     month: 'long',
//     day: 'numeric'
//   });
// }

// function dateToMMddYYYY(date: Date): string {
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric'
//   });
// }

function dateToMMddYYYY(date: Date): string {
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const YYYY = String(date.getFullYear())
  return `${MM}/${dd}/${YYYY}`
}

function dateToYYYYMMdd(date: Date): string {
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const YYYY = String(date.getFullYear())
  return `${YYYY}-${MM}-${dd}`
}

function formatTo12Hour(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();

  return hours + ':' + minutesStr + ' ' + ampm;
}

function dateTohhmmss(date: Date): string {
  const hh = String(date.getHours() % 12).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const AA = date.getHours() > 12 ? "PM" : "AM"
  return `${hh}:${mm} ${AA}`;
}

function dateTohhmm(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`
}

function dateToCalendarFormat(date: Date): string {
  let dateString = dateToMMddYYYY(date)
  let timeString = formatTo12Hour(date)
  return `${dateString} at ${timeString}`
}

function dateToDatetimeLocalString(date: Date): string {
  return `${dateToYYYYMMdd(date)}T${dateTohhmm(date)}`
}

function subtractYears(date: Date, years: number): Date {
  const newDate = new Date(date)
  newDate.setFullYear(date.getFullYear() - years)
  return newDate
}

// function dateToLocaleTime(d: string): string {
//   return new Date(d).toLocaleTimeString('en-US', {
//     timeStyle: 'short',
//     hour12: true,
//     timeZone: 'UTC'
//   });
// }

export { dateToCalendarFormat, dateToMMddYYYY, dateToYYYYMMdd, dateTohhmmss, subtractYears, dateToDatetimeLocalString }