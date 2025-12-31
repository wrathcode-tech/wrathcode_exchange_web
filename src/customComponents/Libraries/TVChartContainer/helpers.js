

import AuthService from "../../../api/services/AuthService";

export async function makeApiRequest(fromSym, toSym, to,url) {
	if (fromSym == "undefined") {
		return
	}
	try {
		const response = await AuthService?.cryptoCompareApi(fromSym, toSym, to,url);
		return response;
	} catch (error) {
		throw new Error(error.status);
	}
}
export async function makeApiRequest2(fromSymbol, toSymbol, from, to,chartResolution) {
	if (fromSymbol == "undefined") {
		return
	}
	try {
		const response = await AuthService?.getHistoricalData(fromSymbol, toSymbol, from, to,chartResolution);
		return response;
	} catch (error) {
		throw new Error(error.status);
	}
}

export function generateSymbol(exchange, fromSymbol, toSymbol) {
	const short = `${fromSymbol}/${toSymbol}`;
	return {
		short,
		full: `${exchange}:${short}`,
	};
}

export function parseFullSymbol(fullSymbol) {
	const match = fullSymbol?.split('/');
	if (!match) {
		return null;
	}
	return {
		fromSymbol: match[0],
		toSymbol: match[1],
	};
}


