'use strict';

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	// Edit the translator URL below
	const TRANSLATOR_API = 'http://127.0.0.1:4567/';
	const response = await fetch(`${TRANSLATOR_API}/?content=${postData.content}`);
	const data = await response.text();
	// console.log(data);
	return [data.isEnglish, data.translated_content];
};
