// Helper script to generate bcrypt hash for passwords
// Usage: node scripts/generatePassword.js <password>

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\nPassword:', password);
    console.log('Bcrypt Hash:', hash);
    console.log('\nYou can use this hash in your SQL insert statement.\n');
  })
  .catch(err => {
    console.error('Error generating hash:', err);
  });
