<!-- eslint-disable lines-around-comment -->
<template>
  <div>
    <v-card>
      <v-card-title>
        Send Sms <span class="primary--text"> #({{ deviceToken }}) </span>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12">
              <label for="mobile"> Add Phone numbers</label>
              <VuePhoneNumberInput
                v-model="phoneNumber"
                clearable
                :default-country-code="defaultCountryCode"
                @update="addPhoneNumber"
                @keyup.enter.prevent="clear"
              />
            </v-col>
            <v-col cols="3">
              <label for="mobile">import</label>
              <v-file-input
                v-model="file"
                hide-input
                label="Import Excel file"
                outlined
                dense
                @change="onFileChange"
              >
              </v-file-input>
            </v-col>
            <v-col v-if="file">
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
          </v-row>
          <v-row>
            <v-chip-group
              active-class="primary--text"
              column
            >
              <v-chip
                v-for="phone in phone_numbers"
                :key="phone"
                outlined
                close
                @click:close="removePhoneNumber(phone)"
              >
                {{ phone }}
              </v-chip>
            </v-chip-group>
            <v-col
              v-if="phone_numbers.length > 0"
              cols="2"
            >
              <v-btn
                small
                class="mt-5"
                color="primary"
                :disabled="!phone_numbers"
                @click="clear"
              >
                Clear all
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="columns">
            <v-chip-group
              active-class="primary--text"
              column
            >
              <v-chip
                v-for="column in columns"
                :key="column"
                small
                @click="insertColumn(column)"
              >
                {{ column }}
              </v-chip>
            </v-chip-group>
          </v-row>
          <v-row>
            <v-col cols="12">
              <label
                for="mobile"
              >Message <span class="text-caption font-weight-black">({{ charactersLeft }})</span></label>
              <v-textarea
                ref="textarea_sms_text"
                v-model="sms_text"
                name="input-7-1"
                filled
                label="Message"
                counter
                clearable
                auto-grow
                :rules="[v => (v || '').length <= 160 || 'SMS messages must be 160 characters or less']"
              ></v-textarea>
              <p v-if="sms_text && phones">
                Send "{{ sms_text }}" to <span class="primary--text">{{ phone_numbers.length }}</span> phone number(s)
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
                :disabled="!sms_text || !phone_numbers.length > 0"
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
      v-if="messages"
      class="mt-20"
    >
      <v-card-title>Messages</v-card-title>
      <v-data-table
        :headers="sms_headers"
        :items="messages"
        :items-per-page="5"
        class="elevation-1"
      >
        <template v-slot:item.sms_text="{ item }">
          <div
            class="text-truncate"
            style="max-width: 300px"
          >
            {{ item.sms_text }}
          </div>
        </template>
        <template v-slot:item.phone="{ item }">
          <div
            class="text-truncate"
            style="max-width: 300px"
          >
            {{ item.phone }}<br /><span
              v-if="item.carrier"
              class="primary--text text-caption"
            >{{
              item.carrier
            }}</span>
          </div>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip :color="getColor(item.status)">
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
    <v-card
      v-if="devices"
      class="mt-20"
    >
      <v-card-title>Devices</v-card-title>
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
          {{ item.token.substring(0, 8) }}
        </template>
        <template v-slot:item.last_active_at="{ item }">
          <h4>
            {{ new Date(item.last_active_at) }}<br /><span class="text-caption">{{
              timeDiff(item.last_active_at)
            }}</span>
          </h4>
        </template>
        <template v-slot:item.status="{ item }">
          <v-badge
            overlap
            dot
            :color="item.status == 'online' ? 'success' : 'error'"
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
  // eslint-disable-next-line no-unused-vars
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import TimeDiff from 'js-time-diff'
import {
  // eslint-disable-next-line no-unused-vars
  isValidPhoneNumber,
  parsePhoneNumber,
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
      messages: [],
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
      sms_headers: [
        {
          text: '#ID',
          align: 'start',
          sortable: false,
          value: 'message_id',
        },
        { text: 'To', value: 'phone' },
        { text: 'Message', value: 'sms_text', width: 300 },
        { text: 'Status', value: 'status' },
      ],
      file: null,
      columns: [],
      selectable_columns: [],
      selectedColumn: '',
      phoneNumber: '',
      columnJson: null,
      defaultCountryCode: 'UG',
      deviceToken: '',
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
        // loop through columnJson
        for (let i = 0; i < this.columnJson.length; i += 1) {
          const columnValues = this.columnJson[i][newColumn]

          if (columnValues === undefined) {
            // eslint-disable-next-line no-continue
            continue
          }

          let phoneNumber = String(columnValues)
          phoneNumber = parsePhoneNumber(phoneNumber, this.defaultCountryCode)
          if (phoneNumber.isValid()) {
            // check if the number exists in the phones array
            if (!this.phone_numbers.includes(phoneNumber.number)) {
              this.phone_numbers.push(phoneNumber.number)
            }
          }
        }
      }
    },
    deviceToken(newToken) {
      // update token in local storage
      localStorage.setItem('deviceToken', newToken)
    },
  },
  mounted() {
    this.getDevices()

    // generate 6 digit random string
    const token = Math.random()
      .toString(36)
      .substring(2, 8)

    this.deviceToken = localStorage.getItem('deviceToken')
    if (!this.deviceToken) {
      localStorage.setItem('deviceToken', token)
      this.deviceToken = token
    }

    this.getMessages()
  },
  methods: {
    insertColumn(column) {
      const textarea = this.$refs.textarea_sms_text.$refs.input
      const sentence = textarea.value
      const len = sentence.length
      let pos = textarea.selectionStart
      if (pos === undefined) {
        pos = 0
      }

      const before = sentence.substr(0, pos)
      const after = sentence.substr(pos, len)

      this.sms_text = `${before}<<${column}>>${after}`

      this.$nextTick().then(() => {
        textarea.selectionStart = pos + column.length
      })
    },
    removePhoneNumber(phoneNumber) {
      this.phone_numbers = this.phone_numbers.filter(number => number !== phoneNumber)
    },
    clear() {
      this.phone_numbers = []
      this.phones = []
    },
    getColor(status) {
      switch (status) {
        case 'Sent':
          return 'success'
        case 'Failed':
          return 'error'
        case 'Pending':
          return 'warning'
        case 'Delivered':
          return 'info'
        default:
          return 'warning'
      }
    },
    addPhoneNumber(value) {
      // if input is valid
      if (value.isValid) {
        // check if phone number already exists
        if (!this.phone_numbers.includes(value.formattedNumber)) {
          this.phone_numbers.push(value.formattedNumber)
          this.phoneNumber = ''
        }
      }
    },
    remove(item) {
      this.phone_numbers.splice(this.phone_numbers.indexOf(item), 1)
      this.phone_numbers = [...this.phone_numbers]
    },
    sendMessage() {
      this.loading = true
      this.phone_numbers.forEach(number => {
        let smsText = this.sms_text

        // get variable text in the message <<text>>
        // find blocks of text that start with << and end with >>
        const regex = /<<(.*?)>>/g
        const text = this.sms_text.match(regex)
        if (text) {
          text.forEach(item => {
            const column = item.replace('<<', '').replace('>>', '')
            const rows = this.columnJson
            const phoneColumn = this.selectedColumn
            const row = rows.find(

              // replace +256 with "" to get the phone number
              roww => {
                const tel = number.replace('+256', '')

                // eslint-disable-next-line eqeqeq
                return roww[phoneColumn] == tel
              },
            )
            const columnValue = row[column]
            if (columnValue) {
              smsText = smsText.replace(item, columnValue)
            }
          })
        }

        addDoc(collection(db, 'messages'), {
          phone: number,
          sms_text: smsText,
          status: 'pending',
          device_token: this.deviceToken,
          created_at: Timestamp.now(),
        }).finally(() => {
          this.loading = false
        })
      })
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
    getMessages() {
      this.loading = true
      const token = this.deviceToken
      const collectionQuery = query(collection(db, 'messages'), where('device_token', '==', token))
      onSnapshot(collectionQuery, querySnapshot => {
        this.messages = querySnapshot.docs.map(doc => ({
          message_id: doc.id,
          ...doc.data(),
        }))

        // sort the messages by created_at

        this.messages.sort((a, b) => b.created_at - a.created_at)

        this.loading = false
      })
    },
    timeDiff(time) {
      return TimeDiff(time)
    },
    async onFileChange() {
      // const { files } = e.target
      // if (!files.length) return

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
      this.columnJson = json
    },
  },
}
</script>
