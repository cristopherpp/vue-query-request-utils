import { ParamInput } from '../types/index.dto';
export declare const isPrimitive: (v: any) => v is string | number | boolean;
export declare class UseGetError extends Error {
    constructor(message: string);
}
export declare const deepUnref: <T>(value: T) => any;
export declare const validateParams: (params: any, paramPath?: string) => void;
export declare const buildUrl: (baseUrl: string, params: ParamInput) => string;
