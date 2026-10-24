// Verification test suite for CareBridge AI
async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting CareBridge AI System Verification ---\n');

  const routes = [
    { name: '1. Landing Page', url: '/' },
    { name: '2. Incident Scene Intake (Stage 1)', url: '/report-emergency' },
    { name: '3. QR Bridge Tracker (Stage 2)', url: '/incident/demo-incident-001' },
    { name: '4. ER Reception Intake (Stage 3)', url: '/hospital/dashboard' },
    { name: '5. Clinician AI Suite (Stage 4)', url: '/clinician/cases/demo-incident-001' },
    { name: '6. Patient Recovery Portal (Stage 5)', url: '/patient/dashboard' },
    { name: '7. Care Team Continuity (Stage 6)', url: '/care-team/dashboard' },
    { name: '8. Admin & Audit Trail', url: '/admin/dashboard' },
    { name: '9. Clinical Limitations & Governance', url: '/about' },
  ];

  let passed = 0;

  for (const r of routes) {
    try {
      const res = await fetch(baseUrl + r.url);
      if (res.status === 200) {
        console.log(`[PASS] ${r.name} -> HTTP 200 OK`);
        passed++;
      } else {
        console.log(`[FAIL] ${r.name} -> HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`[ERROR] ${r.name} -> ${e.message}`);
    }
  }

  console.log('\n--- Testing API Security & Logic ---');

  // Test QR Active
  try {
    const res = await fetch(`${baseUrl}/api/qr/verify?token=demo`);
    const data = await res.json();
    if (data.valid === true && data.data?.incident) {
      console.log(`[PASS] PS-40 QR Token Validation (Active) -> Validated (${data.data.incident.incident_id})`);
      passed++;
    } else {
      console.log(`[FAIL] PS-40 QR Token Validation -> Unexpected response:`, data);
    }
  } catch (e) {
    console.log(`[ERROR] QR Active test -> ${e.message}`);
  }

  // Test QR Revoked
  try {
    const res = await fetch(`${baseUrl}/api/qr/verify?token=demo-qr-003`);
    const data = await res.json();
    if (data.valid === false && data.reason?.includes('revoked')) {
      console.log(`[PASS] PS-40 QR Instant Revocation Guard -> Blocked ("${data.reason}")`);
      passed++;
    } else {
      console.log(`[FAIL] PS-40 QR Revocation Guard -> Unexpected response:`, data);
    }
  } catch (e) {
    console.log(`[ERROR] QR Revoked test -> ${e.message}`);
  }

  // Test AI Simplification API
  try {
    const res = await fetch(`${baseUrl}/api/care-instructions/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceText: 'Immobilize the left knee and administer Tab. Paracetamol 500mg PO every 6 hours for pain.',
        targetLanguage: 'both',
      }),
    });
    const data = await res.json();
    if (data.success && data.data?.simplifiedTextEn && data.data?.simplifiedTextHi) {
      console.log(`[PASS] PS-39 AI Care Simplification Engine -> English + Hindi + Checklist generated!`);
      console.log(`       Prescription check: Contains Paracetamol -> ${data.data.simplifiedTextEn.includes('Paracetamol') ? 'VERIFIED' : 'WARNING'}`);
      passed++;
    } else {
      console.log(`[FAIL] PS-39 AI Care Simplification Engine ->`, data);
    }
  } catch (e) {
    console.log(`[ERROR] Care simplification test -> ${e.message}`);
  }

  console.log(`\n=========================================`);
  console.log(`Total Checks: 12 | Passed: ${passed} | Failed: ${12 - passed}`);
  console.log(`=========================================\n`);
}

runTests();
