/**
 * These are types that get used in core places in the system
 *
 * You are free to use them! Just don't modify them without thorough testing
 */

// Dev Note: Yes, the types need to be exported directly otherwise the Typescript compiler will get confused

/* Types used to make life easy */
/** A Type that takes keys from a given object and a return type and make that a reality */
export type KeyMapper<C extends object, T> = { [P in keyof C]: T };
/** A Type that takes a list of key *out* of an object, returning the result */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** Allows strings or numbers, which can both be turned into string */
export type StringNum = string | number;
