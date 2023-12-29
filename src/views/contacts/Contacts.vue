<template>
  <v-card class="mt-20">
    <v-card-title>
      <v-row justify="space-between">
        <v-col cols="6">My contacts</v-col>
        <v-col cols="6" align="end">
          <v-btn color="primary" dark class="mb-2" @click="(() => { dialog = true; contact = {}; phoneNumber = '' })">
            New Contact
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-data-table :headers="headers" :items="contacts" :items-per-page="30" class="elevation-1">
      <template v-slot:item.group_id="{ item }">
        {{ getGroupName(item.group_id) }}
      </template>
      <template v-slot:item.tags="{ item }">
        <v-chip-group v-model="contact.tags" multiple column>
          <v-chip v-for="tag in item.tags" :key="tag" :value="tag">
            {{ tag }}
          </v-chip>
        </v-chip-group>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small @click="editContact(item)">
          <v-icon>{{ icons.mdiPencil }}</v-icon>
        </v-btn>
        <v-btn small icon @click="deleteContact(item)">
          <v-icon>{{ icons.mdiDelete }}</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Add new contact</span>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <VuePhoneNumberInput v-model="phoneNumber" clearable default-country-code="UG"
                    @keyup.enter.prevent="clear" @update="addPhoneNumber" />
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="contact.name" dense label="Name"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="contact.group_id" dense :items="groups" label="Group"></v-select>
                </v-col>

                <v-col cols="12">
                  <span class="subheading">Tags</span>
                  <v-chip-group v-model="contact.tags" multiple column active-class="primary--text">
                    <v-chip v-for="tag in tags" :key="tag" :value="tag">
                      {{ tag }}
                    </v-chip>
                  </v-chip-group>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn plain @click="close">
            Cancel
          </v-btn>
          <v-btn v-if="contact.contact_id" color="primary" variant="text" :loading="loading" :disabled="!formValid"
            @click="update">
            Update
          </v-btn>
          <v-btn v-else color="primary" variant="text" :loading="loading" :disabled="!formValid" @click="save">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" left>
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn color="primary" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-dialog v-model="deleteDialog" max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          Delete this contact?
        </v-card-title>

        <v-card-text>
          This action will delete this contact and cannot be reversed.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="deleteDialog = false">
            Cancel
          </v-btn>

          <v-btn color="error" :loading="loading" text @click="deleteContactConfirm">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import VuePhoneNumberInput from 'vue-phone-number-input'
import 'vue-phone-number-input/dist/vue-phone-number-input.css'
import * as XLSX from 'xlsx'
import { getApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import TimeDiff from 'js-time-diff'
// eslint-disable-next-line object-curly-newline
import {
  mdiDelete,
  mdiPencil,
} from '@mdi/js'

const app = getApp()
const db = getFirestore(app)
export default {
  components: {
    VuePhoneNumberInput,
  },
  setup() {
    return {
      icons: {
        mdiPencil,
        mdiDelete,
      },
    }
  },
  data() {
    return {
      message: '',
      snackbar: false,
      dialog: false,
      deleteDialog: false,
      loading: false,
      contacts: [],
      headers: [
        {
          text: 'Phone',
          align: 'start',
          sortable: false,
          value: 'phone',
        },
        { text: 'Name', value: 'name' },
        { text: 'Group', value: 'group_id' },
        { text: 'Tags', value: 'tags' },
        { text: 'Actions', value: 'actions', sortable: false },

      ],
      contact: {
      },
      phoneNumber: '',
      groups: [{ text: 'Default', value: 'default' }],
      tags: ['NewCustomer', 'VIPCustomer', 'PreferredCustomer', 'HighPriority', 'InactiveCustomer', 'Prospect', 'FrequentBuyer', 'SpecialOffer', 'ProductInterest', 'EventAttendee'],
      selectedContact: {},
    }
  },
  computed: {
    formValid() {
      if (this.contact.phone && this.contact.name) {
        return true
      }

      return false
    },
  },
  mounted() {
    this.getContacts()
  },
  methods: {
    addPhoneNumber(value) {
      // if input is valid
      if (value.isValid) {
        this.contact.phone = value.formattedNumber
      }
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
    editContact(item) {
      this.contact = JSON.parse(JSON.stringify(item))
      this.phoneNumber = item.phone
      this.dialog = true
    },

    deleteContact(item) {
      this.selectedContact = item
      this.deleteDialog = true
    },

    deleteContactConfirm() {
      deleteDoc(doc(db, 'contacts', this.selectedContact.contact_id))
        .then(() => {
          this.message = 'Contact successfully deleted'
          this.deleteDialog = false
        })
        .catch(error => {
          console.error('Error deleting contact:', error)
          this.message = 'Error deleting contact'
        })
        .finally(() => {
          this.loading = false
        })
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem }
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem }
        this.editedIndex = -1
      })
    },

    save() {
      this.loading = true
      addDoc(collection(db, 'contacts'), {
        phone: this.contact.phone,
        name: this.contact.name,
        tags: this.contact.tags,
        group_id: this.contact.group_id,
        created_at: Timestamp.now(),
        user_id: getAuth().currentUser.uid,
      })
        .then(() => {
          this.message = 'Contact successfully added'
          this.dialog = false
        })
        .catch(error => {
          console.error('Error adding contacts:', error)
          this.message = 'Error adding contacts'
        })
        .finally(() => {
          this.loading = false
          this.snackbar = true
        })
    },
    update() {
      this.loading = true
      const contactRef = doc(db, 'contacts', this.contact.contact_id)
      updateDoc(contactRef, {
        phone: this.contact.phone,
        name: this.contact.name,
        tags: this.contact.tags,
        group_id: this.contact.group_id,
        updated_at: Timestamp.now(),
        user_id: getAuth().currentUser.uid,
      }, { merge: true })
        .then(() => {
          this.message = 'Contact updated successfully'
          this.dialog = false
        })
        .catch(error => {
          console.error('Error updated contacts:', error)
          this.message = 'Error adding contacts'
        })
        .finally(() => {
          this.loading = false
          this.snackbar = true
        })
    },
    getGroupName(id) {
      if (id === 'default') {
        return 'Default'
      }

      return ''
    },
  },
}
</script>
