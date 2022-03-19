export type JSONValue =
	| JSONString
	| JSONBoolean
	| JSONNull
	| JSONNumber
	| JSONObject
	| JSONArray;

export type JSONObject = { [property: string]: JSONValue };
export type JSONArray = JSONValue[];

export type JSONString = string;

export type JSONNumber = number;

export type JSONBoolean = boolean;

export type JSONNull = null;
