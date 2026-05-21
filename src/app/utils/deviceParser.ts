export const getDeviceInfo = (userAgent: string | undefined): string => {
  if (!userAgent) return "Unknown Device";

  let os = "Unknown OS";
  let browser = "Unknown Browser";

  // Detect OS
  if (userAgent.includes("Windows NT 10.0")) {
    os = "Windows 10/11";
  } else if (userAgent.includes("Windows NT 6.1")) {
    os = "Windows 7";
  } else if (userAgent.includes("Android")) {
    const match = userAgent.match(/Android\s([0-9\.]+)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (userAgent.includes("iPhone")) {
    const match = userAgent.match(/OS\s([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iPhone";
  } else if (userAgent.includes("iPad")) {
    os = "iPadOS";
  } else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X")) {
    const match = userAgent.match(/Mac OS X\s([0-9_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  }

  // Detect Browser
  if (userAgent.includes("Edg/")) {
    const match = userAgent.match(/Edg\/([0-9\.]+)/);
    browser = match ? `Edge ${match[1].split(".")[0]}` : "Edge";
  } else if (userAgent.includes("Chrome/")) {
    const match = userAgent.match(/Chrome\/([0-9\.]+)/);
    browser = match ? `Chrome ${match[1].split(".")[0]}` : "Chrome";
  } else if (userAgent.includes("Firefox/")) {
    const match = userAgent.match(/Firefox\/([0-9\.]+)/);
    browser = match ? `Firefox ${match[1].split(".")[0]}` : "Firefox";
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    const match = userAgent.match(/Version\/([0-9\.]+)/);
    browser = match ? `Safari ${match[1].split(".")[0]}` : "Safari";
  }

  return `${browser} on ${os}`;
};
