<script>
    import MagicScroller from '$lib/MagicScroller.svelte';
    import Item from './Item.svelte';

    let height = $state(56);
    let index = $state(0);
    let ref = $state();
</script>

{#snippet header()}
    <h1>Header</h1>
{/snippet}

{#snippet footer()}
    <h1>Footer</h1>
{/snippet}

{#snippet placeholder()}
    <div class="placeholder"></div>
{/snippet}

{#snippet item(i)}
    <svelte:component this={Item} data={i}></svelte:component>
{/snippet}

<svelte:window bind:innerHeight={height} />

<button
    style={`position: absolute; z-index: 100`}
    onclick={() => {
        // index = Math.floor(Math.random() * 1000);
        ref?.goto(Math.floor(Math.random() * 1000));
    }}>Random Index {index}</button
>

<div class="wrapper">
    <MagicScroller
        bind:this={ref}
        width="50%"
        height="50svh"
        style={`margin-top: 25svh;`}
        bind:index
        data={Array(1000)
            .fill()
            .map((_, i) => ({
                id: i
            }))}
        {header}
        {footer}
        {item}
        {placeholder}
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

    .placeholder {
        height: 12px;
        width: 36px;
        background-color: gray;
    }
</style>
