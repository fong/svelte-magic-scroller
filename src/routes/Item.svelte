<script>
    let { index, loaded = $bindable(false) } = $props();

    setTimeout(
        () => {
            loaded = true;
        },
        Math.floor(Math.random() * 10000)
    );
</script>

{#if loaded}
    <div class="item" style={`height: 256px;`}>
        {index} Hello
        <div>Content</div>
    </div>
{:else}
    <div class="placeholder">{index} Hello loading</div>
{/if}

<style>
    .placeholder {
        height: 100px;
    }
</style>
