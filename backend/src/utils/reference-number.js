import crypto from 'node:crypto';

function createReferenceNumber() {
  const date = new Date();
  const datePart = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0')
  ].join('');
  const randomPart = crypto.randomBytes(8).toString('hex').toUpperCase();

  return `GRV-${datePart}-${randomPart}`;
}

export default createReferenceNumber;
