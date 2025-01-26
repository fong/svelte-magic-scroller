<script>
    let { index, loaded = $bindable(false) } = $props();
</script>

<div class="item">
    <div class="content">
        <div class="card-content">
            {#if !loaded}
                <div class="placeholder"></div>
            {/if}
            <img
                class="image"
                src={`https://picsum.photos/seed/${index}/600/600`}
                onload={() => (loaded = true)}
            />

            <div
                style={`display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;`}
            >
                <h4>
                    #{index}
                </h4>
            </div>
        </div>
    </div>
</div>

<style>
    .image {
        aspect-ratio: 1 / 1;
        width: 100%;
    }

    .item {
        height: fit-content;
        overflow: hidden;
        padding: 8px 16px;
        position: relative;
        transition: all 0.2s ease-in-out;
        width: auto;
    }

    .card-content {
        left: 0;
        position: absolute;
        top: 0;
    }

    .content {
        background: white;
        border-radius: 8px;
        box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.3);
        height: 55vw;
        overflow: hidden;
        padding: 8px;
        position: relative;
    }

    .placeholder {
        aspect-ratio: 1 / 1;
        width: 100%;
        background: linear-gradient(-45deg, #eee 40%, #fafafa 50%, #eee 60%);
        background-size: 300%;
        background-position-x: 100%;
        animation: shimmer 1s infinite linear;
    }

    @keyframes shimmer {
        to {
            background-position-x: 0%;
        }
    }
</style>
