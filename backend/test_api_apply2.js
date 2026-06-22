import { Blob } from 'buffer';
import fs from 'fs';

async function testApply() {
  try {
    // 1. Register a new user
    const randomNum = Math.floor(Math.random() * 10000);
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama: `Pelamar ${randomNum}`,
        username: `pelamar${randomNum}@gmail.com.kandidat`, // oh wait! KANDIDAT role requires no suffix, or does it? Wait, let's look at authController: if it doesn't end with .magang, .pembimbing, .admin... wait! Is there a suffix for KANDIDAT? Wait, in authController, register doesn't support KANDIDAT if there is no suffix except it returns 400.
        password: 'password123'
      })
    });
    // Wait, KANDIDAT registration is through a different endpoint, or maybe just without suffix? 
  } catch (err) {
    console.error(err);
  }
}
testApply();
