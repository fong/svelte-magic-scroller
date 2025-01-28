<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let { index, length, loaded = $bindable(false) } = $props();

    onMount(() => {
        const img = new Image();
        img.src = `https://picsum.photos/seed/${index}/600/600`;
        img.onload = () => {
            loaded = true;
        };
    });
</script>

<div
    class="item"
    style={`padding: ${index === 0 ? `16px 16px 8px` : index === length - 1 ? `8px 16px 16px` : `8px 16px;`}`}
>
    <div class="card">
        <div class="image-container">
            {#if loaded}
                <img
                    class="card-image"
                    src={`https://picsum.photos/seed/${index}/600/600`}
                    alt={`Image ${index}`}
                    onload={() => (loaded = true)}
                    transition:fade={{ duration: 150 }}
                />
            {:else}
                <div class="placeholder" alt={`Placeholder for Image ${index}`}></div>
            {/if}
        </div>

        <div class="text-container">
            <h4>
                Index #{index}
            </h4>
        </div>
    </div>
</div>

<style>
    .card-image {
        aspect-ratio: 1 / 1;
        left: 0;
        position: absolute;
        top: 0;
        width: 400px;
    }

    .item {
        height: fit-content;
        overflow: hidden;
        position: relative;
        transition: all 0.2s ease-in-out;
        width: auto;
    }

    .card {
        background: white;
        border-radius: 8px;
        box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.3);
        height: 460px;
        overflow: hidden;
        padding: 8px;
        position: relative;
        display: flex;
    }

    .placeholder {
        animation: shimmer 1s infinite linear;
        aspect-ratio: 1 / 1;
        background-position-x: 100%;
        background-size: 300%;
        background: linear-gradient(-45deg, #eee 40%, #fafafa 50%, #eee 60%);
        left: 0;
        position: absolute;
        top: 0;
        width: 400px;
    }

    .text-container {
        align-items: center;
        bottom: 0;
        display: flex;
        flex-direction: column;
        height: 80px;
        width: 100%;
        justify-content: center;
        left: 0;
        position: absolute;
    }

    @keyframes shimmer {
        to {
            background-position-x: 0%;
        }
    }
</style>
