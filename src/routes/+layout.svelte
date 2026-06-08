<script>
	let { children } = $props();
</script>

<svelte:head>
	<title>CS:GO Skins</title>
</svelte:head>

<nav>
	<a href="/">
		<img src="/src/img/logocs.svg" alt="CS:GO logo" class="nav-logo" />
		CS:GO Skins
	</a>
</nav>

{@render children()}

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		background-color: #0f1117;
		color: #e2e8f0;
		font-family: 'Segoe UI', system-ui, sans-serif;
		min-height: 100vh;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	nav {
		background: linear-gradient(90deg, #1a1d26 0%, #12151e 100%);
		border-bottom: 1px solid #f0b232;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	nav a {
		font-size: 1.4rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: #f0b232;
		text-transform: uppercase;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.nav-logo {
		height: 2rem;
		width: auto;
	}
</style>
