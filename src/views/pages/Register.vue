<template>
  <div class="auth-wrapper auth-v1">
    <div class="auth-inner">
      <v-card class="auth-card">
        <!-- logo -->
        <v-card-title class="d-flex align-center justify-center py-7">
          <router-link
            to="/"
            class="d-flex align-center"
          >
            <v-img
              :src="require('@/assets/images/logos/logo.svg')"
              max-height="30px"
              max-width="30px"
              alt="logo"
              contain
              class="me-3 "
            ></v-img>

            <h2 class="text-2xl font-weight-semibold">
              Sms Chimp
            </h2>
          </router-link>
        </v-card-title>

        <!-- title -->
        <v-card-text>
          <p class="text-2xl font-weight-semibold text--primary mb-2">
            Adventure starts here 🚀
          </p>
          <p class="mb-2">
            Sms marketing automation
          </p>
        </v-card-text>

        <!-- login form -->
        <v-card-text>
          <v-form>
            <v-alert
              v-if="message"
              dense
              outlined
              type="error"
            >
              {{ message }}
            </v-alert>
            <v-text-field
              v-model="name"
              outlined
              label="Name"
              placeholder="JohnDoe"
              hide-details
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="email"
              outlined
              label="Email"
              placeholder="john@example.com"
              hide-details
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="password"
              outlined
              :type="isPasswordVisible ? 'text' : 'password'"
              label="Password"
              placeholder="············"
              :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
              hide-details
              @click:append="isPasswordVisible = !isPasswordVisible"
            ></v-text-field>

            <v-checkbox
              hide-details
              class="mt-1"
            >
              <template #label>
                <div class="d-flex align-center flex-wrap">
                  <span class="me-2">I agree to</span><a href="javascript:void(0)">privacy policy &amp; terms</a>
                </div>
              </template>
            </v-checkbox>

            <v-btn
              block
              color="primary"
              class="mt-6"
              :disabled="!formValidated"
              @click="register"
            >
              Sign Up
            </v-btn>
          </v-form>
        </v-card-text>

        <!-- create new account  -->
        <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
          <span class="me-2">
            Already have an account?
          </span>
          <router-link :to="{ name:'pages-login' }">
            Sign in instead
          </router-link>
        </v-card-text>

        <!-- divider -->
        <v-card-text
          v-if="false"
          class="d-flex align-center mt-2"
        >
          <v-divider></v-divider>
          <span class="mx-5">or</span>
          <v-divider></v-divider>
        </v-card-text>

        <!-- social link -->
        <v-card-actions
          v-if="false"
          class="d-flex justify-center"
        >
          <v-btn
            v-for="link in socialLink"
            :key="link.icon"
            icon
            class="ms-1"
          >
            <v-icon :color="$vuetify.theme.dark ? link.colorInDark:link.color">
              {{ link.icon }}
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- background triangle shape  -->
    <img
      class="auth-mask-bg"
      height="190"
      :src="require(`@/assets/images/misc/mask-${$vuetify.theme.dark ? 'dark':'light'}.png`)"
    >

    <!-- tree -->
    <v-img
      class="auth-tree"
      width="247"
      height="185"
      src="@/assets/images/misc/tree.png"
    ></v-img>

    <!-- tree  -->
    <v-img
      class="auth-tree-3"
      width="377"
      height="289"
      src="@/assets/images/misc/tree-3.png"
    ></v-img>
  </div>
</template>

<script>

// eslint-disable-next-line object-curly-newline
import { mdiFacebook, mdiTwitter, mdiGithub, mdiGoogle, mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js'
import { ref } from '@vue/composition-api'
import { getAuth, updateProfile, createUserWithEmailAndPassword } from 'firebase/auth'
import {
  setDoc,
  Timestamp,
  getFirestore,
  doc,
} from 'firebase/firestore'
import { getApp } from 'firebase/app'

export default {
  setup() {
    const isPasswordVisible = ref(false)
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const socialLink = [
      {
        icon: mdiFacebook,
        color: '#4267b2',
        colorInDark: '#4267b2',
      },
      {
        icon: mdiTwitter,
        color: '#1da1f2',
        colorInDark: '#1da1f2',
      },
      {
        icon: mdiGithub,
        color: '#272727',
        colorInDark: '#fff',
      },
      {
        icon: mdiGoogle,
        color: '#db4437',
        colorInDark: '#db4437',
      },
    ]

    return {
      message: '',
      isPasswordVisible,
      name,
      email,
      password,
      socialLink,

      icons: {
        mdiEyeOutline,
        mdiEyeOffOutline,
      },
    }
  },
  computed: {
    formValidated() {
      const { name, email, password } = this
      if (email && password && name) {
        return true
      }

      return false
    },
  },
  methods: {
    async register() {
      try {
        const auth = getAuth()
        createUserWithEmailAndPassword(auth, this.email, this.password)
          .then(userCredential => {
            // Signed up
            const { user } = userCredential
            const app = getApp()
            const db = getFirestore(app)
            updateProfile(auth.currentUser, {
              displayName: this.name,
            })
            setDoc(doc(db, 'users', user.uid), {
              id: user.uid,
              name: this.name,
              balance: 100,
              updated_at: Timestamp.now(),
            })
            this.$router.push({ name: 'dashboard' })
          })
          .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
            this.message = errorMessage
            if (errorCode === 'auth/invalid-email') {
              this.message = 'Invalid email address'
            }

            console.log(errorCode)
            console.log(errorMessage)
          })

        // alert('Registration successful!')
      } catch (error) {
        console.error('Error during registration:', error.message)
        alert('Registration failed. Check the console for details.')
      }
    },
  },
}
</script>

<style lang="scss">
@import '~@/plugins/vuetify/default-preset/preset/pages/auth.scss';
</style>
