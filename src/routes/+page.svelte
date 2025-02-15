<script>
    import MagicScrollbar from '$lib/MagicScrollbar/MagicScrollbar.svelte';
    import MagicScroller from '$lib/MagicScroller.svelte';
    import Item from '../components/Item.svelte';
    import Sidepanel from '../components/Sidepanel.svelte';

    const INITIAL_LENGTH = 5000000000000;
    let length = $state(INITIAL_LENGTH);
    let height = $state(56);
    let index = $state(0);
    let offset = $state({ x: 0, y: 0 });
    let ref = $state();
    let nextIndex = $state(0);

    let isSidepanelOpen = $state(false);
    let innerWidth = $state(0);
    const MOBILE_BREAKPOINT = 1280;

    const toggleSidepanel = () => {
        isSidepanelOpen = !isSidepanelOpen;
    };
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth />

<!-- Menu Button - only show on mobile -->
{#if innerWidth <= MOBILE_BREAKPOINT && !isSidepanelOpen}
    <button class="menu-button" onclick={toggleSidepanel}>
        {isSidepanelOpen ? '✕' : '☰'}
    </button>
{/if}

{#snippet item(i)}
    <Item index={i} {length} parent={ref} />
{/snippet}

{#snippet track(children)}
    <div class="track">
        {@render children()}
    </div>
{/snippet}

{#snippet thumb()}
    <div class="thumb"></div>
{/snippet}

<Sidepanel bind:isSidepanelOpen bind:length {index} {offset} {nextIndex} {ref} />
<div class="demo-root">
    <MagicScroller
        bind:this={ref}
        width="100%"
        height="100%"
        bind:index
        bind:offset
        {length}
        {item}
        itemStyle={`display: flex; justify-content: center;`}
    ></MagicScroller>
    <MagicScrollbar {track} {thumb} bind:index goto={ref?.goto} size={length}></MagicScrollbar>
</div>

<style>
    * {
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            'Open Sans',
            'Helvetica Neue',
            sans-serif;
    }

    .demo-root {
        position: absolute;
        width: 100svw;
        height: 100svh;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: whitesmoke;
        top: 0;
        left: 0;
    }

    .track {
        height: 100%;
        width: 15px;
        background: none;
        user-select: none;

        @media (min-width: 576px) {
            background: #ccc;
        }
    }

    .thumb {
        height: 36px;
        width: 10px;
        background: #555;
        user-select: none;
        border-radius: 6px;
    }

    .menu-button {
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 101;
        padding: 0.5rem;
        font-size: 1.5rem;
        background: white;
        border: none;
        border-radius: 100%;
        height: 2.5rem;
        width: 2.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>
