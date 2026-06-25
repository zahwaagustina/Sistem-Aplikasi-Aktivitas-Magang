import dotenv from 'dotenv';
dotenv.config();

import { sendVerificationEmail } from './utils/mailer.js';

async function test() {
  console.log('Testing sendVerificationEmail from mailer.js...');
  const success = await sendVerificationEmail('callmeyuefii@gmail.com', 'token12345');
  console.log('Success?', success);
}

test();
