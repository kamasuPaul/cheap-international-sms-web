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
            Hi, welcome back! 👋🏻
          </p>
          <p class="mb-2">
            Please sign-in to your account and start the adventure
          </p>
        </v-card-text>

        <!-- login form -->
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.body.email"
              outlined
              label="Email"
              placeholder="john@example.com"
              hide-details
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="form.body.password"
              outlined
              :type="isPasswordVisible ? 'text' : 'password'"
              label="Password"
              placeholder="············"
              :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
              hide-details
              class="mb-3"
              @click:append="isPasswordVisible = !isPasswordVisible"
            ></v-text-field>

            <template v-for="error in form.errors">
              <v-alert
                :key="error"
                :value="true"
                type="error"
                class="mb-3"
              >
                <small> {{ error[0] }}</small>
              </v-alert>
            </template>

            <div class="d-flex align-center justify-space-between flex-wrap">
              <v-checkbox
                v-model="form.remember"
                label="Remember Me"
                hide-details
                class="me-3 mt-1"
              >
              </v-checkbox>

              <!-- forgot link -->
              <a
                href="javascript:void(0)"
                class="mt-1"
              > Forgot Password? </a>
            </div>

            <v-btn
              block
              color="primary"
              class="mt-6"
              :loading="loading"
              @click="login"
            >
              Login
            </v-btn>
          </v-form>
        </v-card-text>

        <!-- create new account  -->
        <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
          <span class="me-2"> New on our platform? </span>
          <router-link :to="{ name: 'auth-register' }">
            Create an account
          </router-link>
        </v-card-text>

        <!-- divider -->
        <v-card-text class="d-flex align-center mt-2">
          <v-divider></v-divider>
          <span class="mx-5">or</span>
          <v-divider></v-divider>
        </v-card-text>

        <!-- social links -->
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
      height="173"
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
          email: '',
          password: '',
        },
        errors: {},
        remember: false,
        fetchUser: true,
        autoLogin: true,
        staySignedIn: false,
      },
    }
  },
  methods: {
    errors(res) {
      this.form.errors = res.data.errors // Object.fromEntries(res.data.errors.map(item => [item.field, item.msg]))
    },
    login() {
      this.loading = true
      this.form.errors = null
      this.$auth
        .login({
          url: '/login',
          data: this.form.body,
          redirect: null,
          remember: this.form.remember ? '{"name": "Redirect"}' : null,
          fetchUser: false,
          staySignedIn: true,
        })

        // on success store axios token in store
        .then(res => {
          // log the user from the respons
          const { token } = res.data.data
          // eslint-disable-next-line dot-notation
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          this.$auth.token(null, token, true)

          // get the user from the api
          this.$http.get('me').then(resp => {
            const { data } = resp.data
            this.$auth
              .user({
                id: data.id,
                name: data.name,
                email: data.email,
                type: 'user',
              })
            this.$router.push({ name: 'dashboard' })
          })
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
