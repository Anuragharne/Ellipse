async function testWebhook() {
  try {
    const res = await fetch('http://localhost:3000/api/v1/internal/complaints/random-uuid/ai-results', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-ai-service-secret': 'ellipse-ai-webhook-secret-67890',
      },
      body: JSON.stringify({
        wasteTypes: ['PLASTIC'],
        tier: 1,
        severityScore: 0.5
      })
    });
    
    if (res.ok) {
      console.log('Success:', await res.json());
    } else {
      console.error('Error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testWebhook();
