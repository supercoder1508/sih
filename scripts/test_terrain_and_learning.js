const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('TEST SUITE: VEDAS AI TERRAIN AUTO-DETECTION & CONTINUOUS LEARNING');
console.log('====================================================\n');

// 1. Verify data/model_health.json
console.log('--- TEST 1: Verifying data/model_health.json schema ---');
const healthPath = path.join(__dirname, '..', 'data', 'model_health.json');
const healthData = JSON.parse(fs.readFileSync(healthPath, 'utf8'));

console.log('Model Version:', healthData.version || healthData.current_version);
console.log('C-Index:', healthData.c_index);
console.log('ECE:', healthData.ece);
console.log('AUC:', healthData.auc);
console.log('Dataset Size:', healthData.dataset_size);
console.log('Scheduler Status:', healthData.scheduler?.status, '| Daily:', healthData.scheduler?.daily_drift_check);

if (!healthData.c_index || healthData.c_index < 0.88) {
  throw new Error(`C-Index failed validation gate: ${healthData.c_index}`);
}
if (!healthData.ece || healthData.ece > 0.10) {
  throw new Error(`ECE failed validation gate: ${healthData.ece}`);
}
if (!healthData.auc || healthData.auc < 0.85) {
  throw new Error(`AUC failed validation gate: ${healthData.auc}`);
}
if (!healthData.dataset_size || healthData.dataset_size < 13500) {
  throw new Error(`Dataset size mismatch: expected >= 13500, got ${healthData.dataset_size}`);
}
console.log('>>> TEST 1 PASSED: Model Health schema and validation gates valid.\n');

// 2. Extract and test Client-side VEDAS engine from dashboard.html
console.log('--- TEST 2: Testing detectClientSideVedasTerrain logic from dashboard.html ---');
const dashboardHtml = fs.readFileSync(path.join(__dirname, '..', 'dashboard.html'), 'utf8');

// Check that client-side VEDAS functions exist in dashboard.html
if (!dashboardHtml.includes('function detectClientSideVedasTerrain')) {
  throw new Error('detectClientSideVedasTerrain not found in dashboard.html');
}
if (!dashboardHtml.includes('const VEDAS_SCHEDULE_V_DISTRICTS')) {
  throw new Error('VEDAS_SCHEDULE_V_DISTRICTS not found in dashboard.html');
}
if (!dashboardHtml.includes('const VEDAS_HILLY_DISTRICTS')) {
  throw new Error('VEDAS_HILLY_DISTRICTS not found in dashboard.html');
}

// Evaluate the VEDAS extraction in isolated VM
const vm = require('vm');
const sandbox = { window: {}, Math: Math, Set: Set, Array: Array, Number: Number, parseFloat: parseFloat, String: String, isNaN: isNaN, console: console };
vm.createContext(sandbox);

// Extract the VEDAS block from dashboard.html
const startMarker = 'const VEDAS_SCHEDULE_V_DISTRICTS';
const endMarker = 'window.detectClientSideVedasTerrain = detectClientSideVedasTerrain;';
const startIndex = dashboardHtml.indexOf(startMarker);
const endIndex = dashboardHtml.indexOf(endMarker) + endMarker.length;
const vedasCode = dashboardHtml.substring(startIndex, endIndex);

vm.runInContext(vedasCode, sandbox);
const detectTerrain = sandbox.detectClientSideVedasTerrain;

// Test Cases matching ISRO VEDAS specifications
const testCases = [
  { lat: 23.5461, lon: 74.4439, state: "Rajasthan", district: "Banswara", expected: "Tribal_Schedule_V" },
  { lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh", district: "Shimla", expected: "Hilly" },
  { lat: 32.2190, lon: 76.3234, state: "Himachal Pradesh", district: "Kangra", expected: "Hilly" },
  { lat: 34.0837, lon: 74.7973, state: "Jammu and Kashmir", district: "Srinagar", expected: "Hilly" },
  { lat: 19.0760, lon: 72.8777, state: "Maharashtra", district: "Mumbai", expected: "Urban" },
  { lat: 28.6139, lon: 77.2090, state: "Delhi", district: "Central Delhi", expected: "Urban" },
  { lat: 29.5300, lon: 78.7747, state: "Uttarakhand", district: "Nainital", expected: "Forest_Eco_Sensitive" },
  { lat: 28.8386, lon: 78.7733, state: "Uttar Pradesh", district: "Moradabad", expected: "Rural_Agri" },
  // Test without coordinates (district lookup)
  { lat: null, lon: null, state: "Rajasthan", district: "Banswara", expected: "Tribal_Schedule_V" },
  { lat: null, lon: null, state: "Himachal Pradesh", district: "Shimla", expected: "Hilly" },
  { lat: null, lon: null, state: "Chhattisgarh", district: "Bastar", expected: "Tribal_Schedule_V" },
  { lat: null, lon: null, state: "Uttar Pradesh", district: "Moradabad", expected: "Rural_Agri" }
];

testCases.forEach((tc, idx) => {
  const res = detectTerrain(tc.lat, tc.lon, tc.state, tc.district);
  console.log(`  Case ${idx + 1}: [${tc.lat || 'no-lat'}, ${tc.lon || 'no-lon'}] ${tc.district}, ${tc.state} -> ${res.terrain_type} (${res.terrain_label})`);
  if (res.terrain_type !== tc.expected) {
    throw new Error(`Test Case ${idx + 1} Failed: Expected ${tc.expected}, got ${res.terrain_type}`);
  }
});
console.log('>>> TEST 2 PASSED: Client-side VEDAS engine accurately classified all test cases!\n');

// 3. Verify HTML structure: tab-monitor-btn hidden from top nav bar, methodology has continuous learning
console.log('--- TEST 3: Verifying top navigation tab hidden & methodology telemetry integration ---');
if (!dashboardHtml.includes('id="tab-monitor-btn" style="display:none;"')) {
  throw new Error('tab-monitor-btn must be hidden from top navigation per user request');
}
if (!dashboardHtml.includes('id="inp-terrain-vedas-badge"')) {
  throw new Error('inp-terrain-vedas-badge missing');
}
if (!dashboardHtml.includes('id="inp-terrain-vedas-text"')) {
  throw new Error('inp-terrain-vedas-text missing');
}
const methHtml = fs.readFileSync(path.join(__dirname, '..', 'methodology.html'), 'utf8');
if (!methHtml.includes('Autonomous Continuous Learning') || !methHtml.includes('continuous_learning_channel')) {
  throw new Error('methodology.html must contain Continuous Learning section & reactive synchronization');
}
console.log('>>> TEST 3 PASSED: Continuous Learning tab hidden from navbar and actively synced on methodology page.\n');

console.log('====================================================');
console.log('ALL VEDAS TERRAIN & CONTINUOUS LEARNING TESTS PASSED!');
console.log('====================================================');
