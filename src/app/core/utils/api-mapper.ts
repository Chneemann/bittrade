// converts snake_case to camelCase
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

// converts camelCase to snake_case
export function camelToSnake(s: string): string {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function mapCamelToApi(data: any): any {
  const result: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      result[camelToSnake(key)] = data[key];
    }
  }
  return result;
}
