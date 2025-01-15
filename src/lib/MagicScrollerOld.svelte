<script>
    import { onDestroy } from 'svelte';
    let {
        children,
        width,
        height,
        header,
        headerPlaceholder,
        footerPlaceholder,
        length,
        item,
        minItemHeight = 12,
        placeholder,
        footer,
        direction = 'y',
        class: cn,
        style: style
    } = $props();

    let lastXScroll = $state(0);
    let lastYScroll = $state(0);
    let yScroll = $state(0);
    let xScroll = $state(0);
    let velocityX = $state(0);
    let velocityY = $state(0);
    let lastTouchTime = $state(0);
    let animationFrame = $state(null);

    // Constants for physics
    const BASE_FRICTION = 0.98; // Increased for longer glide
    const FAST_FRICTION = 0.995; // Higher for smoother fast scrolling
    const VELOCITY_SCALE = 4; // Increased for more responsive feel
    const VELOCITY_THRESHOLD = 10; // Lowered threshold for fast mode
    const BOUNCE_FACTOR = 0.1; // Reduced bounce effect
    const WHEEL_SCALE = 1.0;

    // Add boundary state
    let contentRef = $state(null);
    let containerRef = $state(null);
    let minXScroll = $state(0);
    let maxXScroll = $state(0);
    let minYScroll = $state(0);
    let maxYScroll = $state(0);

    // Add item tracking
    let itemHeight = $state(0);
    let currentItem = $state(0);

    let elementsToRender = $state(0);

    // Calculate boundaries when content/container changes
    $effect(() => {
        if (contentRef && containerRef) {
            const contentRect = contentRef.getBoundingClientRect();
            const containerRect = containerRef.getBoundingClientRect();

            // elementsToRender = Math.ceil(containerRect.height / minItemHeight);
            // console.log(elementsToRender);
            minXScroll = containerRect.width - contentRect.width;
            minYScroll = containerRect.height - contentRect.height;
            maxXScroll = 0;
            maxYScroll = 0;
        }
    });

    // Calculate item height when content changes
    // $effect(() => {
    //     if (contentRef && containerRef && length > 0) {
    //         const contentRect = contentRef.getBoundingClientRect();
    //         itemHeight = contentRect.height / length;

    //         // Update boundaries based on items
    //         minYScroll = -(length * itemHeight - containerRef.clientHeight);
    //         maxYScroll = 0;
    //     }
    // });

    const handleOnScroll = (e) => {
        e.preventDefault();

        const deltaX = e.deltaX * WHEEL_SCALE;
        const deltaY = e.deltaY * WHEEL_SCALE;
        const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;

        if (direction === 'both' || direction === 'x') {
            const newX = xScroll - deltaX * scale;
            xScroll = Math.max(minXScroll, Math.min(maxXScroll, newX));
        }

        if (direction === 'both' || direction === 'y') {
            const newY = yScroll - deltaY * scale;
            yScroll = Math.max(minYScroll, Math.min(maxYScroll, newY));
        }
    };

    const handleOnTouchStart = (e) => {
        const touch = e.touches[0];
        lastXScroll = touch.clientX;
        lastYScroll = touch.clientY;
        lastTouchTime = Date.now();

        // Cancel any ongoing momentum
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        velocityX = 0;
        velocityY = 0;
    };

    const MIN_VELOCITY = 0.1;
    const MAX_VELOCITY = 50;
    const BOUNCE_DAMPENING = 0.5;
    const BOUNCE_THRESHOLD = 0.1;
    let isBouncing = $state(false);

    const handleOnTouchMove = (e) => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastXScroll;
        const deltaY = touch.clientY - lastYScroll;
        const deltaTime = Math.max(16, Date.now() - lastTouchTime);

        if (direction === 'both' || direction === 'x') {
            const newX = xScroll + deltaX;
            if (newX > maxXScroll || newX < minXScroll) {
                // Apply bounce effect
                isBouncing = true;
                xScroll += deltaX * BOUNCE_DAMPENING;
                velocityX *= BOUNCE_DAMPENING;
            } else {
                isBouncing = false;
                xScroll = newX;
                velocityX = (deltaX / deltaTime) * VELOCITY_SCALE;
            }
        }

        if (direction === 'both' || direction === 'y') {
            const newY = yScroll + deltaY;
            if (newY > maxYScroll || newY < minYScroll) {
                // Apply bounce effect
                isBouncing = true;
                yScroll += deltaY * BOUNCE_DAMPENING;
                velocityY *= BOUNCE_DAMPENING;
            } else {
                isBouncing = false;
                yScroll = newY;
                velocityY = (deltaY / deltaTime) * VELOCITY_SCALE;
            }

            // Update current item
            currentItem = Math.floor(Math.abs(yScroll) / itemHeight);
        }

        lastXScroll = touch.clientX;
        lastYScroll = touch.clientY;
        lastTouchTime = Date.now();
    };

    const handleOnTouchEnd = () => {
        if (isBouncing) {
            // Snap back to bounds if we're outside
            if (xScroll > maxXScroll) xScroll = maxXScroll;
            if (xScroll < minXScroll) xScroll = minXScroll;
            if (yScroll > maxYScroll) yScroll = maxYScroll;
            if (yScroll < minYScroll) yScroll = minYScroll;
            velocityX = 0;
            velocityY = 0;
        } else if (
            Math.abs(velocityX) > BOUNCE_THRESHOLD ||
            Math.abs(velocityY) > BOUNCE_THRESHOLD
        ) {
            applyMomentum();
        }
    };

    const applyMomentum = () => {
        if (Math.abs(velocityX) < MIN_VELOCITY && Math.abs(velocityY) < MIN_VELOCITY) {
            cancelAnimationFrame(animationFrame);
            return;
        }

        // Dynamic friction based on velocity
        const currentFrictionX =
            Math.abs(velocityX) > VELOCITY_THRESHOLD ? FAST_FRICTION : BASE_FRICTION;
        const currentFrictionY =
            Math.abs(velocityY) > VELOCITY_THRESHOLD ? FAST_FRICTION : BASE_FRICTION;

        if (direction === 'both' || direction === 'x') {
            const newX = xScroll + velocityX;
            if (newX > maxXScroll || newX < minXScroll) {
                velocityX *= -BOUNCE_FACTOR;
            }
            xScroll = Math.max(minXScroll, Math.min(maxXScroll, newX));
            velocityX *= currentFrictionX;
        }

        if (direction === 'both' || direction === 'y') {
            const newY = yScroll + velocityY;
            if (newY > maxYScroll || newY < minYScroll) {
                velocityY *= -BOUNCE_FACTOR;
            }
            yScroll = Math.max(minYScroll, Math.min(maxYScroll, newY));
            velocityY *= currentFrictionY;
        }

        animationFrame = requestAnimationFrame(applyMomentum);
    };

    // Cleanup on component destroy
    onDestroy(() => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
</script>

<div
    bind:this={containerRef}
    class={cn}
    style={`width: ${width}; height: ${height}; overflow: visible; background: grey; ${style}`}
    onwheel={handleOnScroll}
    ontouchstart={handleOnTouchStart}
    ontouchend={handleOnTouchEnd}
    ontouchmove={handleOnTouchMove}
>
    <div
        bind:this={contentRef}
        on
        style={`transform: translate(${direction !== 'y' ? xScroll : 0}px, ${direction !== 'x' ? yScroll : 0}px);`}
    >
        {@render header?.()}

        {#each Array(1000) as _, i (i)}
            {@render item?.(i)}
        {/each}

        {@render footer?.()}
    </div>
</div>
