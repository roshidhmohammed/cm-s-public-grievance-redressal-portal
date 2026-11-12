import path from 'node:path';
import { createHttpError } from '../../utils/api-response.js';
import Attachment from './attachment.model.js';

export async function registerUploadedFiles(grievanceId, userId, files = [], purpose = 'grievance') {
  if (!files.length) return [];
  return Attachment.insertMany(files.map((file) => ({
    grievance: grievanceId,
    uploadedBy: userId,
    purpose,
    filename: file.filename,
    originalName: path.basename(file.originalname),
    mimeType: file.mimetype,
    size: file.size
  })));
}

export async function getGrievanceAttachments(grievanceId) {
  return Attachment.find({ grievance: grievanceId }).sort({ createdAt: 1 }).lean();
}

export async function getAttachmentsForGrievances(grievanceIds) {
  if (!grievanceIds.length) return new Map();
  const attachments = await Attachment.find({ grievance: { $in: grievanceIds } })
    .sort({ createdAt: 1 })
    .lean();
  const grouped = new Map();
  for (const attachment of attachments) {
    const key = attachment.grievance.toString();
    const files = grouped.get(key) || [];
    files.push(attachment);
    grouped.set(key, files);
  }
  return grouped;
}

export async function findAttachment(grievanceId, filename) {
  const attachment = await Attachment.findOne({ grievance: grievanceId, filename }).lean();
  if (!attachment) throw createHttpError(404, 'Attachment not found.');
  return attachment;
}
