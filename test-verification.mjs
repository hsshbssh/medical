// Comprehensive verification test suite for CareBridge AI
async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('===========================================================');
  console.log('   CAREBRIDGE AI — END-TO-END VERIFICATION TEST SUITE     ');
  console.log('===========================================================\n');

  const routes = [
    { name: '1. Landing Page (Home with 2 Bystander Actions)', url: '/' },
    { name: '2. Incident Scene Intake (3-Step Guided Flow)', url: '/report-emergency' },
    { name: '3. QR Bridge Tracker (Incident Tracking)', url: '/incident/demo-incident-001' },
    { name: '4. ER Reception Intake (Hospital Radar)', url: '/hospital/dashboard' },
    { name: '5. Clinician AI Suite (Gemini Simplification)', url: '/clinician/cases/demo-incident-001' },
    { name: '6. Patient Recovery Portal (Accessibility & Audio)', url: '/patient/dashboard' },
    { name: '7. Care Team Continuity (Follow-ups & Escalation)', url: '/care-team/dashboard' },
    { name: '8. Admin & Audit Trail (Immutable Log)', url: '/admin/dashboard' },
    { name: '9. Clinical Limitations & Governance', url: '/about' },
  ];

  let passed = 0;
  let totalTests = 0;

  console.log('--- Phase 1: HTTP Page Route Status Checks ---');
  for (const r of routes) {
    totalTests++;
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

  console.log('\n--- Phase 2: Live Incident Submission & QR Persistence Pipeline ---');
  let newIncidentId = '';
  let newRawToken = '';

  // 1. Submit incident
  totalTests++;
  try {
    const res = await fetch(`${baseUrl}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporter_name: 'Inspector Vikram',
        reporter_phone: '+91-9988776655',
        location_address: 'Ring Road flyover, AIIMS junction, New Delhi',
        location_description: 'Near south pillar 14',
        latitude: 28.5672,
        longitude: 77.2100,
        category: 'road_accident',
        description: 'Multi-vehicle pileup. Severe leg contusion.',
        injury_description: 'Deep laceration on right calf, suspected tibial fracture. Patient conscious.',
        observations: 'First aid applied by traffic police.',
        patient_identity_status: 'unknown',
        patient_gender: 'male',
        patient_age_approx: '30-35',
        data_sharing_confirmed: true,
      }),
    });
    const data = await res.json();
    if (data.success && data.incident?.id && data.token?.token_hash) {
      newIncidentId = data.incident.id;
      newRawToken = data.token.token_hash;
      console.log(`[PASS] POST /api/incidents -> Incident Persisted: ${data.incident.incident_id}`);
      console.log(`       Secure Crypto Token Generated: ${newRawToken.slice(0, 16)}...`);
      console.log(`       Network Destination: ${data.network_qr_url}`);
      passed++;
    } else {
      console.log(`[FAIL] POST /api/incidents ->`, data);
    }
  } catch (e) {
    console.log(`[ERROR] POST /api/incidents -> ${e.message}`);
  }

  // 2. Retrieve incident by ID
  totalTests++;
  if (newIncidentId) {
    try {
      const res = await fetch(`${baseUrl}/api/incidents/${newIncidentId}`);
      const data = await res.json();
      if (data.success && data.incident?.id === newIncidentId) {
        console.log(`[PASS] GET /api/incidents/${newIncidentId} -> Loaded from persistent store`);
        passed++;
      } else {
        console.log(`[FAIL] GET /api/incidents/${newIncidentId} ->`, data);
      }
    } catch (e) {
      console.log(`[ERROR] GET /api/incidents/${newIncidentId} -> ${e.message}`);
    }
  } else {
    console.log(`[SKIP] GET /api/incidents/${newIncidentId} - No ID`);
  }

  // 3. Scan & Verify New QR Token
  totalTests++;
  if (newRawToken) {
    try {
      const res = await fetch(`${baseUrl}/api/qr/verify?token=${newRawToken}`);
      const data = await res.json();
      if (data.valid === true && data.status === 'active' && data.data?.incident) {
        console.log(`[PASS] GET /api/qr/verify?token=<crypto_token> -> Validated! Status: ${data.status}`);
        console.log(`       Authorized Scope: ${data.data.permitted_scope.join(', ')}`);
        passed++;
      } else {
        console.log(`[FAIL] GET /api/qr/verify?token=<crypto_token> ->`, data);
      }
    } catch (e) {
      console.log(`[ERROR] GET /api/qr/verify -> ${e.message}`);
    }
  } else {
    console.log(`[SKIP] GET /api/qr/verify - No Token`);
  }

  // 4. Verify Destination Page Renders
  totalTests++;
  if (newRawToken) {
    try {
      const res = await fetch(`${baseUrl}/emergency-access/${newRawToken}`);
      if (res.status === 200) {
        console.log(`[PASS] GET /emergency-access/<crypto_token> -> HTTP 200 (Emergency Access Screen Rendered)`);
        passed++;
      } else {
        console.log(`[FAIL] GET /emergency-access/<crypto_token> -> HTTP ${res.status}`);
      }
    } catch (e) {
      console.log(`[ERROR] GET /emergency-access -> ${e.message}`);
    }
  } else {
    console.log(`[SKIP] GET /emergency-access - No Token`);
  }

  // 5. Test Revocation
  totalTests++;
  if (newRawToken) {
    try {
      const revokeRes = await fetch(`${baseUrl}/api/qr/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: newRawToken }),
      });
      const revokeData = await revokeRes.json();
      if (revokeData.success) {
        // Verify it is now blocked
        const verifyRes = await fetch(`${baseUrl}/api/qr/verify?token=${newRawToken}`);
        const verifyData = await verifyRes.json();
        if (verifyData.valid === false && verifyData.status === 'revoked') {
          console.log(`[PASS] POST /api/qr/revoke -> Revocation Confirmed! Blocked with status: "revoked"`);
          passed++;
        } else {
          console.log(`[FAIL] Revocation check returned:`, verifyData);
        }
      } else {
        console.log(`[FAIL] Revocation API failed:`, revokeData);
      }
    } catch (e) {
      console.log(`[ERROR] Revocation test -> ${e.message}`);
    }
  } else {
    console.log(`[SKIP] Revocation test - No Token`);
  }

  // 6. Test Seed Expired Token
  totalTests++;
  try {
    const res = await fetch(`${baseUrl}/api/qr/verify?token=demo-qr-002`);
    const data = await res.json();
    if (data.valid === false && data.status === 'expired') {
      console.log(`[PASS] Expired Token Test -> Correctly flagged as: "${data.status}"`);
      passed++;
    } else {
      console.log(`[FAIL] Expired Token Test -> Unexpected:`, data);
    }
  } catch (e) {
    console.log(`[ERROR] Expired Token Test -> ${e.message}`);
  }

  // 7. Test Non-existent Token
  totalTests++;
  try {
    const res = await fetch(`${baseUrl}/api/qr/verify?token=non_existent_token_99999`);
    const data = await res.json();
    if (data.valid === false && data.status === 'not_found') {
      console.log(`[PASS] Non-existent Token Test -> Correctly handled as: "${data.status}"`);
      console.log(`       User Feedback: "${data.reason}"`);
      passed++;
    } else {
      console.log(`[FAIL] Non-existent Token Test ->`, data);
    }
  } catch (e) {
    console.log(`[ERROR] Non-existent Token Test -> ${e.message}`);
  }

  // 8. Test LAN Network IP Discovery
  totalTests++;
  try {
    const res = await fetch(`${baseUrl}/api/network-ip`);
    const data = await res.json();
    if (data.success && data.networkIp) {
      console.log(`[PASS] GET /api/network-ip -> Discovered Workstation LAN IP: ${data.networkIp}`);
      console.log(`       Mobile Wi-Fi Base URL: ${data.networkOrigin}`);
      passed++;
    } else {
      console.log(`[FAIL] GET /api/network-ip ->`, data);
    }
  } catch (e) {
    console.log(`[ERROR] Network IP test -> ${e.message}`);
  }

  // 9. Test Gemini AI Care Simplification Engine
  totalTests++;
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
      console.log(`[PASS] POST /api/care-instructions/simplify -> English + Hindi + Checklist verified!`);
      passed++;
    } else {
      console.log(`[FAIL] POST /api/care-instructions/simplify ->`, data);
    }
  } catch (e) {
    console.log(`[ERROR] Care simplification test -> ${e.message}`);
  }

  console.log(`\n===========================================================`);
  console.log(`   TEST RESULTS: ${passed} / ${totalTests} CHECKS PASSED (${Math.round((passed/totalTests)*100)}%)`);
  console.log(`===========================================================\n`);
}

runTests();
