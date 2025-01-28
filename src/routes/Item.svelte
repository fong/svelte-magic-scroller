<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let { index, length, loaded = $bindable(false) } = $props();

    const src = `https://picsum.photos/seed/${index}/600/600`;

    onMount(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loaded = true;
        };
    });
</script>

<div
    class="item"
    style={`padding: ${index === 0 ? `16px 16px 8px` : index === length - 1 ? `8px 16px 16px` : `8px 16px;`}`}
>
    {#if index === 0}
        <div class="title-card">
            <h1>svelte magic scroller</h1>
            <h3>it's just a bunch of illusions</h3>
            <br />
            <h5>Install</h5>
            <p>todo</p>
            <br />
            <h5>Features:</h5>
            <ul>
                <li>
                    No dimension limitations for virtualized lists <sub
                        >(No more 33554400px browser limit)</sub
                    >
                </li>
                <li>Fixed/Dynamic item sizes</li>
                <li>Made for Svelte 5</li>
            </ul>
            <br />
            <h5>Quirks:</h5>
            <ul>
                <li><code>goto</code> function does not support smooth scrolling</li>
                <li>Absolute scrollbar positioning is unavailable</li>
                <li>No support for iOS Safari status bar go to top tap</li>
            </ul>
        </div>
    {:else}
        <div class="card">
            <div class="image-container">
                {#if loaded}
                    <img
                        class="card-image"
                        {src}
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
    {/if}
</div>

<style>
    .title-card {
        align-items: left;
        flex-direction: column;
        display: flex;
        height: 100%;
        justify-content: start;
        width: 100%;
        padding: 8px;

        h1 {
            font-size: 3rem;
            font-weight: 400;
            margin: 0;
        }

        h3 {
            font-size: 1.5rem;
            font-weight: 300;
            margin: 8px 0;
        }

        h5 {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 8px 0;
            line-height: 1.25rem;
            margin-block-start: 0rem;
        }

        ul {
            padding: 0;
            margin: 0;
            margin-left: 16px;
        }

        li {
            margin: 4px 0;
        }

        code {
            background-color: lightgray;
            padding: 2px 4px;
        }

        sub {
            font-size: 0.75rem;
            color: gray;
        }
    }

    .card-image {
        aspect-ratio: 1 / 1;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
    }

    .item {
        height: fit-content;
        overflow: visible;
        position: relative;
        transition: all 0.2s ease-in-out;
        width: auto;
    }

    .card {
        background: white;
        border-radius: 8px;
        border: 2px solid #eee;
        box-shadow: 8px 8px 8px rgba(0, 0, 0, 0.3);
        aspect-ratio: 6/7;
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
        width: 100%;
    }

    .text-container {
        align-items: center;
        bottom: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        justify-content: center;
        left: 0;
        position: absolute;

        h4 {
            font-weight: 400;
        }
    }

    @keyframes shimmer {
        to {
            background-position-x: 0%;
        }
    }
</style>
