<script>
    import MagicScrollbarThumb from './MagicScrollbarThumb.svelte';
    import MagicScrollbarTrack from './MagicScrollbarTrack.svelte';

    let isDragging = $state(false);
    let thumbPosition = $state(0);
    let trackHeight = $state(0);
    let trackWidth = $state(0);
    let thumbHeight = $state(0);
    let minThumbTravel = $state(0);
    let maxThumbTravel = $state(0);
    let startY = $state(0);
    let currentY = $state(0);

    let {
        track,
        thumb,
        size,
        offset = { top: 2, bottom: 2 },
        index = $bindable(0),
        goto
    } = $props();
</script>

<MagicScrollbarTrack
    component={track}
    bind:thumbPosition
    bind:thumbHeight
    bind:minThumbTravel
    bind:maxThumbTravel
    height={trackHeight}
    width={trackWidth}
    {goto}
    {size}
    {offset}
    {currentY}
>
    <MagicScrollbarThumb
        component={thumb}
        bind:currentIndex={index}
        bind:thumbHeight
        {size}
        {minThumbTravel}
        {maxThumbTravel}
        {thumbPosition}
        {isDragging}
        {startY}
        {currentY}
        {goto}
    ></MagicScrollbarThumb>
</MagicScrollbarTrack>
