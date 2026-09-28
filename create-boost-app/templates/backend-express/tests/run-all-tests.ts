process.env.NODE_ENV = 'test';
process.env.MOCK_MODE = 'true';

import { runUtilsTests } from './utils.test';
import { runMiddlewareTests } from './middleware.test';
import { runApiTests } from './api.test';

async function main() {

  console.log('\n======================================================');
  console.log('⚡ BOOST ENGINE EXPRESS API — COMPLETE TEST SUITE');
  console.log('======================================================');

  const startTime = Date.now();
  let failed = false;

  try {
    await runUtilsTests();
    await runMiddlewareTests();
    await runApiTests();
  } catch (error: any) {
    failed = true;
    console.error('\n\x1b[31m❌ TEST SUITE FAILED:\x1b[0m', error);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n======================================================');
  if (failed) {
    console.log(`\x1b[31m❌ Tests completed with failures in ${duration}s.\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m✔ ALL BACKEND TESTS PASSED SUCCESSFULLY in ${duration}s!\x1b[0m`);
    console.log('======================================================\n');
    process.exit(0);
  }
}

main();
