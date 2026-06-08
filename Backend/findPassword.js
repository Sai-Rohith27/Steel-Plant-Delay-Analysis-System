import mysql from 'mysql2/promise';
import fs from 'fs';

const passwords = [
  '', 'root', 'root123', 'admin', 'admin123', 'password', '1234', '12345', '123456', '12345678', 
  'mysql', 'sai#1234', 'sai@1234', 'sai123', 'sai', 'vizag', 'vizag123', 'toor'
];

async function tryPasswords() {
  console.log('🔍 Scanning for your MySQL password...');
  let found = false;
  
  for (const pwd of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pwd
      });
      console.log(`\n\n✅ SUCCESS! We found your password: "${pwd}"`);
      
      // Update .env
      let env = fs.readFileSync('.env', 'utf-8');
      env = env.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${pwd}`);
      fs.writeFileSync('.env', env);
      console.log('✅ Updated your .env file automatically!');
      
      await conn.end();
      found = true;
      break;
    } catch (err) {
      process.stdout.write('.');
    }
  }
  
  if (!found) {
    console.log('\n\n❌ Could not find the password. The reset script might not have worked on your PC.');
  }
}

tryPasswords();
