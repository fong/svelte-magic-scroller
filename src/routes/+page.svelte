<script>
    import MagicScrollbar from '$lib/MagicScrollbar/MagicScrollbar.svelte';
    import MagicScroller from '$lib/MagicScroller.svelte';
    import { magicscrollbar } from '$lib/magicscrollbar.svelte.js';
    import Item from './Item.svelte';

    const length = 5000000000000;
    let height = $state(56);
    let index = $state(0);
    let offset = $state({ x: 0, y: 0 });
    let ref = $state();
    let nextIndex = $state(Math.floor(Math.random() * length));
    let scrollIndex = $state(0);

    const sections = ['Top', 'Install', 'How to Use', 'Features', 'Quirks'];

    $effect(() => {
        ref?.goto(scrollIndex);
    });
</script>

{#snippet item(i)}
    <Item index={i} {length} parent={ref} />
{/snippet}

{#snippet track(children)}
    <div style={`height: 100%; width: 14px; background: #ccc;`}>
        {@render children()}
    </div>
{/snippet}

{#snippet thumb()}
    <div
        style={'height: 36px; width: 10px; background: #555; user-select: none; border-radius: 6px;'}
    ></div>
{/snippet}

<svelte:window bind:innerHeight={height} />

<div style={`position: absolute; z-index: 100; display: flex; flex-direction: column;`}>
    <div class="info">
        <p>
            Current: {index}
        </p>
        <p>Offset: {offset.y.toFixed(2)}</p>
    </div>
    {#each sections as section, i}
        <button
            onclick={() => {
                ref?.goto(i, { offset: { x: 0, y: 32 } });
            }}
            >#{i} {section}
        </button>
        {#if i === 0}
            <br />
        {/if}
    {/each}
    <br />
    <button
        onclick={() => {
            ref?.goto(nextIndex, { offset: { x: 0, y: 32 } });
            nextIndex = Math.floor(Math.random() * length);
        }}
        >Go to Random
    </button>
    <button
        onclick={() => {
            ref?.goto(length - 3, { offset: { x: 0, y: 32 } });
        }}
        >3rd last Item
    </button>
    <button
        onclick={() => {
            ref?.goto(length - 2, { offset: { x: 0, y: 32 } });
        }}
        >2nd last Item
    </button>
    <button
        onclick={() => {
            ref?.goto(length - 1, { offset: { x: 0, y: 32 } });
        }}
        >Last Item
    </button>
</div>
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
    <MagicScrollbar {track} {thumb} bind:scrollIndex size={length}></MagicScrollbar>
    <div style={`position: absolute; top: 0; left: 0;`}>{scrollIndex}</div>
</div>

<style>
    sub {
        font-size: 0.75rem;
        font-weight: 400;
        color: gray;
    }
    button {
        padding: 8px 16px;
        margin: 8px;
        border: 2px solid #222;
        border-radius: 8px;
        box-shadow: 4px 4px 0px #222;
        background: white;
        color: #222;
        font-size: 1rem;

        cursor: pointer;
    }

    button:hover {
        background: #222;
        color: white;
        transition: all 0.2s ease-in-out;
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

    .info {
        font-size: 0.8rem;
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
        p {
            margin: 0;
        }
    }
</style>
