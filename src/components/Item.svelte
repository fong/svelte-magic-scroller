<script>
    import Title from './cards/Title.svelte';
    import Info from './cards/Info.svelte';
    import Image from './cards/Image.svelte';

    let { index, length } = $props();
</script>

<div
    class="item"
    style={`padding: ${index === 0 ? `16px 16px 8px` : index === length - 1 ? `8px 16px 16px` : `8px 16px;`}`}
>
    {#if index === 0}
        <Title {length} />
    {:else if index > 0 && index < 5}
        <Info {index} />
    {:else}
        <Image {index} />
    {/if}
</div>

<style>
    .item {
        height: fit-content;
        overflow: visible;
        position: relative;
        transition: all 0.2s ease-in-out;
        width: auto;
        justify-content: center;
        display: flex;
        width: 100%;
        max-width: 64rem;
        margin-bottom: 1rem;
    }
</style>
