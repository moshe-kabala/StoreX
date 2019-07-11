import * as Ajv from "ajv";

export const ajv = new Ajv();

const createIsValidFromValidator = validator => data =>  {
  validator(data);
  const errors = validator.errors;
  return [errors == null, errors] as [boolean, any];
};

export function createIsValid(schema): (data )=> [boolean, any] {
  const validator = ajv.compile(schema);
  return createIsValidFromValidator(validator);
}
