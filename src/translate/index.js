'use strict';

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	// Edit the translator URL below
	const TRANSLATOR_API = 'http://translator:5000/';
	try {
		// Create an AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

		const response = await fetch(`${TRANSLATOR_API}/?content=${postData.content}`, {
			signal: controller.signal,
		});
		clearTimeout(timeoutId); // Clear timeout if request succeeds

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		console.log(data);
		return [data.is_english, data.translated_content];
	} catch (error) {
		console.error('Translation API error:', error);
		// Return default values in case of error
		// Assuming the content is in English by default and no translation needed
		return [true, postData.content];
	}
};
