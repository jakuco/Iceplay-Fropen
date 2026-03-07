import 'dotenv/config';
import mongoose from 'mongoose';
import { hashSync, genSaltSync } from 'bcrypt';
import { UserModel } from './mongo/models/user.model';

const MONGO_URL = process.env.MONGO_URL!;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME!;

const ADMIN_USER = {
  name: 'Super Admin',
  email: 'super@fropen.com',
  password: 'admin123',
  role: ['ADMIN_ROLE'],
  emailValidated: true,
};

async function seed() {
  if (!MONGO_URL || !MONGO_DB_NAME) {
    console.error('ERROR: MONGO_URL or MONGO_DB_NAME is not defined in your .env file');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URL, { dbName: MONGO_DB_NAME });
  console.log('Connected.');

  const existing = await UserModel.findOne({ email: ADMIN_USER.email });

  if (existing) {
    console.log(`User ${ADMIN_USER.email} already exists — skipping creation.`);
  } else {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(ADMIN_USER.password, salt);

    await UserModel.create({
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: hashedPassword,
      role: ADMIN_USER.role,
      emailValidated: ADMIN_USER.emailValidated,
    });

    console.log('');
    console.log('Admin user created successfully:');
    console.log('  Email   :', ADMIN_USER.email);
    console.log('  Password:', ADMIN_USER.password);
    console.log('  Role    : ADMIN_ROLE');
    console.log('');
  }

  await mongoose.disconnect();
  console.log('Done. Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
