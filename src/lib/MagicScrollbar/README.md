# Magic Scrollbar

This is an example of how a scroll bar can be implemented for `svelte-magic-scroller`. This scroll bar mimics the behavior of native web scroll bars.

Note that this example does not support precise scrollbar scrubbing. This is a basic example will always snap to top of items using `goto()`. As the list size increases, the precision of the scroll bar will matter less.

Accurate and fine positioning of the thumb is not possible we don't store the height of every element in the list (it is not memory efficient to store heights of all items with millions of items).

It is possible to include offset adjustments while scrubbing to improve the smoothness in smaller list sizes, however this example does not cover this implementation.

## Example

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

{#snippet track(children)}
  <div class="track">
    {@render children()}
  </div>
{/snippet}

{#snippet thumb()}
  <div class="thumb"></div>
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
<MagicScrollbar {track} {thumb} bind:index goto={ref?.goto} size={length} ` />

<style>
  .track {
    /* your scroll track style here */
  }

  .thumb {
    /* your scroll thumb style here */
  }
</style>
```
