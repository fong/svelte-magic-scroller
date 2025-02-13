<script>
    import { onMount } from 'svelte';

    let {
        component,
        width = $bindable(0),
        height = $bindable(0),
        thumbHeight = $bindable(0),
        thumbPosition = $bindable(0),
        isDragging = $bindable(false),
        minThumbTravel = $bindable(0),
        maxThumbTravel = $bindable(0),
        startY = $bindable(0),
        currentY = $bindable(0),
        currentIndex = $bindable(0),
        size
    } = $props();

    let node = $state(null);

    const init = () => {
        thumbPosition = Math.max(minThumbTravel, Math.min(maxThumbTravel - height, thumbPosition));
        thumbHeight = height;
    };

    const onTrackDragStart = (e) => {
        isDragging = true;
        startY = e.clientY;
        currentY = thumbPosition;
    };

    const updateCurrentIndex = () => {
        // Calculate percentage of thumb travel (0-1)
        const percentComplete =
            (thumbPosition - minThumbTravel) / (maxThumbTravel - height - minThumbTravel);

        // Map to index range and round
        currentIndex = Math.round(percentComplete * (size - 1));
    };

    const onTrackDragMove = (e) => {
        if (!isDragging) return;

        const delta = e.clientY - startY;
        thumbPosition = Math.max(
            minThumbTravel,
            Math.min(currentY + delta, maxThumbTravel - height)
        );
        updateCurrentIndex();
    };

    const onTrackDragEnd = () => {
        isDragging = false;
    };

    const onTouchStart = (e) => {
        isDragging = true;
        startY = e.touches[0].clientY;
        currentY = thumbPosition;
    };

    const onTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const delta = e.touches[0].clientY - startY;
        thumbPosition = Math.max(
            minThumbTravel,
            Math.min(currentY + delta, maxThumbTravel - height)
        );
        updateCurrentIndex();
    };

    const onTouchEnd = () => {
        isDragging = false;
    };

    $effect(() => {
        init();
    });
</script>

<svelte:window
    onmousemove={onTrackDragMove}
    onmouseup={onTrackDragEnd}
    ontouchmove={onTouchMove}
    ontouchend={onTouchEnd}
/>

<div
    bind:this={node}
    bind:offsetWidth={width}
    bind:offsetHeight={height}
    onmousedown={onTrackDragStart}
    ontouchstart={onTouchStart}
    role="scrollbar"
    aria-controls="magic-scroll-controls"
    aria-valuemin={minThumbTravel}
    aria-valuemax={maxThumbTravel}
    aria-valuenow={thumbPosition}
    tabindex="0"
    style={`position: absolute; left: 3px; right: 0px; transform: translateY(${thumbPosition}px)`}
>
    {@render component()}
</div>
