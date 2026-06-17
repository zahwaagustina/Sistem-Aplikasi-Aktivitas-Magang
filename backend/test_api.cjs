const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJtZW50b3IxIiwicm9sZSI6Ik1FTlRPUiIsImlhdCI6MTc4MTYwNjI2NiwiZXhwIjoxNzgxNjkyNjY2fQ.NYoUNBpmgKXYp9p-uc-YWjbqBDWlnva8CP_bkBCO00k';

fetch('http://localhost:5000/api/mentor/anak-magang', { headers: { Authorization: `Bearer ${token}` } })
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.message));
