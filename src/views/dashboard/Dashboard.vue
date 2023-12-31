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
            <v-col cols="4">
              <label for="mobile"> Add Phone numbers</label>
              <VuePhoneNumberInput
                v-model="phoneNumber"
                clearable
                :default-country-code="defaultCountryCode"
                @update="addPhoneNumber"
                @keyup.enter.prevent="clear"
              />
            </v-col>
            <v-col cols="4">
              <label for="mobile"> Use saved contacts</label>

              <v-select
                v-model="selectedGroupId"
                dense
                :items="groups"
                label="Select contacts group"
                outlined
              ></v-select>
            </v-col>
            <v-col cols="4">
              <label for="mobile">Import phone numbers</label>
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
            <v-col
              v-if="file"
              cols="3"
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
              <label for="mobile">Message <span class="text-caption font-weight-black">({{ charactersLeft
              }})</span></label>
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
              <v-alert
                v-if="message"
                dense
                outlined
                type="error"
              >
                {{ message }}
              </v-alert>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              class="d-flex flex-row-reverse"
            >
              <v-btn
                class="mx-2"
                color="primary"
                :disabled="!formValid"
                :loading="loading"
                @click="sendMessage"
              >
                Send
              </v-btn>
              <v-btn
                v-if="false"
                color="primary"
                :disabled="!sms_text || !phone_numbers.length > 0"
                :loading="loading"
                @click="selectDeviceDialog = true"
              >
                Send via
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
      v-if="false"
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
    <v-dialog
      v-model="selectDeviceDialog"
      scrollable
      max-width="300px"
    >
      <v-card>
        <v-card-title>Select device</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 300px;">
          <v-radio-group
            v-model="selectedDeviceToken"
            column
          >
            <v-radio
              v-for="device in devices"
              :key="device.token"
              :label="getDeviceLabel(device)"
              :value="device.token"
            ></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            text
            @click="selectDeviceDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="sendMessage"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VuePhoneNumberInput from 'vue-phone-number-input'
import 'vue-phone-number-input/dist/vue-phone-number-input.css'
import * as XLSX from 'xlsx'
import { getApp } from 'firebase/app'
// eslint-disable-next-line no-unused-vars
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import {
  // eslint-disable-next-line no-unused-vars
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  query,
  doc,
  where,
  Timestamp,
} from 'firebase/firestore'
import {
  getDatabase, ref, onValue, orderByChild,
} from 'firebase/database'

import TimeDiff from 'js-time-diff'
import {
  // eslint-disable-next-line no-unused-vars
  isValidPhoneNumber,
  parsePhoneNumber,
} from 'libphonenumber-js'

// Initialize Firebase
const app = getApp()

// firebase.initializeApp(firebaseConfig)
// const db = firebase.firestore()
const db = getFirestore(app)
const realtimeDb = getDatabase(app)
const auth = getAuth(app)

// const analytics = getAnalytics(app)
export default {
  components: {
    VuePhoneNumberInput,
  },
  data() {
    return {
      message: '',
      walletBalance: 0,
      otpCode: '000000',
      signPhone: '+256750883001',
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
      selectDeviceDialog: false,
      selectedDeviceToken: '',
      contacts: [],
      groups: [],
      selectedGroupId: '',
    }
  },
  computed: {
    charactersLeft() {
      const char = this.sms_text.length
      const limit = 160

      return `${limit - char} / ${limit} characters left`
    },
    selectedContacts() {
      const groupId = this.selectedGroupId
      const { contacts } = this
      if (groupId === 'all') {
        return contacts
      }
      const filteredData = contacts.filter(obj => obj.group_id === groupId)

      return filteredData
    },
    totalSmsCost() {
      return this.phone_numbers.length * 30
    },
    formValid() {
      if (this.sms_text
      && this.sms_text.length > 0
      && this.phone_numbers.length > 0
      ) {
        return true
      }

      return false
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
    selectedContacts(newContacts) {
      this.phone_numbers = newContacts.map(obj => obj.phone)
    },
  },
  mounted() {
    this.getGroups()
    this.getContacts()
    this.getDevices()
    this.getWalletInfo()

    // generate 6 digit random string
    const token = Math.random()
      .toString(36)
      .substring(2, 8)

    this.deviceToken = localStorage.getItem('deviceToken')
    if (!this.deviceToken) {
      localStorage.setItem('deviceToken', token)
      this.deviceToken = token
    }

    // window.recaptchaVerifier = new RecaptchaVerifier('recapther', {}, auth)

    this.getMessages()
  },
  methods: {
    async getWalletInfo() {
      const { currentUser } = auth
      onSnapshot(doc(db, 'users', currentUser.uid), document => {
        if (document && document.exists()) {
          const { balance } = document.data()
          this.walletBalance = balance.toLocaleString()
        }
      })
    },
    getDeviceLabel(device) {
      // loop through device networks, create a coma seperated list of network names
      let networks = ''
      for (let i = 0; i < device.networks.length; i += 1) {
        networks += `${device.networks[i].name}, `
      }

      return `${`${(device.token).substring(0, 8)} -`}${networks} - ${device.status}`
    },
    signIn() {
      console.log('signing in')
      const phoneNumber = parsePhoneNumber(this.signPhone, this.defaultCountryCode).formatInternational()
      const appVerifier = window.recaptchaVerifier
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then(confirmationResult => {
          console.log('code sent')

          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          window.confirmationResult = confirmationResult

          // ...
        }).catch(error => {
          console.log(error)

          // Error; SMS not sent
          // ...
        })
    },
    async confirmOtpCode() {
      const code = this.otpCode
      window.confirmationResult.confirm(code).then(result => {
        // User signed in successfully.
        console.log(result)

        // get user id
        this.deviceToken = result.user.uid

        result.user.getIdToken().then(token => {
          console.log(token)

          // hit the api to register the user
          this.registerUser(token)
        })
      }).catch(error => {
        console.log('error1')
        console.log(error)

        // User couldn't sign in (bad verification code?)
        // ...
      })
    },
    registerUser(token) {
      const baseUrl = 'https://7fea-41-210-159-173.ngrok.io/api'

      // set bearer token
      this.$http.defaults.headers.common.Authorization = `Bearer ${token}`
      this.axios.post(`${baseUrl}/users`).then(response => {
        console.log(response)
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },
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
      // check if the total number of messages exceeds the wallet balance
      this.message = ''
      if (this.totalSmsCost > this.walletBalance) {
        this.message = 'Total cost of sms exceedes wallet balance'

        return
      }
      const numItems = this.phone_numbers.length
      let i = 0
      this.selectDeviceDialog = false
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
        const userId = getAuth().currentUser.uid

        addDoc(collection(db, 'messages'), {
          phone: number,
          sms_text: smsText,
          status: 'pending',
          device_token: this.deviceToken,
          created_at: Timestamp.now(),
          send_via: this.selectedDeviceToken,
          user_id: userId,
        }).finally(() => {
          // eslint-disable-next-line no-plusplus
          if (++i === numItems) {
            this.loading = false
            this.selectedDeviceToken = ''
            this.sms_text = ''
          }
        })
      })
    },
    getDevices() {
      this.loading = true
      const devicesRef = query(ref(realtimeDb, 'users/'), orderByChild('status'))
      onValue(devicesRef, snapshot => {
        // eslint-disable-next-line no-unused-vars
        const deviceList = []
        snapshot.forEach(document => {
          deviceList.push({
            token: document.key,
            ...document.val(),
          })
        })

        // reverse the device list
        deviceList.reverse()
        this.devices = [...new Set(deviceList)]

        this.loading = false
      })

      // onSnapshot(collection(db, 'users'), querySnapshot => {
      //   this.devices = querySnapshot.docs.map(doc => ({
      //     token: doc.id,
      //     ...doc.data(),
      //   }))
      //   this.loading = false
      // })
    },
    getMessages() {
      this.loading = true

      // const token = this.deviceToken

      const userId = getAuth().currentUser.uid

      const collectionQuery = query(collection(db, 'messages'), where('user_id', '==', userId))
      onSnapshot(collectionQuery, querySnapshot => {
        this.messages = querySnapshot.docs.map(document => ({
          message_id: document.id,
          ...document.data(),
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
    getGroups() {
      this.loading = true
      const userId = getAuth().currentUser.uid
      const collectionQuery = query(collection(db, 'groups'), where('user_id', '==', userId))
      onSnapshot(collectionQuery, querySnapshot => {
        this.groups = querySnapshot.docs.map(document => ({
          group_id: document.id,
          ...document.data(),
          text: document.data().name,
          value: document.id,
        }))

        // sort the groups by created_at

        this.groups.sort((a, b) => b.created_at - a.created_at)
        this.groups.push(
          {
            text: 'Default', name: 'Default', value: 'default', created_at: Timestamp.now(),
          },
          {
            text: 'All contacts', name: 'All contacts', value: 'all', created_at: Timestamp.now(),
          },
        )
        this.loading = false
      })
    },
    getContacts() {
      this.loading = true
      const userId = getAuth().currentUser.uid
      const collectionQuery = query(collection(db, 'contacts'), where('user_id', '==', userId))
      onSnapshot(collectionQuery, querySnapshot => {
        this.contacts = querySnapshot.docs.map(document => ({
          contact_id: document.id,
          ...document.data(),
        }))

        // sort the messages by created_at

        this.contacts.sort((a, b) => b.created_at - a.created_at)

        this.loading = false
      })
    },
  },
}
</script>
