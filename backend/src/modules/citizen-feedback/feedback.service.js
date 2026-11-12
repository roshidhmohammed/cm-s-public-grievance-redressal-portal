import { createHttpError } from '../../utils/api-response.js';
import Grievance from '../grievances/grievance.model.js';
import Feedback from './feedback.model.js';
import { hasPublicCmoRemark } from '../grievance-remarks/grievance-remark.service.js';

export async function submitGrievanceFeedback(grievanceId, input, user) {
  const grievance = await Grievance.findById(grievanceId).select('_id citizen status');
  if (!grievance) throw createHttpError(404, 'Grievance not found.');

  if (grievance.citizen.toString() !== user._id.toString()) {
    throw createHttpError(403, 'You can only submit feedback for your own grievance.');
  }
  if (grievance.status !== 'RESOLVED') {
    throw createHttpError(409, 'Feedback is available after the grievance is resolved.');
  }
  if (!await hasPublicCmoRemark(grievance._id)) {
    throw createHttpError(409, 'Feedback requires a public CMO remark.');
  }

  const existingFeedback = await Feedback.exists({ grievance: grievance._id });
  if (existingFeedback) throw createHttpError(409, 'Feedback has already been submitted for this grievance.');

  return Feedback.create({
    grievance: grievance._id,
    citizen: user._id,
    rating: input.rating,
    comment: input.comment?.trim() || ''
  });
}
