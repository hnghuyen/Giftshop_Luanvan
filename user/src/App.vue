<template>
  <div>
    <Header />
    <Navbar />
    <router-view />
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
  margin: 0;
  padding: 0;

}

</style>

