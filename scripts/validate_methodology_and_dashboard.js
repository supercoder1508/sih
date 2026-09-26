const fs = require('fs');

console.log('--- VALIDATING METHODOLOGY.HTML ---');
const methHtml = fs.readFileSync('methodology.html', 'utf8');

const methChecks = [
  { name: 'Contains Back to Home', test: methHtml.includes('Back to Home') },
  { name: 'Contains 0.906', test: methHtml.includes('0.906') },
  { name: 'Contains 13,532 baseline', test: methHtml.includes('13,532') },
  { name: 'Contains active continuous corpus', test: /13,58[6-9]|13,59\d/.test(methHtml) },
  { name: 'Contains RFCTLARR Act 2013', test: methHtml.includes('RFCTLARR Act 2013') },
  { name: 'Contains v2.1.0 active version', test: methHtml.includes('v2.1.0') },
  { name: 'Contains ECE 0.0104 calibration', test: methHtml.includes('0.0104') },
  { name: 'Contains ROC-AUC 0.942 / 0.9418', test: methHtml.includes('0.942') },
  { name: 'Does NOT contain tab-gis-btn', test: !methHtml.includes('id="tab-gis-btn"') },
  { name: 'Contains reactive BroadcastChannel script', test: methHtml.includes('continuous_learning_channel') },
  { name: 'Contains storage event listener', test: methHtml.includes('storage') }
];

let methAllPass = true;
methChecks.forEach(c => {
  if (c.test) {
    console.log('  PASS:', c.name);
  } else {
    console.error('  FAIL:', c.name);
    methAllPass = false;
  }
});

console.log('\n--- VALIDATING DASHBOARD.HTML ---');
const dashHtml = fs.readFileSync('dashboard.html', 'utf8');

const dashChecks = [
  { name: 'Continuous Learning tab is hidden from top nav bar', test: dashHtml.includes('id="tab-monitor-btn" style="display:none;"') },
  { name: 'Contains href="/methodology"', test: dashHtml.includes('href="/methodology"') },
  { name: 'Contains Export Summary button', test: dashHtml.includes('Export Summary') },
  { name: 'Contains Run Live Analysis button', test: dashHtml.includes('Run Live Analysis') },
  { name: 'Contains 0.906 C-index', test: dashHtml.includes('0.906') },
  { name: 'Contains RFCTLARR integration', test: dashHtml.includes('RFCTLARR') },
  { name: 'Contains milestones-breakdown-container', test: dashHtml.includes('milestones-breakdown-container') },
  { name: 'Contains BroadcastChannel on save project', test: dashHtml.includes('continuous_learning_channel') }
];

let dashAllPass = true;
dashChecks.forEach(c => {
  if (c.test) {
    console.log('  PASS:', c.name);
  } else {
    console.error('  FAIL:', c.name);
    dashAllPass = false;
  }
});

if (methAllPass && dashAllPass) {
  console.log('\n>>> ALL METHODOLOGY & DASHBOARD NAVIGATION VALIDATION TESTS PASSED! <<<');
  process.exit(0);
} else {
  console.error('\n>>> SOME TESTS FAILED <<<');
  process.exit(1);
}
