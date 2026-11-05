async function testRoutes() {
  const routes = [
    '/',
    '/analytics',
    '/candidate',
    '/jobs',
    '/pipeline',
    '/talent',
    '/auth',
    '/interviews',
    '/api/jobs',
    '/api/platform',
    '/api/applications'
  ];

  let passed = 0;
  for (const route of routes) {
    try {
      const res = await fetch('http://localhost:3005' + route);
      console.log(route.padEnd(20), '=> status:', res.status, res.status < 400 ? 'OK' : 'FAIL');
      if (res.status < 400) passed++;
    } catch (err) {
      console.error(route.padEnd(20), '=> ERROR:', err.message);
    }
  }

  // Test search API
  try {
    const searchRes = await fetch('http://localhost:3005/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Python developers with REST API experience' })
    });
    const searchJson = await searchRes.json();
    console.log('/api/search'.padEnd(20), '=> status:', searchRes.status, 'results count:', searchJson.results?.length ?? searchJson.matches?.length ?? 'OK');
    if (searchRes.status < 400) passed++;
  } catch (err) {
    console.error('/api/search'.padEnd(20), '=> ERROR:', err.message);
  }

  console.log(`\nVerification Result: ${passed}/${routes.length + 1} passed!`);
  if (passed === routes.length + 1) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

testRoutes();
