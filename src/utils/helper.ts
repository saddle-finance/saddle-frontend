/**
 * Get the value of a cookie
 * Source: https://vanillajstoolkit.com/helpers/getcookie/
 * @param name - The name of the cookie
 * @return The cookie value
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    throw new Error(
      "getCookie() is not supported on the server. Fallback to a different value when rendering on the server.",
    )
  }

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts[1].split(";").shift()
  }

  return undefined
}
