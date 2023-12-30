<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="headline">
        Fund your wallet
      </v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-text-field
            v-model="amount"
            label="Amount"
            type="number"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          :disabled="!validateForm"
          color="primary"
          @click="processPayment"
        >
          Top Up
        </v-btn>
        <v-btn
          plain
          @click="closeDialog"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
    <!-- notification snack bar -->
    <v-snackbar
      v-model="snackbar"
      left
    >
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script>
import { getAuth } from 'firebase/auth'
import {
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  Timestamp,
  getFirestore,
  doc,
} from 'firebase/firestore'
import { getApp } from 'firebase/app'

export default {
  props: {
    show: Boolean,
  },
  data() {
    return {
      dialog: false,
      amount: 5000,
      message: '',
      snackbar: false,
      modal: null,
    }
  },
  computed: {
    validateForm() {
      return this.amount !== null && parseFloat(this.amount) > 500
    },
  },
  watch: {
    show(newVal) {
      this.dialog = newVal
    },
  },
  methods: {
    openDialog() {
      this.dialog = true
    },
    closeDialog() {
      this.$emit('close')
    },
    async processPayment() {
      if (!this.validateForm) {
        // Handle form validation error
        return
      }

      const { FlutterwaveCheckout } = window
      const txRef = Math.random()
        .toString(36)
        .substring(2, 12)
      const auth = getAuth()
      const { currentUser } = auth
      const paymentData = {
        public_key: process.env.VUE_APP_RAVE_PUBLIC_KEY,
        tx_ref: txRef,
        amount: parseFloat(this.amount),
        currency: 'UGX',
        payment_options: 'card,mobile_money',
        customer: {
          email: currentUser.email,
          name: currentUser.displayName,
        },

        // Add other options as needed
        callback: async response => {
          if (response.status === 'successful') {
            // Payment successful, update user's balance in Firestore
            await this.updateUserBalance(response)
            this.closeDialog()

            // Optionally, show a success message
            this.message = 'Payment completed!'
          } else {
            // Payment failed or was canceled
            this.message = 'Payment failed or canceled'
          }
          this.snackbar = true
          this.modal.close()
        },
        onclose: () => {
          this.message = 'Payment closed'
          this.snackbar = true
        },
        customizations: {
          title: 'Wallet Top-Up',
          description: 'Top up your wallet balance',
          logo: 'URL to your logo',
        },
      }

      // Initiate Flutterwave payment
      this.modal = FlutterwaveCheckout(paymentData)
    },
    async updateUserBalance(paymentResponse) {
      // Assuming you have Firebase set up and user is authenticated
      const auth = getAuth()
      const { currentUser } = auth

      if (currentUser) {
        try {
          // Get user document from Firestore
          const app = getApp()
          const db = getFirestore(app)
          const userRef = await doc(db, 'users', currentUser.uid)
          const userDoc = await getDoc(userRef)
          if (userDoc.exists()) {
            const currentBalance = userDoc.data().balance
            const newBalance = parseFloat(currentBalance) + parseFloat(paymentResponse.amount)
            await addDoc(collection(db, 'transactions'), {
              amount: paymentResponse.amount,
              reference: paymentResponse.tx_ref,
              status: paymentResponse.status,
              created_at: Timestamp.now(),
              customer: paymentResponse.customer,
              currency: paymentResponse.currency,
              user_id: getAuth().currentUser.uid,
            })
            await updateDoc(userRef, {
              balance: newBalance,
              updated_at: Timestamp.now(),
            }, { merge: true })
          } else {
            setDoc(userRef, {
              id: currentUser.uid,
              balance: parseFloat(paymentResponse.amount),
              updated_at: Timestamp.now(),
            })
          }
        } catch (error) {
          console.error('Error updating user balance:', error)
        }
      }
    },
  },
}
</script>

<style scoped>
/* Add any additional styling here */
</style>
