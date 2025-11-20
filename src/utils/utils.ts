import { toValue } from "vue";
import { ParamInput } from "../types/index.dto";

export const isPrimitive = (v: any) => typeof v === "string" || typeof v === "number" || typeof v === "boolean";

export class UseGetError extends Error {
  constructor(message: string) {
    super(`[useGet] ${message}`);
    this.name = "UseGetError";
  }
}

export const deepUnref = <T>(value: T): any => {
  const unwrapped = toValue(value);
  if (Array.isArray(unwrapped)) {
    return unwrapped.map(deepUnref);
  }

  if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)) {
    const result: any = {}
    for (const key in unwrapped) {
      result[key] = deepUnref(unwrapped[key]);
    }
    return result;
  }
  return unwrapped;
};

export const validateParams = (params: any, paramPath: string = "paramRef") => {
  if (params === null || params === undefined) return; // Allow null/undefined for optional params
  if (isPrimitive(params)) return;
  if (Array.isArray(params)) {
    params.forEach((item, i) => {
      if (!isPrimitive(item)) {
        throw new UseGetError(`[${paramPath}[${i}]] must be string | number | boolean, got ${typeof item}`);
      }
    });
    return;
  }
  if (typeof params === "object") {
    if ("path" in params || "query" in params) {
      if (params.path && (!Array.isArray(params.path) || !params.path.every(isPrimitive))) {
        throw new UseGetError(`[${paramPath}.path] must be an array of string | number | boolean`);
      }
      if (params.query && (typeof params.query !== "object" || Array.isArray(params.query))) {
        throw new UseGetError(`[${paramPath}.query] must be a plain object`);
      }
      if (params.query) {
        for (const [k, v] of Object.entries(params.query)) {
          if (!isPrimitive(v) && !(Array.isArray(v) && v.every(isPrimitive))) {
            throw new UseGetError(`[${paramPath}.query.${k}] must be string | number | boolean or array of those`);
          }
        }
      }
      return;
    }
    for (const [k, v] of Object.entries(params)) {
      if (!isPrimitive(v) && !(Array.isArray(v) && v.every(isPrimitive))) {
        throw new UseGetError(`[${paramPath}.${k}] must be string | number | boolean or array of those`);
      }
    }
    return;
  }
  throw new UseGetError(`[${paramPath}] Unsupported type: ${typeof params}`);
};

export const buildUrl = (baseUrl: string, params: ParamInput): string => {
  let pathParts: string[] = [];
  let queryParams: Record<string, any> = {};

  if (isPrimitive(params)) {
    pathParts = [String(params)];
  } else if (Array.isArray(params)) {
    pathParts = params.map(String);
  } else if (params && typeof params === "object") {
    if ("path" in params || "query" in params) {
      if (Array.isArray(params.path)) {
        pathParts = params.path.map(String);
      }

      if (params.query && typeof params.query === "object" && !Array.isArray(params.query)) {
        queryParams = params.query;
      }
    } else {
      queryParams = params;
    }
  }

  const finalPath = pathParts.length > 0 ? `${pathParts.join("/")}` : "";
  const finalQuery = Object.keys(queryParams).length > 0 ?
    `?${new URLSearchParams(Object.entries(queryParams).flatMap(([k, v]) => Array.isArray(v) ? v.map((val: any) => [k, String(v)]) : [[k, String(v)]])).toString()}`
    : "";

  return `${baseUrl}${finalPath}${finalQuery}`;
};