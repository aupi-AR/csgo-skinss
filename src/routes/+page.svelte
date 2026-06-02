<script>
	let { data } = $props();

	const rarityColors = {
		'Consumer Grade': '#b0c3d9',
		'Industrial Grade': '#5e98d9',
		'Mil-Spec Grade': '#4b69ff',
		Restricted: '#8847ff',
		Classified: '#d32ce6',
		Covert: '#eb4b4b',
		'Contraband': '#e4ae39',
	};

	function rarityColor(rarity) {
		return rarityColors[rarity?.name] ?? '#aaa';
	}

	function buildUrl(params) {
		const p = new URLSearchParams();
		if (params.page && params.page > 1) p.set('page', params.page);
		if (params.weapon) p.set('weapon', params.weapon);
		if (params.collection) p.set('collection', params.collection);
		const s = p.toString();
		return s ? `/?${s}` : '/';
	}
</script>

<svelte:head>
	<title>CS:GO Skins — Listado</title>
</svelte:head>

<main>
	<header class="page-header">
		<h1>Skins</h1>
		<span class="count">{data.total} resultados</span>
	</header>

	<!-- Filtros -->
	<div class="filters">
		<div class="filter-group">
			<label for="weapon">Arma (1:N)</label>
			<select
				id="weapon"
				onchange={(e) => {
					window.location.href = buildUrl({
						weapon: e.target.value,
						collection: data.collectionFilter
					});
				}}
			>
				<option value="">Todas las armas</option>
				{#each data.weapons as weapon}
					<option value={weapon} selected={weapon === data.weaponFilter}>{weapon}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="collection">Colección (M:N)</label>
			<select
				id="collection"
				onchange={(e) => {
					window.location.href = buildUrl({
						weapon: data.weaponFilter,
						collection: e.target.value
					});
				}}
			>
				<option value="">Todas las colecciones</option>
				{#each data.collections as col}
					<option value={col} selected={col === data.collectionFilter}>{col}</option>
				{/each}
			</select>
		</div>

		{#if data.weaponFilter || data.collectionFilter}
			<a href="/" class="clear-btn">✕ Limpiar filtros</a>
		{/if}
	</div>

	<!-- Grid de skins -->
	<div class="grid">
		{#each data.skins as skin}
			<a href="/skin/{skin.id}" class="card" style="--rarity: {rarityColor(skin.rarity)}">
				<div class="card-img">
					<img src={skin.image} alt={skin.name} loading="lazy" />
				</div>
				<div class="card-body">
					<p class="weapon-name">{skin.weapon?.name ?? '—'}</p>
					<h2 class="skin-name">{skin.pattern?.name ?? skin.name}</h2>
					{#if skin.rarity}
						<span class="rarity" style="color: {rarityColor(skin.rarity)}">{skin.rarity.name}</span>
					{/if}
					{#if skin.minPrice != null}
						<span class="price">desde ${skin.minPrice.toFixed(2)}</span>
					{/if}
				</div>
			</a>
		{/each}
	</div>

	{#if data.skins.length === 0}
		<p class="empty">No se encontraron skins con esos filtros.</p>
	{/if}

	<!-- Paginación -->
	{#if data.totalPages > 1}
		<div class="pagination">
			{#if data.page > 1}
				<a href={buildUrl({ page: data.page - 1, weapon: data.weaponFilter, collection: data.collectionFilter })} class="page-btn">← Anterior</a>
			{/if}

			<span class="page-info">Página {data.page} de {data.totalPages}</span>

			{#if data.page < data.totalPages}
				<a href={buildUrl({ page: data.page + 1, weapon: data.weaponFilter, collection: data.collectionFilter })} class="page-btn">Siguiente →</a>
			{/if}
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #f0b232;
	}

	.count {
		color: #64748b;
		font-size: 0.9rem;
	}

	.filters {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
		flex-wrap: wrap;
		margin-bottom: 2rem;
		background: #1a1d26;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		border: 1px solid #2d3148;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #94a3b8;
	}

	select {
		background: #0f1117;
		color: #e2e8f0;
		border: 1px solid #2d3148;
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		cursor: pointer;
		min-width: 200px;
	}

	select:focus {
		outline: none;
		border-color: #f0b232;
	}

	.clear-btn {
		background: #2d1a1a;
		color: #eb4b4b;
		border: 1px solid #eb4b4b44;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		font-size: 0.85rem;
		cursor: pointer;
		align-self: flex-end;
		transition: background 0.2s;
	}

	.clear-btn:hover {
		background: #3d2020;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.card {
		background: #1a1d26;
		border: 1px solid #2d3148;
		border-radius: 10px;
		overflow: hidden;
		transition: transform 0.15s, border-color 0.15s;
		border-top: 3px solid var(--rarity, #4b69ff);
		display: block;
	}

	.card:hover {
		transform: translateY(-4px);
		border-color: var(--rarity, #4b69ff);
	}

	.card-img {
		background: #12151e;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		height: 150px;
	}

	.card-img img {
		max-height: 120px;
		max-width: 100%;
		object-fit: contain;
		filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
	}

	.card-body {
		padding: 0.75rem 1rem;
	}

	.weapon-name {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: #64748b;
		margin-bottom: 0.2rem;
	}

	.skin-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: #e2e8f0;
		margin-bottom: 0.4rem;
		line-height: 1.3;
	}

	.rarity {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.price {
		display: block;
		margin-top: 0.4rem;
		font-size: 0.82rem;
		font-weight: 700;
		color: #4ade80;
	}

	.empty {
		text-align: center;
		color: #64748b;
		padding: 4rem;
		font-size: 1.1rem;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		margin-top: 3rem;
		padding: 1.5rem;
	}

	.page-btn {
		background: #1a1d26;
		color: #f0b232;
		border: 1px solid #f0b232;
		border-radius: 8px;
		padding: 0.6rem 1.5rem;
		font-weight: 600;
		transition: background 0.15s;
	}

	.page-btn:hover {
		background: #f0b23222;
	}

	.page-info {
		color: #94a3b8;
		font-size: 0.9rem;
	}
</style>
