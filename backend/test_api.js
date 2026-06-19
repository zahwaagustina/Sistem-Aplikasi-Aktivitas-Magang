const test = async () => {
  try {
    // Login as SUPER_ADMIN
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@magang.local',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    const token = loginData.token;
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\nFetching /api/onboarding/all ...');
    const resOnb = await fetch('http://localhost:5000/api/onboarding/all', { headers });
    const dataOnb = await resOnb.json();
    console.log('Onboarding response status:', resOnb.status);
    console.log('Onboarding data:', dataOnb);

    console.log('\nFetching /api/hr/mentors ...');
    const resMentors = await fetch('http://localhost:5000/api/hr/mentors', { headers });
    const dataMentors = await resMentors.json();
    console.log('Mentors response status:', resMentors.status);
    console.log('Mentors data:', dataMentors);
    
  } catch (err) {
    console.error('Error:', err);
  }
};

test();
