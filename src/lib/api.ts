
import type { Report, AnonymousUser, OTPRequest, OTPResponse, APIResponse } from "./types";

const url = "http://localhost:4000/v1"

const headers = {
  'Content-Type': 'application/json'
}

const registerAnonymous = async () => {
  try {
    const response = await fetch(`${url}/anonymous`, {
      method: 'POST',
      headers: headers
    });

    if (response.ok) {
      const data = await response.json() as AnonymousUser
      return data.user_id
    }

  } catch (error: any) {
    console.log(error)
  }
}

const getOTP = async (request: OTPRequest): Promise<APIResponse> => {
  try {
    const response = await fetch(`${url}/anonymous/otp`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(request)

    });

    if (response.ok) {
      return { success: true } as APIResponse
    } else if (response.status === 401) {
      const result = await response.json()
      return { success: false, otp_response: result as OTPResponse } as APIResponse
    } else {
      throw Error("Could not generate OTP.")
    }
  } catch (error: any) {
    return { error: error } as APIResponse
  }
}

const deleteReport = async (report: Report, otp?: string, secret?: string): Promise<APIResponse> => {
  try {
    const response = await fetch(`${url}/reports`, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify({ report: report, otp: otp, secret: secret })
    })

    if (response.ok) {
      return { success: true } as APIResponse
    } else if (response.status === 401) {
      const result = await response.json()
      throw Error("Could not validate OTP")
    } else {
      throw Error("Could not delete report record.")
    }
  } catch (error: any) {
    return { success: false, error: error } as APIResponse
  }
}


const sendReport = async (report: Report): Promise<APIResponse> => {

  const body = JSON.stringify(report)
  console.log(body)
  try {
    const response = await fetch(`${url}/reports`, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (response.ok) {
      // const result = await response.json()
      // console.log(result)
      return { success: true } as APIResponse
    } else {
      throw Error("Could not send report")
    }

    // console.log(response.status)

    // if (response.ok) {
    //   return {
    //     kind: 'info',
    //     title: 'Incident reported!',
    //     show: true,
    //     timeout: 2_000
    //   } as Status;

    // } else {
    //   let body = await response.json();
    //   if (response.status === 400) {
    //     throw Error(body, { cause: 'malformed' });
    //   } else if (response.status == 500) {
    //     throw Error('The report collector may be offline.', { cause: 'offline' });
    //   }

    //   throw Error('Unable to send report to collector.', { cause: 'unknown' });
    // }
  } catch (error: any) {
    return { success: false, error: error } as APIResponse
    // let status: Status = {
    //   kind: 'error',
    //   title: 'Could report incident',
    //   subtitle: 'An unknown error occured',
    //   show: true,

    //   timeout: 4_000
    // };
    // if (error instanceof Error && error.cause) {
    //   status.subtitle = error.message;
    // }
    // return status
  }
  // }
}

export { sendReport, deleteReport, registerAnonymous, getOTP }