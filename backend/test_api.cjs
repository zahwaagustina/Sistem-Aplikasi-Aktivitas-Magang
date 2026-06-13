const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret_key');

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e.message);
  }
}

test();
