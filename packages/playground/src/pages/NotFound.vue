<template>
  <div class="not-found-page">
    <h1>No page found</h1>
    <a href="#/">Home</a>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;

  a {
    display: inline-block;
    padding: .5rem;
    text-decoration: none;
    background-color: transparent;
    border-radius: .5rem;
    transition: background-color .2s;

    &:hover { background-color: aliceblue }
    &:visited { color: inherit }
  }
}
</style>
