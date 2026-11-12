import { submitGrievanceFeedback } from './feedback.service.js';

export async function submitFeedback(req, res) {
  const feedback = await submitGrievanceFeedback(req.params.grievanceId, req.body, req.user);
  return res.status(201).json({
    success: true,
    data: {
      id: feedback._id.toString(),
      grievanceId: feedback.grievance.toString(),
      rating: feedback.rating,
      comment: feedback.comment,
      submittedAt: feedback.createdAt
    }
  });
}
