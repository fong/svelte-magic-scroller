<script>
    let { data, loaded = $bindable(false) } = $props();

    setTimeout(
        () => {
            loaded = true;
        },
        Math.floor(Math.random() * 10000)
    );
</script>

{#if loaded}
    <div class="item" style={`height: 256px;`}>
        {data?.id} Hello
        <div>Content</div>
    </div>
{:else}
    <div class="placeholder">{data?.id} Hello loading</div>
{/if}

<style>
    .placeholder {
        height: 100px;
    }
</style>
