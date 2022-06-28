<template>
  <div>
    <p class="text-2xl mb-6">
      About the app
    </p>

    <about-app></about-app>

    <p class="text-2xl mt-14 mb-6">
      Project Team
    </p>

    <team></team>
  </div>
</template>

<script>
import AboutApp from './AboutApp.vue'
import Team from './Team.vue'

export default {
  components: {
    AboutApp,
    Team,
  },
}
</script>
