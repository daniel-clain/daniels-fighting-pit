export const helperFunctions = {
  random: (number: number, startAtOne?: boolean) => Math.round((Math.random() * (number + (startAtOne ? -1 : 0))) + (startAtOne ? 1 : 0))
}