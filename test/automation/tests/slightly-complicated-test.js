'use strict';

const { openBrowser, goto, click, write, checkBox, closeBrowser } = require('taiko');

(async () => {
	try {
		console.log('Starting slightly complicated test...');
		await openBrowser();
		await goto('http://localhost:4567');
		console.log('✓ Browser opened');
		await click('Login');
		await click('Register');
		console.log('✓ Registering');
		await click('Username');
		await write('nya');
		await click('Password');
		await write('rawrrawr');
		await click('Confirm');
		await write('rawrrawr');
		await click('Register Now');
		await click(checkBox('consent'));
		await click(checkBox('digest'));
		await click('submit');
		console.log('✓ Registered');
		await click('General Discussion');
	} catch (error) {
		console.error(error);
	} finally {
		await closeBrowser();
	}
})();
