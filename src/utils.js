export const parseJson = (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
  }
  return false;
}
