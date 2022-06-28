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
              class="me-3"
            ></v-img>

            <h2 class="text-2xl font-weight-semibold">
              Recommender
            </h2>
          </router-link>
        </v-card-title>

        <!-- title -->
        <v-card-text>
          <p class="d-flex text-xl font-weight-semibold text--primary mb-2 align-center justify-center">
            University starts here 🚀
          </p>
          <p class="mb-2">
            Make your university registeration easy and fun!
          </p>
        </v-card-text>

        <!-- login form -->
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.body.name"
              outlined
              label="Name"
              placeholder="JohnDoe"
              :error-messages="form.errors.name"
            ></v-text-field>

            <v-text-field
              v-model="form.body.email"
              outlined
              label="Email"
              placeholder="john@example.com"
              :error-messages="form.errors.email"
            ></v-text-field>

            <v-text-field
              v-model="form.body.password"
              hint="atleast 6 characters"
              :rules="[rules.required, rules.min]"
              outlined
              :type="isPasswordVisible ? 'text' : 'password'"
              label="Password"
              placeholder="············"
              :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
              :error-messages="form.errors.password"
              @click:append="isPasswordVisible = !isPasswordVisible"
            ></v-text-field>
            <v-text-field
              v-model="form.body.password_confirmation"
              :rules="[rules.required, rules.min]"
              outlined
              :type="isPasswordVisible ? 'text' : 'password'"
              label="Confirm password"
              placeholder="············"
              :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
              :error-messages="form.errors.password_confirmation"
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
              :loading="loading"
              @click="register"
            >
              Sign Up
            </v-btn>
          </v-form>
        </v-card-text>

        <!-- create new account  -->
        <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
          <span class="me-2"> Already have an account? </span>
          <router-link :to="{ name: 'auth-login' }">
            Sign in instead
          </router-link>
        </v-card-text>

        <!-- divider -->
        <v-card-text class="d-flex align-center mt-2">
          <v-divider></v-divider>
          <span class="mx-5">or</span>
          <v-divider></v-divider>
        </v-card-text>

        <!-- social link -->
        <v-card-actions class="d-flex justify-center">
          <v-btn
            v-for="link in socialLink"
            :key="link.icon"
            icon
            class="ms-1"
          >
            <v-icon :color="$vuetify.theme.dark ? link.colorInDark : link.color">
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
      :src="require(`@/assets/images/misc/mask-${$vuetify.theme.dark ? 'dark' : 'light'}.png`)"
    />

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
import axios from 'axios'

// import { ref } from '@vue/composition-api'
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
export default {
  data() {
    return {
      isPasswordVisible: false,
      loading: false,
      socialLink,
      icons: {
        mdiEyeOutline,
        mdiEyeOffOutline,
      },
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 6 || 'Min 6 characters',
        emailMatch: () => "The email and password you entered don't match",
      },
      form: {
        body: {
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
        },

        errors: {},
        remember: false,
        fetchUser: false,
        autoLogin: true,
        staySignedIn: true,
      },
    }
  },
  methods: {
    errors(res) {
      this.form.errors = res.data.errors // Object.fromEntries(res.data.errors.map(item => [item.field, item.msg]))
    },
    register() {
      this.loading = true
      this.$auth
        .register({
          data: this.form.body, // Axios
          url: '/register', // URL
          redirect: null,
          remember: true, // this.form.remember ? '{"name": "Redirect"}' : null,
          fetchUser: this.form.fetchUser,

          // autoLogin: this.form.autoLogin,
          staySignedIn: this.form.staySignedIn,
        })
        .then(res => {
          const { token } = res.data.data
          // eslint-disable-next-line dot-notation
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          this.$auth.token(null, token, true)
          this.$auth
            .user({
              id: 1,
              first_name: this.form.body.name,
              email: this.form.body.email,
              type: 'user',
            })
          this.$router.push({ name: 'dashboard' })
        })
        .then(null, res => {
          this.errors(res.response)
          this.loading = false
        })
    },
  },
}
</script>

<style lang="scss">
@import '~@/plugins/vuetify/default-preset/preset/pages/auth.scss';
</style>
