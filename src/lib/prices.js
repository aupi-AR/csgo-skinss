const SKINPORT_URL = 'https://api.skinport.com/v1/items?app_id=730&currency=USD';
const TTL = 60 * 60 * 1000; // 1 hora

let cache = null;
let cacheTime = 0;

/** @returns {Promise<Record<string, number>>} market_hash_name → min_price */
export async function getPriceMap() {
	const now = Date.now();
	if (cache && now - cacheTime < TTL) return cache;

	try {
		const res = await fetch(SKINPORT_URL);
		if (!res.ok) return cache ?? {};
		/** @type {any[]} */
		const items = await res.json();

		/** @type {Record<string, number>} */
		const map = {};
		for (const item of items) {
			if (item.min_price != null) {
				map[item.market_hash_name] = item.min_price;
			}
		}

		cache = map;
		cacheTime = now;
		return map;
	} catch {
		return cache ?? {};
	}
}

/**
 * Devuelve el precio mínimo de una skin considerando todos sus wears.
 * @param {string} name - nombre base de la skin (ej: "AK-47 | Redline")
 * @param {Array<{name: string}>} wears
 * @param {Record<string, number>} priceMap
 * @returns {{ min: number | null, byWear: Record<string, number> }}
 */
export function skinPrices(name, wears, priceMap) {
	/** @type {Record<string, number>} */
	const byWear = {};
	let min = null;

	if (!wears?.length) {
		// sin variantes de wear (ej: cuchillo vanilla)
		const p = priceMap[name] ?? null;
		if (p != null) min = p;
		return { min, byWear };
	}

	for (const w of wears) {
		const key = `${name} (${w.name})`;
		const p = priceMap[key] ?? null;
		if (p != null) {
			byWear[w.name] = p;
			if (min === null || p < min) min = p;
		}
	}

	return { min, byWear };
}
