// test/automation/tests/basic-forum-test.js
const { openBrowser, goto, closeBrowser } = require('taiko');

(async () => {
	try {
		console.log('Starting simple test...');

		// Open browser
		await openBrowser();
		console.log('✓ Browser opened');

		// Go to the forum homepage
		await goto('http://localhost:4567');
		console.log('✓ Navigated to forum homepage');

		// Wait for a moment
		await new Promise(resolve => setTimeout(resolve, 2000));
		console.log('✓ Waited for page to load');

		console.log('test completed successfully!');
	} catch (error) {
		console.error('Test failed:', error);
	} finally {
		await closeBrowser();
	}
})();
