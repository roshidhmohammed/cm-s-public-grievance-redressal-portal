import { createReadStream } from 'node:fs';
import path from 'node:path';
import { resolveStoredFile } from '../../services/storage.service.js';
import { findGrievanceForUser } from '../grievances/grievance.service.js';
import { findAttachment, registerUploadedFiles } from './attachment.service.js';

export async function authorizeGrievanceAttachment(req, res, next) {
  req.grievance = await findGrievanceForUser(req.params.grievanceId, req.user);
  return next();
}

export async function uploadAttachments(req, res) {
  const attachments = await registerUploadedFiles(req.grievance._id, req.user._id, req.files, 'supplemental');
  return res.status(201).json({
    success: true,
    data: {
      attachments: attachments.map(({ _id, filename, originalName, mimeType, size }) => ({
        id: _id.toString(), filename, originalName, mimeType, size
      }))
    }
  });
}

export async function downloadAttachment(req, res) {
  await findGrievanceForUser(req.params.grievanceId, req.user);
  const attachment = await findAttachment(req.params.grievanceId, req.params.filename);
  res.type(attachment.mimeType);
  res.attachment(path.basename(attachment.originalName));
  const stream = createReadStream(resolveStoredFile(attachment.filename));
  stream.on('error', (error) => {
    if (error.code === 'ENOENT') {
      res.status(404).end();
    } else {
      res.destroy(error);
    }
  });
  return stream.pipe(res);
}
