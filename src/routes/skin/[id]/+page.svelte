<script>
	let { data } = $props();

	let skin = $derived(data.skin);
	let samWeaponSkins = $derived(data.samWeaponSkins);
	let minPrice = $derived(data.minPrice);
	let pricesByWear = $derived(data.pricesByWear);

	const rarityColors = {
		'Consumer Grade': '#b0c3d9',
		'Industrial Grade': '#5e98d9',
		'Mil-Spec Grade': '#4b69ff',
		Restricted: '#8847ff',
		Classified: '#d32ce6',
		Covert: '#eb4b4b',
		Contraband: '#e4ae39',
		Extraordinary: '#e4ae39'
	};

	const GOLD = '#e4ae39';

	let rarityColor = $derived(
		skin.category?.name === 'Knives' || skin.rarity?.name === 'Extraordinary'
			? GOLD
			: (rarityColors[skin.rarity?.name] ?? '#aaa')
	);
</script>

<svelte:head>
	<title>{skin.weapon?.name} | {skin.pattern?.name ?? skin.name} — CS:GO Skins</title>
</svelte:head>

<main>
	<a href="/" class="back">← Volver al listado</a>

	<div class="skin-detail">
		<!-- Imagen -->
		<div class="skin-image" style="--rarity: {rarityColor}">
			<img src={skin.image} alt={skin.name} />
			{#if skin.stattrak}
				<span class="badge stattrak">StatTrak™</span>
			{/if}
			{#if skin.souvenir}
				<span class="badge souvenir">Souvenir</span>
			{/if}
		</div>

		<!-- Info -->
		<div class="skin-info">
			<p class="weapon-label">{skin.weapon?.name ?? '—'}</p>
			<h1>{skin.pattern?.name ?? skin.name}</h1>

			{#if skin.rarity}
				<span class="rarity-badge" style="background: {rarityColor}22; color: {rarityColor}; border-color: {rarityColor}44">
					{skin.rarity.name}
				</span>
			{/if}

			{#if skin.description}
				<p class="description">{skin.description}</p>
			{/if}

			<!-- Detalles técnicos -->
			<div class="details-grid">
				{#if skin.min_float !== null && skin.max_float !== null}
					<div class="detail-item">
						<span class="detail-label">Float</span>
						<span class="detail-value">{skin.min_float} – {skin.max_float}</span>
					</div>
				{/if}
				{#if skin.category}
					<div class="detail-item">
						<span class="detail-label">Categoría</span>
						<span class="detail-value">{skin.category.name}</span>
					</div>
				{/if}
				{#if skin.pattern}
					<div class="detail-item">
						<span class="detail-label">Patrón</span>
						<span class="detail-value">{skin.pattern.name}</span>
					</div>
				{/if}
			</div>

			<!-- Precios por wear -->
			{#if minPrice != null}
				<div class="section">
					<h2>Precio de mercado <span class="tag">Skinport</span></h2>
					<div class="price-table">
						{#each Object.entries(pricesByWear) as [wear, price]}
							<div class="price-row">
								<span class="wear-label">{wear}</span>
								<span class="wear-price">${price.toFixed(2)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Colecciones (relación M:N) -->
			{#if skin.collections?.length}
				<div class="section">
					<h2>Colecciones</h2>
					<div class="collection-list">
						{#each skin.collections as col}
							<div class="collection-chip">
								{#if col.image}
									<img src={col.image} alt={col.name} />
								{/if}
								<span>{col.name}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Crates (relación M:N) -->
			{#if skin.crates?.length}
				<div class="section">
					<h2>Cajas</h2>
					<div class="collection-list">
						{#each skin.crates as crate}
							<div class="collection-chip">
								{#if crate.image}
									<img src={crate.image} alt={crate.name} />
								{/if}
								<span>{crate.name}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Otras skins del mismo arma (relación 1:N) -->
	{#if samWeaponSkins.length}
		<div class="related">
			<h2>Otras skins de <strong>{skin.weapon?.name}</strong></h2>
			<div class="related-grid">
				{#each samWeaponSkins as s}
					<a href="/skin/{s.id}" class="related-card">
						<img src={s.image} alt={s.name} />
						<span>{s.pattern?.name ?? s.name}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.back {
		display: inline-block;
		color: #94a3b8;
		font-size: 0.9rem;
		margin-bottom: 2rem;
		transition: color 0.15s;
	}

	.back:hover {
		color: #f0b232;
	}

	.skin-detail {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 3rem;
		align-items: start;
		margin-bottom: 4rem;
	}

	@media (max-width: 768px) {
		.skin-detail {
			grid-template-columns: 1fr;
		}
	}

	.skin-image {
		background: #1a1d26;
		border-radius: 12px;
		border-top: 4px solid var(--rarity, #4b69ff);
		padding: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 280px;
		position: relative;
	}

	.skin-image img {
		max-width: 100%;
		max-height: 240px;
		object-fit: contain;
		filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6));
	}

	.badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.3rem 0.7rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stattrak {
		background: #e4ae39ee;
		color: #1a1000;
		border: 1px solid #e4ae39;
	}

	.souvenir {
		background: #f0b232ee;
		color: #1a1000;
		border: 1px solid #f0b232;
	}

	.weapon-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #64748b;
		margin-bottom: 0.4rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 800;
		color: #f1f5f9;
		line-height: 1.2;
		margin-bottom: 0.75rem;
	}

	.rarity-badge {
		display: inline-block;
		padding: 0.3rem 0.8rem;
		border-radius: 20px;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border: 1px solid;
		margin-bottom: 1.25rem;
	}

	.description {
		color: #94a3b8;
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
		font-style: italic;
	}

	.details-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.detail-item {
		background: #1a1d26;
		border: 1px solid #2d3148;
		border-radius: 8px;
		padding: 0.6rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 100px;
	}

	.detail-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #64748b;
	}

	.detail-value {
		font-size: 0.95rem;
		font-weight: 600;
		color: #e2e8f0;
	}

	.section {
		margin-bottom: 1.5rem;
	}

	.section h2 {
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tag {
		background: #2d3148;
		color: #7c84b8;
		font-size: 0.65rem;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.collection-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.collection-chip {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: #1a1d26;
		border: 1px solid #2d3148;
		border-radius: 20px;
		padding: 0.3rem 0.75rem 0.3rem 0.5rem;
		font-size: 0.82rem;
		color: #cbd5e1;
	}

	.collection-chip img {
		width: 20px;
		height: 20px;
		object-fit: contain;
	}

	.price-table {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.price-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #12151e;
		border: 1px solid #2d3148;
		border-radius: 6px;
		padding: 0.45rem 0.9rem;
	}

	.wear-label {
		font-size: 0.85rem;
		color: #94a3b8;
	}

	.wear-price {
		font-size: 0.95rem;
		font-weight: 700;
		color: #4ade80;
	}

	/* Related */
	.related h2 {
		font-size: 1.2rem;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.related h2 strong {
		color: #f0b232;
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.75rem;
	}

	.related-card {
		background: #1a1d26;
		border: 1px solid #2d3148;
		border-radius: 8px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		transition: border-color 0.15s, transform 0.15s;
	}

	.related-card:hover {
		border-color: #f0b232;
		transform: translateY(-2px);
	}

	.related-card img {
		width: 100%;
		max-height: 80px;
		object-fit: contain;
	}

	.related-card span {
		font-size: 0.78rem;
		color: #94a3b8;
		text-align: center;
		line-height: 1.3;
	}
</style>
