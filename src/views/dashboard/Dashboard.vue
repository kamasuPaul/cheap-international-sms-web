<template>
  <v-card>
    <v-card-title>Send Sms</v-card-title>
    <v-card-text>
      <v-form>
        <v-row>
          <v-col
            cols="12"
            md="3"
          >
            <label for="firstname">Phone Number(s)</label>
          </v-col>

          <v-col
            cols="12"
            md="9"
          >
            <v-combobox
              v-model="phone_numbers"
              :items="items"
              chips
              clearable
              label="Add phone numbers"
              multiple
              filled
              prepend-icon="mdi-filter-variant"
              solo
            >
              <template v-slot:selection="{ attrs, item, select, selected }">
                <v-chip
                  v-bind="attrs"
                  :input-value="selected"
                  close
                  @click="select"
                  @click:close="remove(item)"
                >
                  <strong>{{ item }}</strong>&nbsp;
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <label for="mobile">Mobile</label>
          </v-col>

          <v-col
            cols="12"
            md="9"
          >
            <v-textarea
              v-model="sms_text"
              name="input-7-1"
              filled
              label="Message"
              auto-grow
            ></v-textarea>
            <p v-if="sms_text">
              Send {{ sms_text }}
            </p>
          </v-col>

          <v-col
            offset-md="11"
            cols="12"
          >
            <v-btn
              color="primary"
              :disabled="!(sms_text)"
              :loading="loading"
              @click="sendMessage"
            >
              Send
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { initializeApp } from 'firebase/app'
import {
  getFirestore, addDoc, collection,
} from 'firebase/firestore'

// Import the functions you need from the SDKs you need
// import firebase from 'firebase/app'

// import { getFirestore } from 'firebase/firestore'
// import 'firebase/firestore'

// import { getAnalytics } from 'firebase/analytics'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig)

// firebase.initializeApp(firebaseConfig)
// const db = firebase.firestore()
const db = getFirestore(app)

// const analytics = getAnalytics(app)
export default {
  data() {
    return {
      loading: false,
      sms_text: '',
      phone_numbers: [],
      items: [],

    }
  },
  methods: {
    remove(item) {
      this.phone_numbers.splice(this.phone_numbers.indexOf(item), 1)
      this.phone_numbers = [...this.phone_numbers]
    },
    sendMessage() {
      this.loading = true

      this.phone_numbers.forEach(number => {
        this.loading = true
        addDoc(collection(db, 'messages'), {
          phone: number,
          sms_text: this.sms_text,
          status: 'pending',
        })
          .finally(() => {
            this.loading = false
          })
      })

      // Commit the batch
      // batch.commit().then(() => {
      //   this.loading = false
      // })

      // // try {
      // addDoc(collection(db, 'messages'), {
      //   phone: this.phone,
      //   sms_text: this.sms_text,
      //   status: 'pending',
      // })
      //   .then(docRef => {
      //     console.log('Document written with ID: ', docRef.id)
      //   })
      //   .catch(error => {
      //     console.error('Error adding document: ', error)
      //   })
      //   .finally(() => {
      //     this.loading = false
      //   })

      // } catch (e) {
      //   console.error('Error adding document: ', e)
      // }

      // db.collection('messages')
      //   .add({
      //     phone: this.phone,
      //     sms_text: this.sms_text,
      //     status: 'pending',
      //   })
      //   .then(docRef => {
      //     console.log('Document written with ID: ', docRef.id)
      //   })
      //   .catch(error => {
      //     console.error('Error adding document: ', error)
      //   })
      //   .finally(() => {
      //     this.loading = false
      //   })
    },
  },
}
</script>
