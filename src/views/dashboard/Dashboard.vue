<template>
  <div>
    <v-card>
      <v-card-title>Send Sms</v-card-title>
      <v-card-text>
        <v-form>
          <v-row>
            <v-chip-group
              active-class="primary--text"
              column
            >
              <v-chip
                v-for="column in columns"
                :key="column"
              >
                {{ column }}
              </v-chip>
            </v-chip-group>
          </v-row>
          <v-row>
            <v-col
              cols="6"
              col-sm="12"
            >
              <label for="mobile"> Add Phone numbers</label>
              <VuePhoneNumberInput
                v-model="phoneNumber"
                clearable
                :default-country-code="defaultCountryCode"
                @update="addPhoneNumber"
                @keyup.enter.prevent="clear"
              />
            </v-col>
            <v-col
              cols="2"
            >
              <label for="mobile">Bulk import</label>
              <v-file-input
                v-model="file"
                label="Import Excel file"
                outlined
                dense
                @change="onFileChange"
              ></v-file-input>
            </v-col>
            <v-col
              cols="2"
            >
              <label for="mobile">Column with telphone nos</label>
              <v-select
                v-model="selectedColumn"
                :items="selectable_columns"
                label="phone number field"
                dense
                outlined
                :disabled="!file"
              ></v-select>
            </v-col>
            <v-col
              cols="2"
            >
              <v-btn
                class="mt-5"
                color="primary"
                :disabled="!phone_numbers"
                @click="clear"
              >
                Clear
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-chip-group
              active-class="primary--text"
              column
            >
              <v-chip
                v-for="phone in phone_numbers"
                :key="phone"
              >
                {{ phone }}
              </v-chip>
            </v-chip-group>
          </v-row>
          <v-row>
            <v-col
              cols="12"
            >
              <label for="mobile">Message <span class="text-caption font-weight-black">({{charactersLeft}})</span></label>
              <v-textarea
                v-model="sms_text"
                name="input-7-1"
                filled
                label="Message"
                auto-grow
                :rules="[v => (v || '' ).length <= 160 || 'SMS messages must be 160 characters or less']"
              ></v-textarea>
              <p v-if="sms_text">
                Send {{ sms_text }}
              </p>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              class="d-flex flex-row-reverse"
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

    <v-card
      v-if="devices"
      class="mt-20"
    >
      <v-card-title>Available devices</v-card-title>
      <v-data-table
        :headers="headers"
        :items="devices"
        :items-per-page="5"
        class="elevation-1"
      >
        <template v-slot:item.networks="{ item }">
          <v-chip
            v-for="network in item.networks"
            :key="network.hnc"
            color="primary"
          >
            {{ network.name }}
          </v-chip>
        </template>
        <template v-slot:item.token="{ item }">
          {{ item.token.substring(0,8) }}
        </template>
        <template v-slot:item.last_active_at="{ item }">
          <h4>{{ new Date(item.last_active_at) }}<br><span class="text-caption">{{ timeDiff(item.last_active_at) }}</span></h4>
        </template>
        <template v-slot:item.status="{ item }">
          <v-badge
            overlap
            dot
            :color="item.status=='online'?'success':'error'"
          >
            <v-chip>
              {{ item.status }}
            </v-chip>
          </v-badge>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import VuePhoneNumberInput from 'vue-phone-number-input'
import 'vue-phone-number-input/dist/vue-phone-number-input.css'
import * as XLSX from 'xlsx'
import { initializeApp } from 'firebase/app'
import {
  getFirestore, addDoc, collection, onSnapshot,
} from 'firebase/firestore'
import TimeDiff from 'js-time-diff'
import {
  // eslint-disable-next-line no-unused-vars
  isValidPhoneNumber, parsePhoneNumber,
} from 'libphonenumber-js'

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
  components: {
    VuePhoneNumberInput,
  },
  data() {
    return {
      loading: false,
      sms_text: '',
      phone_numbers: [],
      phones: [],
      items: [],
      devices: [],
      headers: [
        {
          text: 'Device Token',
          align: 'start',
          sortable: false,
          value: 'token',
        },
        { text: 'Active status', value: 'status' },
        { text: 'Last Seen', value: 'last_active_at' },
        { text: 'Networks', value: 'networks' },
      ],
      file: null,
      columns: [],
      selectable_columns: [],
      selectedColumn: '',
      phoneNumber: '',
      columnJson: null,
      defaultCountryCode: 'UG',

    }
  },
  computed: {
    charactersLeft() {
      const char = this.sms_text.length
      const limit = 160

      return `${limit - char} / ${limit} characters left`
    },
  },
  watch: {
    selectedColumn(newColumn) {
      if (newColumn) {
        console.log('---------')

        // loop through columnJson
        for (let i = 0; i < this.columnJson.length; i += 1) {
          console.log(this.columnJson[i][newColumn])
          const columnValues = this.columnJson[i][newColumn]

          if (columnValues === undefined) {
            // eslint-disable-next-line no-continue
            continue
          }

          let phoneNumber = String(columnValues)
          console.log(typeof (phoneNumber))
          phoneNumber = parsePhoneNumber(phoneNumber, this.defaultCountryCode)
          if (phoneNumber.isValid()) {
            this.phone_numbers.push(phoneNumber.number)
          }
        }
      }
    },
  },
  mounted() {
    this.getDevices()
  },
  methods: {
    clear() {
      this.phone_numbers = []
      this.phones = []
    },
    addPhoneNumber(value) {
      // console.log(value)

      // if input is valid
      if (value.isValid) {
        this.phone_numbers.push(value.formattedNumber)
        this.phones.push(value.formattedNumber)
        this.phoneNumber = ''
      }
    },
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
    getDevices() {
      this.loading = true
      onSnapshot(collection(db, 'users'), querySnapshot => {
        this.devices = querySnapshot.docs.map(doc => ({
          token: doc.id,
          ...doc.data(),

        }))
        this.loading = false
      })
    },
    timeDiff(time) {
      return TimeDiff(time)
    },
    async onFileChange(e) {
      // const { files } = e.target
      // if (!files.length) return

      console.log(e)
      const data = await this.file.arrayBuffer()

      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]

      // print column names
      const colNames = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0]
      this.columns = Object.values(colNames)

      // loop through the columns and add them to the selectable columns
      this.selectable_columns = this.columns.map(col => ({
        text: col,
        value: col,
      }))
      const json = XLSX.utils.sheet_to_json(sheet)
      console.log(json)
      this.columnJson = json
    },
  },
}
</script>