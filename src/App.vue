<template>
  <component :is="resolveLayout">
    <router-view></router-view>
  </component>
</template>

<script>
import { computed } from '@vue/composition-api'
import { initializeApp } from 'firebase/app'

// import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { useRouter } from '@/utils'
import LayoutBlank from '@/layouts/Blank.vue'
import LayoutContent from '@/layouts/Content.vue'

const firebaseConfig = {
  apiKey: 'AIzaSyBWQAsXqYmD2hdxKbfa2YLv5QTBx0ItLHs',
  authDomain: 'cheap-internal-sms-app.firebaseapp.com',
  databaseURL: 'https://cheap-internal-sms-app-default-rtdb.firebaseio.com',
  projectId: 'cheap-internal-sms-app',
  storageBucket: 'cheap-internal-sms-app.appspot.com',
  messagingSenderId: '226478391897',
  appId: '1:226478391897:web:0954e94fc2fac33195a748',
  measurementId: 'G-K4N3K9MGG6',
}

// Initialize Firebase
initializeApp(firebaseConfig)

// const db = getFirestore()
// connectFirestoreEmulator(db, '127.0.0.1', 8082) // connnect to a local emulator
export default {
  components: {
    LayoutBlank,
    LayoutContent,
  },
  setup() {
    const { route } = useRouter()

    const resolveLayout = computed(() => {
      // Handles initial route
      if (route.value.name === null) return null

      if (route.value.meta.layout === 'blank') return 'layout-blank'

      return 'layout-content'
    })

    return {
      resolveLayout,
    }
  },
}
</script>
