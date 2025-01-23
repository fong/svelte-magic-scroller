<script>
    let { index, loaded = $bindable(false) } = $props();

    setTimeout(
        () => {
            loaded = true;
        },
        Math.floor(Math.random() * 10000)
    );
</script>

<div class="item">
    {#if loaded}
        <div class="content">
            {index} Hello
            <div>Content</div>
        </div>
    {:else}
        <div class="placeholder">{index} Hello loading</div>
    {/if}
</div>

<style>
    .item {
        height: fit-content;
        padding: 4px 8px;
        width: auto;
        transition: all 0.2s ease-in-out;
    }

    .content {
        height: 256px;
        background: white;
        border: 1px solid gray;
        border-radius: 8px;
        padding: 8px;
    }

    .placeholder {
        height: 100px;
        background: white;
        opacity: 0.5;
        border: 1px solid gray;
        border-radius: 8px;
        padding: 8px;
    }
</style>
