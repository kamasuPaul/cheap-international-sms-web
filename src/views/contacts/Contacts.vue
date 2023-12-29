<template>
  <v-card class="mt-20">
    <!-- Table header with buttons -->
    <v-card-title>
      <v-row justify="space-between">
        <v-col cols="6">
          My contacts
        </v-col>
        <v-col cols="6" align="end">
          <v-btn value="center" color="primary mr-1"
            @click="(() => { importDialog = true; contact = {}; phoneNumber = '' })">
            <span class="hidden-sm-and-down">Import</span>

            <v-icon right>
              {{ icons.mdiAttachment }}
            </v-icon>
          </v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn class="secondary" v-on="on">
                New
                <v-icon right>
                  {{ icons.mdiArrowDownDropCircleOutline }}
                </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="(item, index) in items" :key="index" @click="handleItemClick(item)">
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-card-title>

    <!-- Contacts list table -->
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

    <!-- New contact dialog -->
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
          <v-btn plain @click="dialog = false">
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

    <!-- import contacts dialog -->
    <v-dialog v-model="importDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Import multiple contacts</span>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <label for="mobile">import</label>
                  <v-file-input v-model="file" hide-input label="Import Excel file" outlined dense @change="onFileChange">
                  </v-file-input>
                </v-col>
                <v-col v-if="selectable_columns.length > 0">
                  <v-row>
                    <v-col cols="6">
                      <label for="mobile">Column with telephone</label>
                      <v-select v-model="selectedPhoneColumn" :items="selectable_columns" label="phone number field" dense
                        outlined :disabled="!file"></v-select>
                    </v-col>
                    <v-col cols="6">
                      <label for="mobile">Column with names</label>
                      <v-select v-model="selectedNameColumn" :items="selectable_columns" label="Name field" dense outlined
                        :disabled="!file"></v-select>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-data-table :headers="importHeaders" :items="importContacts" :items-per-page="30" class="elevation-1">
                    <template v-slot:item.actions="{ item }">
                      <v-btn small icon @click="deleteContact(item)">
                        <v-icon>{{ icons.mdiDelete }}</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
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
          <v-btn plain @click="importDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" :loading="loading" :disabled="!importFormValid"
            @click="saveImportedContacts">
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- notification snack bar -->
    <v-snackbar v-model="snackbar" left>
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn color="primary" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Delete contact confirm dialog -->
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

    <!-- Add group dialog -->
    <v-dialog v-model="addGroupDialog" max-width="290">
      <v-card>
        <v-card-title>
          <span class="text-h6">Add new group</span>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="group.name" dense label="Group name"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <v-col cols="12">
            <v-data-table :headers="otherHeaders" :items="groups" :items-per-page="30" class="elevation-1">
              <template v-slot:item.actions="{ item }">
                <v-btn v-if="item.name != 'Default'" small icon @click="deleteGroup(item.group_id)">
                  <v-icon>{{ icons.mdiDelete }}</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn plain @click="addGroupDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" :loading="loading" :disabled="!group.name" @click="saveGroup">
            Add group
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add tag dialog -->
    <v-dialog v-model="addTagDialog" max-width="290">
      <v-card>
        <v-card-title>
          <span class="text-h6">Add new tag</span>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="tag.name" dense label="Tag name"></v-text-field>
                </v-col>
              </v-row>
              <v-col cols="12">
                <v-data-table :headers="otherHeaders" :items="tagss" :items-per-page="30" class="elevation-1">
                  <template v-slot:item.actions="{ item }">
                    <v-btn v-if="item.name != 'Default'" small icon @click="deleteTag(item.tag_id)">
                      <v-icon>{{ icons.mdiDelete }}</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-col>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn plain @click="addTagDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" :loading="loading" :disabled="!tag.name" @click="saveTag">
            Add Tag
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
import {
  mdiDelete,
  mdiPencil,
  mdiArrowDownDropCircleOutline,
  mdiAttachment,
} from '@mdi/js'
import {
  parsePhoneNumber,
} from 'libphonenumber-js'

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
        mdiArrowDownDropCircleOutline,
        mdiAttachment,
      },
      items: ['Add new contact', 'Add new group', 'Add new tag'],
      importHeaders: [
        {
          text: 'Phone',
          align: 'start',
          sortable: false,
          value: 'phone',
        },
        { text: 'Name', value: 'name' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      otherHeaders: [
        { text: 'Name', value: 'name' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    }
  },
  data() {
    return {
      message: '',
      snackbar: false,
      dialog: false,
      deleteDialog: false,
      importDialog: false,
      addGroupDialog: false,
      addTagDialog: false,
      loading: false,
      contacts: [],
      headers: [
        {
          text: 'Phone',
          align: 'start',
          sortable: true,
          value: 'phone',
        },
        { text: 'Name', value: 'name' },
        { text: 'Group', value: 'group_id' },
        { text: 'Tags', value: 'tags' },
        { text: 'Actions', value: 'actions', sortable: false },

      ],
      contact: {
        tags: [],
        group_id: 'default',
      },
      group: {
        name: null,
      },
      tag: {
        name: null,
      },
      phoneNumber: '',
      groups: [],
      tagss: [],
      tags: ['NewCustomer', 'VIPCustomer', 'PreferredCustomer', 'HighPriority', 'InactiveCustomer', 'Prospect', 'FrequentBuyer', 'SpecialOffer', 'ProductInterest', 'EventAttendee'],
      selectedContact: {},
      file: null,
      columnJson: {},
      selectable_columns: [],
      selectedNameColumn: null,
      selectedPhoneColumn: null,
      importContacts: [],
    }
  },
  computed: {
    formValid() {
      if (this.contact.phone && this.contact.name) {
        return true
      }

      return false
    },
    importFormValid() {
      if ((this.importContacts.length > 0) && this.contact.group_id) {
        return true
      }

      return false
    },
  },
  watch: {
    selectedPhoneColumn() {
      if (this.selectedPhoneColumn && this.selectedNameColumn) {
        this.processContacts()
      }
    },
    selectedNameColumn() {
      if (this.selectedPhoneColumn && this.selectedNameColumn) {
        this.processContacts()
      }
    },
  },
  mounted() {
    this.getContacts()
    this.getGroups()
    this.getTags()
  },
  methods: {
    handleItemClick(item) {
      if (item === 'Add new contact') {
        this.dialog = true; this.contact = {}; this.phoneNumber = ''
      }
      if (item === 'Add new group') {
        this.addGroupDialog = true
      }
      if (item === 'Add new tag') {
        this.addTagDialog = true
      }
    },
    processContacts() {
      this.importContacts = []

      // loop through columnJson
      for (let i = 0; i < this.columnJson.length; i += 1) {
        const columnValues = this.columnJson[i][this.selectedPhoneColumn]
        const nameValue = this.columnJson[i][this.selectedNameColumn]

        if (columnValues === undefined) {
          // eslint-disable-next-line no-continue
          continue
        }

        let phoneNumber = String(columnValues)
        phoneNumber = parsePhoneNumber(phoneNumber, 'UG')
        if (phoneNumber.isValid()) {
          // check if the number exists in the phones array
          // if (!this.phone_numbers.includes(phoneNumber.number)) {
          const contact = {
            phone: phoneNumber.number,
            name: nameValue,
          }
          this.importContacts.push(contact)

          // }
        }
      }
    },
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
        )
        this.loading = false
      })
    },
    getTags() {
      this.loading = true
      const userId = getAuth().currentUser.uid
      const collectionQuery = query(collection(db, 'tags'), where('user_id', '==', userId))
      onSnapshot(collectionQuery, querySnapshot => {
        this.tags = querySnapshot.docs.map(document => document.data().name)
        this.tagss = querySnapshot.docs.map(document => ({
          tag_id: document.id,
          ...document.data(),
          text: document.data().name,
          value: document.id,
        }))
        this.loading = false
      })
    },
    timeDiff(time) {
      return TimeDiff(time)
    },
    async onFileChange() {
      console.log('called')

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
          this.snackbar = true
        })
    },
    deleteGroup(id) {
      deleteDoc(doc(db, 'groups', id))
        .then(() => {
          this.message = 'Group successfully deleted'
        })
        .catch(error => {
          console.error('Error deleting group:', error)
          this.message = 'Error deleting group'
        })
        .finally(() => {
          this.snackbar = true
        })
    },
    deleteTag(id) {
      deleteDoc(doc(db, 'tags', id))
        .then(() => {
          this.message = 'Tag successfully deleted'
        })
        .catch(error => {
          console.error('Error deleting Tag:', error)
          this.message = 'Error deleting Tag'
        })
        .finally(() => {
          this.snackbar = true
        })
    },
    save() {
      this.loading = true
      addDoc(collection(db, 'contacts'), {
        phone: this.contact.phone,
        name: this.contact.name,
        tags: this.contact.tags ? this.contact.tags : [],
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
    saveImportedContacts() {
      this.loading = true
      const contacts = this.importContacts
      contacts.forEach(item => {
        const contact = {
          phone: item.phone,
          name: item.name,
          tags: this.contact.tags ? this.contact.tags : [],
          group_id: this.contact.group_id,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
          user_id: getAuth().currentUser.uid,
        }
        addDoc(collection(db, 'contacts'), contact)
      })
      this.importDialog = false
    },
    saveGroup() {
      this.loading = true
      addDoc(collection(db, 'groups'), {
        name: this.group.name,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        user_id: getAuth().currentUser.uid,
      })
        .then(() => {
          this.message = 'Group successfully added'

          // this.addGroupDialog = false
        })
        .catch(error => {
          console.error('Error adding group:', error)
          this.message = 'Error adding group'
        })
        .finally(() => {
          this.loading = false
          this.snackbar = true
          this.addGroupDialog = false
        })
    },
    saveTag() {
      this.loading = true
      addDoc(collection(db, 'tags'), {
        name: this.tag.name,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        user_id: getAuth().currentUser.uid,
      })
        .then(() => {
          this.message = 'Tag successfully added'
        })
        .catch(error => {
          console.error('Error adding tag:', error)
          this.message = 'Error adding tag'
        })
        .finally(() => {
          this.loading = false
          this.snackbar = true
          this.addTagDialog = false
        })
    },
    getGroupName(id) {
      if (id === 'default') {
        return 'Default'
      }
      const group = this.groups.find(obj => obj.group_id === id)
      if (group) {
        return group.name
      }

      return ''
    },
  },
}
</script>
