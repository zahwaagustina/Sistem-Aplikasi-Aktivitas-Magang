import fetch from 'node-fetch';

async function testLogin() {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'mentor1@example.com', // Let's guess the email the user used, or I can just check the DB
      password: 'password123'
    })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
}

testLogin();
