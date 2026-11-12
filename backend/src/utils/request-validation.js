import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid ID.');

export const grievanceIdParamsSchema = z.object({ grievanceId: objectIdSchema });
export const idParamsSchema = z.object({ id: objectIdSchema });

export function validateRequest(schemas) {
  return (req, res, next) => {
    const validated = {};
    const errors = [];

    for (const [section, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[section]);
      if (result.success) {
        validated[section] = result.data;
      } else {
        errors.push(...result.error.issues.map((issue) => ({
          field: [section, ...issue.path].join('.'),
          message: issue.message
        })));
      }
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.validated = validated;
    if (validated.body) req.body = validated.body;
    if (validated.params) req.params = { ...req.params, ...validated.params };
    if (validated.files) req.files = validated.files;
    return next();
  };
}
