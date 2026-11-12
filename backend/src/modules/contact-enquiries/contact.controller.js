import ContactEnquiry from './contact.model.js';

export async function createEnquiry(req, res) {
  const { name, email, subject, message } = req.body;
  const enquiry = await ContactEnquiry.create({
    name: name.trim(), email: email.toLowerCase().trim(),
    subject: subject.trim(), message: message.trim()
  });
  return res.status(201).json({ success: true, data: { enquiryId: enquiry._id } });
}

export async function listEnquiries(req, res) {
  const { page, limit } = req.validated.query;
  const [enquiries, total] = await Promise.all([
    ContactEnquiry.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ContactEnquiry.countDocuments()
  ]);
  return res.json({ success: true, data: { enquiries, page, limit, total } });
}

export async function updateEnquiry(req, res) {
  const enquiry = await ContactEnquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!enquiry) throw createHttpError(404, 'Enquiry not found.');
  return res.json({ success: true, data: { enquiry } });
}
