const Joi = require('joi');


const RegisterValidator = Joi.object({
  Names: Joi.string().min(3).max(30).required().messages({
    "string.empty": `The Names Can not be empty`,
    "string.required": `The Names are required`
  }),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).messages({
    "string.pattern.base": `Email Should be valid `,
    "string.empty": `Email Can not be Blank`,
    "any.required": `Email is required`,
  }),
  password: Joi.string()
    .required()
    .messages({
      "string.pattern.base": `Password should be between 3 to 30 characters and contain letters or numbers only`,
      "string.empty": `Password cannot be empty`,
      "any.required": `Password is required`,
    }),

  repeatPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    "any.required": `Confirm Password is required`,
  })
})
const LoginValidator = Joi.object({
  email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org',] } }).messages({
    "string.pattern.base": `Email Should be valid `,
    "string.empty": `Email Can not be Blank`,
    "any.required": `Email is required`,
  }),
  password: Joi.string()
    .required()
    .messages({
      "string.pattern.base": `Password should be between 3 to 30 characters and contain letters or numbers only`,
      "string.empty": `Password cannot be empty`,
      "any.required": `Password is required`,
    }),
})
const ResetValidator = Joi.object({
  email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).messages({
    "string.pattern.base": `Email Should be valid `,
    "string.empty": `Email Can not be Blank`,
    "any.required": `Email is required`,
  })
})
const ResetTokenValidator = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": `The Password reset token can not be blank`,
    "any.required": `The Reset token is required`
  }),
  password: Joi.string()
    .required()
    .messages({
      "string.pattern.base": `Password should be between 3 to 30 characters and contain letters or numbers only`,
      "string.empty": `Password cannot be empty`,
      "any.required": `Password is required`,
    }),
  repeatPassword: Joi.any().valid(Joi.ref('password')).required().strict().messages({
    "any.required": `Confirm Password is required`
  })
})
const RefreshTokenValidator = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": `The Password reset token can not be blank`,
    "any.required": `The Reset token is required`
  })
})
const InstitutionValidator = Joi.object({
  InstitutionName: Joi.string().required().messages({
    "string.empty": `The Institution Name can not be blank`,
    "any.required": `The Institution Name is required`
  }),
  County: Joi.string().required().messages({
    "string.empty": `The County can not be blank`,
    "any.required": `The County name is required`
  }),
  SubCounty: Joi.string().required().messages({
    "string.empty": `The Sub County  can not be blank`,
    "any.required": `The Sub County is required`
  })
})
const PollsValidator = Joi.object({
  pollName: Joi.string().required().messages({
    "string.empty": "The Poll Name can not be empty",
    "any.required": "The Poll Name is required"
  }),
  Institution: Joi.string().required().messages({
    "string.empty": "The Institution Name can not be empty",
    "any.required": "The Institution Name is required"
  }),
  CreatedBy: Joi.string().required().messages({
    "string.empty": "The User  can not be empty",
    "any.required": "The User  is required"
  }),
  PollYear: Joi.string().required().messages({
    "string.empty": "The  Poll Year can not be empty",
    "any.required": "The Poll Year  is required"
  }),
})
const VoterValidator = Joi.object({
  Name: Joi.string().required().messages({
    "string.empty":"The Name can not be empty",
    "any.required":"The Name is required"
  }),
  Institution: Joi.string().required().messages({
    "string.empty":"The Institution can not be empty",
    "any.required":"The Institution is required"
  }),
  UserType: Joi.string().required().messages({
    "string.empty":"The User Type can not be empty",
    "any.required":"The User Type is required"
  }),
  voterCategory: Joi.string().required().messages({
    "string.empty":"The user category can not be empty",
    "any.required":"The user category is required"
  }),
})
const CategoryValidator = Joi.object({
  Institution:Joi.string().required().messages({
    "string.empty":"The institution can not be empty",
    "any.required":"The institution is required"
  }),
  CategoryName:Joi.string().required().messages({
    "string.empty":"The Category Name can not be empty",
    "any.required":"The Category Name is required"
  })
})
module.exports = {
  RegisterValidator, RefreshTokenValidator, LoginValidator, ResetValidator, ResetTokenValidator, InstitutionValidator, PollsValidator,VoterValidator,CategoryValidator
}