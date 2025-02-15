<script>
    import MagicScrollbarThumb from './MagicScrollbarThumb.svelte';
    import MagicScrollbarTrack from './MagicScrollbarTrack.svelte';

    let currentY = $state(0);
    let isDragging = $state(false);
    let maxThumbTravel = $state(0);
    let minThumbTravel = $state(0);
    let startY = $state(0);
    let thumbHeight = $state(0);
    let thumbPosition = $state(0);
    let trackHeight = $state(0);
    let trackWidth = $state(0);

    let {
        goto,
        index = $bindable(0),
        offset = { top: 2, bottom: 2 },
        size,
        thumb,
        track
    } = $props();
</script>

<MagicScrollbarTrack
    component={track}
    bind:currentY
    bind:isDragging
    bind:maxThumbTravel
    bind:minThumbTravel
    bind:startY
    bind:thumbHeight
    bind:thumbPosition
    height={trackHeight}
    width={trackWidth}
    {goto}
    {size}
    {offset}
>
    <MagicScrollbarThumb
        component={thumb}
        bind:currentIndex={index}
        bind:currentY
        bind:isDragging
        bind:startY
        bind:thumbHeight
        bind:thumbPosition
        {size}
        {minThumbTravel}
        {maxThumbTravel}
        {goto}
    ></MagicScrollbarThumb>
</MagicScrollbarTrack>
