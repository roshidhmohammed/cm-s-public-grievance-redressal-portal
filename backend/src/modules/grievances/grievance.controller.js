import {
  createGrievance,
  escalateGrievance,
  findGrievanceForUser,
  listGrievances,
  reviewResolution,
  serializeGrievance,
  trackByReference
} from './grievance.service.js';

export async function submit(req, res) {
  const grievance = await createGrievance(req.body, req.user, req.files);
  return res.status(201).json({ success: true, data: await serializeGrievance(grievance, { user: req.user }) });
}

export async function list(req, res) {
  return res.json({ success: true, data: await listGrievances(req.validated.query, req.user) });
}

export async function track(req, res) {
  return res.json({ success: true, data: await trackByReference(req.params.referenceNumber, req.user) });
}

export async function detail(req, res) {
  const grievance = await findGrievanceForUser(req.params.id, req.user);
  return res.json({ success: true, data: await serializeGrievance(grievance, { user: req.user }) });
}

export async function review(req, res) {
  const grievance = await findGrievanceForUser(req.params.id, req.user);
  const updated = await reviewResolution(grievance, req.body, req.user);
  return res.json({ success: true, data: await serializeGrievance(updated, { user: req.user }) });
}

export async function escalate(req, res) {
  const grievance = await findGrievanceForUser(req.params.id, req.user);
  const updated = await escalateGrievance(grievance);
  return res.json({ success: true, data: await serializeGrievance(updated, { user: req.user }) });
}
