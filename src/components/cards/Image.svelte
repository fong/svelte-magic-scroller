<script>
  import { onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  let { index, loaded = $bindable(false) } = $props();

  const src = `https://picsum.photos/seed/${index}/600/600`;
  let img = $state();
  let delayedLoad = $state();

  onMount(() => {
    // delay image loading so that network requests are throttled
    // only load if item is in buffer for enough time
    delayedLoad = setTimeout(() => {
      img = new Image();
      img.src = src;
      img.onload = () => {
        loaded = true;
      };
    }, 150);
  });

  onDestroy(() => {
    clearTimeout(delayedLoad);
    loaded = false;
    if (img?.src) {
      img.src = ''; // cancel network request for image
    }
  });
</script>

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
      <div class="placeholder" alt={`Placeholder for Image ${index}`}>
        <div></div>
      </div>
    {/if}
  </div>

  <div class="text-container">
    <h4>
      Index #{index.toLocaleString()}
    </h4>
  </div>
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    border: 4px solid #222;
    box-shadow: 8px 8px 0px #222;
    aspect-ratio: 6/7;
    overflow: hidden;
    padding: 8px;
    position: relative;
    display: flex;
    width: 100%;
    max-width: 420px;
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

  .placeholder {
    aspect-ratio: 1 / 1;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;

    /* animation */
    animation: shimmer 1s infinite linear;
    background: linear-gradient(-45deg, #eee 40%, #fafafa 50%, #eee 60%);
    background-size: 300%;
    background-position-x: 100%;
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
