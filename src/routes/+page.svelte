<script>
    import MagicScroller from '$lib/MagicScroller.svelte';
    import Item from './Item.svelte';

    const length = 30000000000;
    let height = $state(56);
    let index = $state(0);
    let ref = $state();
    let nextIndex = $state(Math.floor(Math.random() * length));
</script>

{#snippet header()}
    <h1>Header</h1>
{/snippet}

{#snippet footer()}
    <h1>Footer</h1>
{/snippet}

{#snippet item(i, loadDirection)}
    <svelte:component this={Item} index={i} {loadDirection}></svelte:component>
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

<div class="wrapper">
    <MagicScroller
        bind:this={ref}
        width="50%"
        height="50svh"
        style={`margin-top: 25svh;`}
        bind:index
        {length}
        {header}
        {footer}
        {item}
    ></MagicScroller>
</div>

<style>
    .wrapper {
        position: absolute;
        width: 100svw;
        height: 100svh;
        overflow: hidden;
        top: 0;
        left: 0;
    }
</style>
