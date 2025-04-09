<script>
  let { length } = $props();

  function writeScientificNum(p_num, p_precision) {
    var n = Math.floor(Math.log10(p_num));
    var m = (p_num / Math.pow(10, Math.abs(n))).toLocaleString();
    return m.toString() + ' x 10<sup>' + n.toString() + '</sup>';
  }
</script>

<div class="title-card">
  <h1>svelte-magic-scroller</h1>
  <h3>It's not real - it's just magic</h3>

  <p>
    This package is a virtualized scroller which enables the scrolling of unlimited items of unknown
    dimensions. Only items in the vicinity of the current viewport are rendered.
  </p>
  <p>Works best for super large lists like an activity feed or photo gallery.</p>
  <p>
    This page is a list of {@html writeScientificNum(length, 3)} items, including this intro section
    and all the documentation sections.
  </p>
</div>

<style>
  .title-card {
    margin-top: 3rem;
    align-items: left;
    flex-direction: column;
    display: flex;
    height: 100%;
    justify-content: start;
    width: 100%;
    padding: 8px;
    max-width: 40rem;

    h1 {
      font-size: 3rem;
      font-weight: 400;
      margin: 0;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 300;
      margin: 8px 0;
    }
  }
</style>
