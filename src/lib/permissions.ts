// Array of permissions
const permissions = [
  "accelerometer",
  "accessibility-events",
  "ambient-light-sensor",
  "background-sync",
  "camera",
  "clipboard-read",
  "clipboard-write",
  "geolocation",
  "gyroscope",
  "local-fonts",
  "magnetometer",
  "microphone",
  "midi",
  "notifications",
  "payment-handler",
  "persistent-storage",
  "push",
  "screen-wake-lock",
  "storage-access",
  "top-level-storage-access",
  "window-management",
];

// Iterate through the permissions and log the result
async function processPermissions() {
  for (const permission of permissions) {
    const result = await getPermission(permission);
    console.log(result);
  }
}

// Query a single permission in a try...catch block and return result
async function getPermission(permission: string): Promise<PermissionState | undefined> {
  try {
    let result;
    if (permission === "top-level-storage-access") {
      result = await navigator.permissions.query({
        name: permission as PermissionName,
        // requestedOrigin: window.location.origin,
      });
    } else {
      result = await navigator.permissions.query({ name: permission as PermissionName });
    }
    return result.state;
  } catch (error) {
    return undefined
    console.log(`${permission} (not supported)`);
  }
}

function permissionText(permission: string, state: PermissionState | undefined): string {
  switch (state) {
    case 'denied':
      return `${permission} ${state}.`;
    case 'granted':
      return '';
    case 'prompt':
      return `${permission} not granted.`;
    default:
      return `${permission} not supported on this device.`;
  }
}

export { processPermissions, getPermission, permissionText }
