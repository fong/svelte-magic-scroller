<script>
  import { onMount } from 'svelte';

  let {
    component,
    currentIndex = $bindable(0),
    currentY = $bindable(0),
    height = $bindable(0),
    isDragging = $bindable(false),
    maxThumbTravel = $bindable(0),
    minThumbTravel = $bindable(0),
    startY = $bindable(0),
    thumbHeight = $bindable(0),
    thumbPosition = $bindable(0),
    width = $bindable(0),
    goto,
    size
  } = $props();

  let node = $state(null);
  let scrollIndex = $state(0);

  const init = () => {
    thumbPosition = Math.max(minThumbTravel, Math.min(maxThumbTravel - height, thumbPosition));
    thumbHeight = height;
    scrollIndex = currentIndex;
  };

  const onTrackDragStart = (e) => {
    isDragging = true;
    startY = e.clientY;
    currentY = thumbPosition;
  };

  const updateCurrentIndex = () => {
    // Guard against size zero or invalid
    if (!size || size <= 1) {
      scrollIndex = 0;
      goto(0);
      return;
    }

    // Calculate percentage of thumb travel (0-1)
    const percentComplete =
      (thumbPosition - minThumbTravel) / (maxThumbTravel - height - minThumbTravel);

    // Map to index range and round
    scrollIndex = Math.round(percentComplete * (size - 1));
    goto(scrollIndex);
  };

  const updateScrollPosition = () => {
    if (!size || size <= 1) {
      thumbPosition = minThumbTravel;
      scrollIndex = 0;
      return;
    }
    scrollIndex = currentIndex;
    const percentComplete = currentIndex / (size - 1);
    thumbPosition = Math.max(
      minThumbTravel,
      Math.min(maxThumbTravel - height, percentComplete * (maxThumbTravel - height))
    );
  };

  const onTrackDragMove = (e) => {
    if (!isDragging) return;

    const delta = e.clientY - startY;
    thumbPosition = Math.max(minThumbTravel, Math.min(currentY + delta, maxThumbTravel - height));
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

    const delta = e.touches[0].clientY - startY;
    thumbPosition = Math.max(minThumbTravel, Math.min(currentY + delta, maxThumbTravel - height));
    updateCurrentIndex();
  };

  const onTouchEnd = () => {
    isDragging = false;
  };

  $effect(() => {
    init();
  });

  $effect(() => {
    updateScrollPosition();
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
