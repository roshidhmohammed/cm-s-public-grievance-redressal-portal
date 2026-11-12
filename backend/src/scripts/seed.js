import dotenv from 'dotenv';
import mongoose from 'mongoose';
import '../config/env.js';
import User from '../modules/users/user.model.js';
import Department from '../modules/departments/department.model.js';
import { departmentSeedData } from '../modules/departments/department-data.js';

dotenv.config();

async function seed() {
  const { CMO_ADMIN_EMAIL, CMO_ADMIN_PASSWORD, CMO_ADMIN_NAME } = process.env;
  if (!CMO_ADMIN_EMAIL || !CMO_ADMIN_PASSWORD || CMO_ADMIN_PASSWORD.length < 12) {
    throw new Error('Set CMO_ADMIN_EMAIL and a CMO_ADMIN_PASSWORD of at least 12 characters in .env before seeding.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Department.bulkWrite(departmentSeedData.map((department) => ({
    updateOne: {
      filter: { slug: department.slug },
      update: { $setOnInsert: department },
      upsert: true
    }
  })));

  const email = CMO_ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email }).select('+password');
  if (existing && existing.role !== 'cmo') {
    throw new Error('The configured CMO email already belongs to a non-CMO account; use a different email.');
  }
  if (existing) {
    console.log('CMO administrator already exists; no account changes made.');
  } else {
    await User.create({
      fullName: CMO_ADMIN_NAME || 'CMO Administrator',
      email,
      mobile: '',
      password: CMO_ADMIN_PASSWORD,
      role: 'cmo'
    });
    console.log('CMO administrator created.');
  }
  console.log('Department seed complete.');
}

seed()
  .catch((error) => {
    console.error('Database seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
