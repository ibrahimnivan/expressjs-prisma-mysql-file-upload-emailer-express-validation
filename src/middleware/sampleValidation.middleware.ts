import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

export const validateSampleData = [
  body("name").notEmpty().withMessage('Name is required'),
  body("code").notEmpty().withMessage('Code is required'),

  (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if(!error.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: 'Error',
        errors: error.array(),
      })
    }
  }
]