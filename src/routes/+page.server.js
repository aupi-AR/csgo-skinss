import { getPriceMap, skinPrices } from '$lib/prices.js';

const API_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';
const PAGE_SIZE = 24;

export async function load({ url }) {
	const page = Number(url.searchParams.get('page') ?? 1);
	const weaponFilter = url.searchParams.get('weapon') ?? '';
	const collectionFilter = url.searchParams.get('collection') ?? '';

	const [res, priceMap] = await Promise.all([fetch(API_URL), getPriceMap()]);
	/** @type {any[]} */
	const all = await res.json();

	// Filtrar skins sin imagen
	let skins = all.filter((s) => s.image);

	const isGlove = (/** @type {any} */ s) =>
		s.category?.name === 'Gloves' ||
		s.weapon?.name?.match(/Gloves?|Wraps?/);

	// Filtro por arma (relación 1:N — un arma tiene muchas skins)
	if (weaponFilter === 'Gloves') {
		skins = skins.filter(isGlove);
	} else if (weaponFilter) {
		skins = skins.filter((s) => s.weapon?.name === weaponFilter);
	}

	// Filtro por colección (relación M:N — una skin puede estar en varias colecciones)
	if (collectionFilter) {
		skins = skins.filter((s) =>
			s.collections?.some((/** @type {any} */ c) => c.name === collectionFilter)
		);
	}

	// Listas únicas para filtros — todos los guantes se agrupan bajo "Guantes"
	const allWeaponNames = [...new Set(all.filter((s) => s.image).map((s) => s.weapon?.name).filter(Boolean))];
	const regularWeapons = allWeaponNames.filter((w) => !isGlove({ weapon: { name: w } })).sort();
	const hasGloves = all.some((s) => s.image && isGlove(s));
	const weapons = hasGloves ? [...regularWeapons, 'Gloves'].sort() : regularWeapons;
	const collections = [
		...new Set(all.flatMap((s) => s.collections?.map((/** @type {any} */ c) => c.name) ?? []))
	].sort();

	// Paginación
	const total = skins.length;
	const totalPages = Math.ceil(total / PAGE_SIZE);
	const currentPage = Math.max(1, Math.min(page, totalPages));
	const paginated = skins.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	// Agregar precio mínimo a cada skin
	const paginatedWithPrices = paginated.map((s) => ({
		...s,
		minPrice: skinPrices(s.name, s.wears, priceMap).min
	}));

	return {
		skins: paginatedWithPrices,
		page: currentPage,
		totalPages,
		total,
		weapons,
		collections,
		weaponFilter,
		collectionFilter
	};
}
