export function snakeToCamel(s: string): string {
  return s.replace(/(_\w)/g, (m) => m[1].toUpperCase());
}

export function mapApiToCamel<T>(apiData: any): T {
  const result: any = {};
  for (const key in apiData) {
    if (apiData.hasOwnProperty(key)) {
      result[snakeToCamel(key)] = apiData[key];
    }
  }
  return result;
}
