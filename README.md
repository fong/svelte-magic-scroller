# svelte-magic-scroller

It's not real - it's just magic

This package is a virtualized scroller which enables the scrolling of unlimited items of unknown dimensions. Only items in the vicinity of the current viewport are rendered.

Works best for super large lists like an activity feed or photo gallery

[Demo](https://svelte-magic-scroller.pages.dev/)

## Features

- No restrictions to dimensions of virtualized lists (exceeds the 33554428px on Chrome/Safari, 33554400px on Firefox browser dimension limit)
- Lazy loading
- Low memory footprint
- Configurable scroll speed
- Fixed/Dynamic item sizes
- Middle mouse button drag scroll support
- Made for Svelte 5
- No dependencies

## Install

`npm install svelte-magic-scroller`

`yarn i svelte-magic-scroller`

`pnpm i svelte-magic-scroller`

## How to use

### Minimal example

```svelte
<script>
    const INITIAL_LENGTH = 5000000000000;
    let length = $state(INITIAL_LENGTH); // list size
    let index = $state(0); // first full item visible in viewport
    let offset = $state(0); // y offset from top
    let ref = $state();
</script>

{#snippet item(i)}
    <Item index={i} {length} />
{/snippet}

<MagicScroller
    bind:this={ref}
    bind:index
    bind:offset
    itemStyle={`display: flex; justify-content: center;`}
    width="100%"
    height="100%"
    {length}
    {item}
/>
```

### Go to

You can use `goto(index)` to jump to any place in the list (e.g. `ref?.goto(256000)`). If you would like to offset the location, you can add to the optional parameters (e.g. `ref?.goto(256000, { offset: 64})`).

The `goto` function does not support smooth scrolling when performing large list jumps, unless the target item is already in the buffer.

## Scroll bar

It is recommended to implement your own scroll bar to match your UX requirements. This is due to handling experience as the list size increase - the implementation of a scrollbar with 10,000 will likely need to differ significantly to another list with 1,000,000+ items.

A basic scrollbar example can be found in the repo [here](https://github.com/fong/svelte-magic-scroller/tree/main/src/lib/MagicScrollbar)

## Quirks

- while `index` and `offset` are bindable and can be set to move to any location on the list, it is recommended to use `goto()` to set the correct positions at the start/end of the list
- No support for iOS Safari status bar go to top tap action