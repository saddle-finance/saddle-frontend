/**
 * Generates a linear gradient CSS string with two color stops.
 *
 * @param {string} color1 - The start color of the gradient.
 * @param {string} color2 - The end color of the gradient.
 *
 * @returns {string|undefined} - A string that represents a linear gradient with a 90-degree angle, `color1` at the starting position, and `color2` at the ending position. Returns `undefined` if either `color1` or `color2` is not provided.
 */

export function createGradient2(color1?: string, color2?: string) {
  if (color1 && color2)
    return `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`
}
