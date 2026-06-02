import { error } from '@sveltejs/kit';
import { getPriceMap, skinPrices } from '$lib/prices.js';

const API_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

export async function load({ params }) {
	const [res, priceMap] = await Promise.all([fetch(API_URL), getPriceMap()]);
	/** @type {any[]} */
	const all = await res.json();

	const skin = all.find((s) => s.id === params.id);

	if (!skin) {
		error(404, 'Skin no encontrada');
	}

	// Skins del mismo arma (relación 1:N)
	const samWeaponSkins = all
		.filter((s) => s.weapon?.name === skin.weapon?.name && s.id !== skin.id && s.image)
		.slice(0, 6);

	const { min: minPrice, byWear: pricesByWear } = skinPrices(skin.name, skin.wears, priceMap);

	return { skin, samWeaponSkins, minPrice, pricesByWear };
}
