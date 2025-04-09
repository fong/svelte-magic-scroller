<script>
  let {
    isSidepanelOpen = $bindable(false),
    length = $bindable(0),
    index,
    offset,
    nextIndex,
    ref
  } = $props();
  let sidepanelRef;

  const sections = ['Top', 'Features', 'Install', 'How to Use', 'Scroll bar', 'Quirks'];

  $effect(() => {
    nextIndex = Math.floor(Math.random() * length);
  });

  const handleClickOutside = (e) => {
    if (
      sidepanelRef &&
      !sidepanelRef.contains(e.target) &&
      !e.target.classList.contains('menu-button')
    ) {
      isSidepanelOpen = false;
    }
  };

  const checkCurrentIndex = () => {
    if (index >= length && length > 0) {
      ref?.goto(length - 1, { offset: 56 });
    }
  };
</script>

<svelte:document onmousedown={handleClickOutside} />

<div
  bind:this={sidepanelRef}
  class="sidepanel {isSidepanelOpen ? 'open' : ''}"
  style={`

    `}
>
  <div class="sidepanel-content">
    <div class="info">
      <p>
        Current: {index}
      </p>
      <p>Offset: {offset.toFixed(2)}</p>
      <label for="list-size">Number of Items</label>
      <input
        id="list-size"
        min="0"
        required
        bind:value={length}
        onkeyup={checkCurrentIndex}
        type="number"
      />
    </div>
    {#each sections as section, i}
      <button
        onclick={() => {
          ref?.goto(i, 56);
          isSidepanelOpen = false;
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
        ref?.goto(nextIndex, { offset: 56 });
        nextIndex = Math.floor(Math.random() * length);
        isSidepanelOpen = false;
      }}
      >Go to Random
    </button>
    <button
      onclick={() => {
        ref?.goto(length - 3, { offset: 56 });
        isSidepanelOpen = false;
      }}
      >3rd last Item
    </button>
    <button
      onclick={() => {
        ref?.goto(length - 2, { offset: 56 });
        isSidepanelOpen = false;
      }}
      >2nd last Item
    </button>
    <button
      onclick={() => {
        ref?.goto(length - 1, { offset: 56 });
        isSidepanelOpen = false;
      }}
      >Last Item
    </button>
  </div>
</div>

<style>
  .sidepanel {
    background: white;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    max-height: 100%;
    width: 240px;
    overflow: auto;
    padding: 0;
    position: absolute;
    transition: transform 0.3s ease;
    z-index: 100;
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

  @media (max-width: 1280px) {
    .sidepanel {
      position: fixed;
      top: 0;
      left: 0;
      transform: translateX(-100%);
    }

    .sidepanel.open {
      transform: translateX(0);
    }
  }

  .sidepanel-content {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  .info {
    color: gray;
    display: flex;
    flex-direction: column;
    font-size: 0.8rem;
    gap: 4px;

    padding: 8px;

    p {
      margin: 0;
    }
  }

  label {
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
</style>
