<template>
  <v-app>
    <vertical-nav-menu :is-drawer-open.sync="isDrawerOpen"></vertical-nav-menu>

    <v-app-bar
      app
      flat
      absolute
      color="transparent"
    >
      <div class="boxed-container w-full">
        <div class="d-flex align-center mx-6">
          <!-- Left Content -->
          <v-app-bar-nav-icon
            class="d-block d-lg-none me-2"
            @click="isDrawerOpen = !isDrawerOpen"
          ></v-app-bar-nav-icon>
          <!-- <v-text-field
            rounded
            dense
            outlined
            :prepend-inner-icon="icons.mdiMagnify"
            class="app-bar-search flex-grow-0"
            hide-details
          ></v-text-field> -->
          <v-chip
            label
            outlined
            class="mt-3"
          >
            Wallet: UGX {{ walletBalance }}
            <v-btn
              icon
              small
              class="ms-3"
              color="primary"
            >
              <v-icon @click="walletTopUpOpen = true">
                {{ icons.mdiPlusCircleOutline }}
              </v-icon>
            </v-btn>
          </v-chip>
          <wallet-top-up-dialog
            :show="walletTopUpOpen"
            @close="walletTopUpOpen = false"
          />

          <v-spacer></v-spacer>

          <!-- Right Content -->
          <!-- <a
            href="https://github.com/themeselection/materio-vuetify-vuejs-admin-template-free"
            target="_blank"
            rel="nofollow"
          >
            <v-icon class="ms-6 me-4">
              {{ icons.mdiGithub }}
            </v-icon>
          </a> -->
          <theme-switcher></theme-switcher>
          <v-btn
            icon
            small
            class="ms-3"
          >
            <v-icon>
              {{ icons.mdiBellOutline }}
            </v-icon>
          </v-btn>
          <app-bar-user-menu></app-bar-user-menu>
        </div>
      </div>
    </v-app-bar>

    <v-main>
      <div class="app-content-container boxed-container pa-6">
        <slot></slot>
      </div>
    </v-main>

    <v-footer
      app
      inset
      color="transparent"
      absolute
      height="56"
      class="px-0"
    >
      <div class="boxed-container w-full">
        <div class="mx-6 d-flex justify-space-between">
          <span>
            &copy; Sms Chimp by <a
              href="https://kamasupaul.com"
              class="text-decoration-none"
              target="_blank"
            >Kamasu Paul</a></span>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import { ref } from '@vue/composition-api'
import {
  mdiMagnify, mdiBellOutline, mdiGithub, mdiPlusCircleOutline,
} from '@mdi/js'
import { getAuth } from 'firebase/auth'
import {
  onSnapshot,
  getFirestore,
  doc,
} from 'firebase/firestore'
import { getApp } from 'firebase/app'
import VerticalNavMenu from './components/vertical-nav-menu/VerticalNavMenu.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import AppBarUserMenu from './components/AppBarUserMenu.vue'
import WalletTopUpDialog from '@/components/WalletTopUpDialog.vue'

export default {
  components: {
    VerticalNavMenu,
    ThemeSwitcher,
    AppBarUserMenu,
    WalletTopUpDialog,
  },
  setup() {
    const isDrawerOpen = ref(null)

    return {
      isDrawerOpen,

      // Icons
      icons: {
        mdiMagnify,
        mdiBellOutline,
        mdiGithub,
        mdiPlusCircleOutline,
      },
    }
  },
  data() {
    return {
      walletTopUpOpen: false,
      walletBalance: 0,
    }
  },
  mounted() {
    this.getWalletInfo()
  },
  methods: {
    async getWalletInfo() {
      const auth = getAuth()
      const { currentUser } = auth
      const app = getApp()
      const db = getFirestore(app)
      onSnapshot(doc(db, 'users', currentUser.uid), document => {
        if (document && document.exists()) {
          const { balance } = document.data()
          this.walletBalance = balance.toLocaleString()
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.v-app-bar ::v-deep {
  .v-toolbar__content {
    padding: 0;

    .app-bar-search {
      .v-input__slot {
        padding-left: 18px;
      }
    }
  }
}

.boxed-container {
  max-width: 1440px;
  margin-left: auto;
  margin-right: auto;
}
</style>
