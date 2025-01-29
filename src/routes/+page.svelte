<script>
    import MagicScroller from '$lib/MagicScroller.svelte';
    import Item from './Item.svelte';

    const length = 30000000000;
    let height = $state(56);
    let index = $state(0);
    let ref = $state();
    let nextIndex = $state(Math.floor(Math.random() * length));
</script>

{#snippet item(i, loadDirection)}
    <svelte:component this={Item} index={i} {length}></svelte:component>
{/snippet}

<svelte:window bind:innerHeight={height} />

<div style={`position: absolute; z-index: 100; display: flex; flex-direction: column;`}>
    <button
        onclick={() => {
            ref?.goto(0, { offset: { x: 0, y: 32 } });
        }}
        >Start 0
    </button>
    <button
        onclick={() => {
            ref?.goto(nextIndex, { offset: { x: 0, y: 32 } });
            nextIndex = Math.floor(Math.random() * length);
        }}
        >Random Index
    </button>
    <button
        onclick={() => {
            ref?.goto(length - 1, { offset: { x: 0, y: 32 } });
        }}
        >End {length.toString()}
    </button>
</div>

<div class="demo-root">
    <MagicScroller
        bind:this={ref}
        width="100%"
        height="100%"
        bind:index
        {length}
        {item}
        itemStyle={`display: flex; justify-content: center;`}
    ></MagicScroller>
</div>

<style>
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
</style>
