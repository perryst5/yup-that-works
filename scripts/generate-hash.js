import bcrypt from 'bcrypt';

const saltRounds = 10;
const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated hash:', hash);
} catch (err) {
  console.error('Error generating hash:', err);
}
