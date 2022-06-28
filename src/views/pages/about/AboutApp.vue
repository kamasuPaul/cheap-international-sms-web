<template>
  <div>
    <v-row>
      <!-- Lifetime Membership -->
      <v-col
        md="6"
        lg="12"
        cols="12"
      >
        <v-card class="overflow-hidden">
          <v-row class="ma-0 h-full">
            <v-col
              cols="12"
              sm="8"
              md="12"
              lg="8"
              order="2"
              order-lg="1"
            >
              <v-card-title>University course recommender</v-card-title>
              <v-card-text>
                <p class="text-lg">
                  Course recommender is a web and mobile application that helps you to find the best university courses for you.
                </p>
              </v-card-text>
              <v-card-text>
                <v-divider></v-divider>
              </v-card-text>
              <v-card-actions class="d-flex justify-center">
                <div class="me-auto pe-4">
                  <p class="d-flex align-center mb-6">
                    <v-icon color="primary">
                      {{ icons.mdiLockOpenOutline }}
                    </v-icon>
                    <span class="ms-3">COURSE ELIGIBILITY</span>
                  </p>
                  <p class="d-flex align-center mb-0">
                    <v-icon color="primary">
                      {{ icons.mdiAccountOutline }}
                    </v-icon>
                    <span class="ms-3">COURSE RECOMMENDATIONS</span>
                  </p>
                </div>

                <v-divider
                  v-if="$vuetify.breakpoint.smAndUp"
                  vertical
                  inset
                >
                </v-divider>

                <div class="ms-auto ps-4">
                  <p class="d-flex align-center mb-6">
                    <v-icon color="primary">
                      {{ icons.mdiStarOutline }}
                    </v-icon>
                    <span class="ms-3">COURSE INFORMATION</span>
                  </p>
                  <p class="d-flex align-center mb-0">
                    <v-icon color="primary">
                      {{ icons.mdiTrendingUp }}
                    </v-icon>
                    <span class="ms-3">CUT OFF POINTS CALCULATION</span>
                  </p>
                </div>
              </v-card-actions>
            </v-col>
            <v-col
              cols="12"
              sm="4"
              md="12"
              lg="4"
              order="1"
              order-lg="2"
              class="memberpricing-bg"
            >
              <div class="membership-pricing">
                <p class="mt-16 text--primary">
                  <sub class="text-2xl">UGX</sub>
                  <sup class="font-weight-semibold">0</sup>
                  <sub class="text-xl"></sub>
                </p>
                <p class="my-6 text--secondary text-sm">
                  Free for students for life, upto 3 result checks.
                </p>
                <v-btn
                  color="primary"
                  class="mt-6"
                  target="_blank"
                  href="https://recommender.kamasupaul.com/contact-us/"
                >
                  Contact Now
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <!-- Support -->
      <!-- <v-col
        cols="12"
        md="6"
        lg="4"
        class="align-self-start"
      >
        <v-card color="text-center">
          <v-card-text class="d-flex flex-column justify-center align-center">
            <v-avatar
              color="primary"
              class="mt-10"
              icon
              size="50"
            >
              <v-icon
                size="2rem"
                color="white"
              >
                {{ icons.mdiHelpCircleOutline }}
              </v-icon>
            </v-avatar>
            <h6 class="text-xl mt-4 font-weight-medium">
              Support
            </h6>
          </v-card-text>
          <v-card-text>
            According to us blisters are a very common thing and we come across them very often in our daily lives. It is a very common occurrence like cold or fever depending upon your lifestyle.
          </v-card-text>
          <v-card-text>
            <v-btn
              color="primary"
              class="mt-4"
            >
              Contact Now
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col> -->
    </v-row>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import {
  mdiChevronUp,
  mdiChevronDown,
  mdiCartPlus,
  mdiShareVariantOutline,
  mdiLockOpenOutline,
  mdiStarOutline,
  mdiAccountOutline,
  mdiTrendingUp,
  mdiHelpCircleOutline,
} from '@mdi/js'

export default {
  setup() {
    const isCardDetailsVisible = false
    const rating = ref(5)

    return {
      isCardDetailsVisible,
      rating,

      // icons
      icons: {
        mdiChevronUp,
        mdiChevronDown,
        mdiCartPlus,
        mdiShareVariantOutline,
        mdiLockOpenOutline,
        mdiStarOutline,
        mdiAccountOutline,
        mdiTrendingUp,
        mdiHelpCircleOutline,
      },
    }
  },
}
</script>

<style lang="scss" scoped>
@import '@/plugins/vuetify/default-preset/preset/mixins.scss';

.avatar-center {
  top: -2rem;
  left: 1rem;
  border: 3px solid white;
  position: absolute;
}

// membership pricing
@include theme--child(memberpricing-bg) using ($material) {
  background-color: rgba(map-deep-get($material, 'primary-shade'), map-deep-get($material, 'states', 'hover'));
}

.memberpricing-bg {
  position: relative;
}
.membership-pricing {
  text-align: center;
  sup {
    font-size: 3.75rem;
    top: 9px;
  }
}
</style>
