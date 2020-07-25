<template>
<!-- eslint-disable linebreak-style -->
<!-- eslint-disable max-len -->
  <v-data-table :headers="headers" :items="cashFlows" :loading="$store.state.loading" sort-by="calories" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Balance: {{ balance.toLocaleString() }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on" @click="clickNewItem">New Cash Flow</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>

                  <v-col cols="12">
                        <v-autocomplete
                          label="Customer*"
                          :items="customerNameList"
                          v-model="editedItem.customerInput"
                          type="text"
                          autocomplete="nope"
                          required
                          :disabled="action !== 'NEW'"
                          :rules="[v => !!v || 'Customer is required']"
                        ></v-autocomplete>
                      </v-col>

                  <v-col cols="12" sm="12" md="12">
                    <v-text-field v-model="editedItem.amount" :disabled="action !== 'NEW'" label="Amount"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                        <v-dialog
                          ref="dialog2"
                          v-model="modalDate"
                          :return-value.sync="editedItem.dateIssued"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="editedItem.dateIssued"
                              label="Date Issued*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              required
                              :rules="[v => !!v || 'Date Issued is required']"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="editedItem.dateIssued" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog2.save(editedItem.dateIssued)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save" :loading="$store.state.loading" :disabled="$store.state.loading">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.action="{ item }">

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="editItem(item)">fas fa-edit</v-icon>
        </template>
          <span>Edit</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="deleteItem(item)">fas fa-trash</v-icon>
        </template>
          <span>Delete</span>
      </v-tooltip>
    </template>

    <template v-slot:item.amount="{ item, header, value }">
      <span>{{ item.amount.toLocaleString() }}</span>
    </template>

    <template v-slot:item.customer.type="{ item, header, value }">
      <v-chip small>{{ item.customer.type === 'BUYER' ? 'IN' : 'OUT' }}</v-chip>
    </template>

    <template v-slot:item.invoices="{ item, header, value }">
      <v-chip small v-for="invoice in item.invoices" :key="invoice._id">{{ invoice.name }}</v-chip>
    </template>
  </v-data-table>
</template>

<script>
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable linebreak-style */
/* eslint-disable no-var */

import axios from 'axios';
import { checkLogin } from '../helpers/authorization';

export default {
  data: () => ({
    baseUrl: '',
    dialog: false,
    headers: [
      { text: 'Amount', value: 'amount' },
      { text: 'Name', value: 'customer.name' },
      { text: 'In/Out', value: 'customer.type' },
      { text: 'Date Issued', value: 'dateIssued' },
      { text: 'Invoices', value: 'invoices' },
      {
        text: 'Actions', value: 'action', sortable: false, align: 'right',
      },
    ],
    balance: 0,
    cashFlows: [],
    customerNameList: [],
    customerList: [],
    editedIndex: -1,
    editedItem: {
      name: '',
      price: 0,
      stock: 0,
      unit: 0,
      category: 0,
    },
    action: '',
    modalDate: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Cash Flow' : 'Edit Date';
    },
  },

  watch: {
    dialog(val) {
      // eslint-disable-next-line no-unused-expressions
      val || this.close();
    },
    // $route: {
    //   immediate: true,
    //   handler(to, from) {
    //     if ((from.name === 'PurchaseOrderSupplier' && to.name === 'Details') || (from.name === 'Details' && to.name === 'PurchaseOrderSupplier')) {
    //       this.$emit('destroypls', false);
    //     } else {
    //       this.$emit('destroypls', true);
    //     }
    //   },
    // },
  },

  created() {
    this.baseUrl = this.$store.state.baseUrl;
    this.initialize();
  },

  methods: {
    auth() {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = checkLogin(token);
        if (userData) {
          if (!userData.admin) {
            throw { response: { data: { message: 'Unauthorized' } } };
          }
        } else {
          this.$store.commit('SET_LOGIN', { isLogin: false, user: {} });
        }
      }
    },
    async initialize() {
      try {
        this.$store.commit('SET_LOADING', true);
        var { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/cashflows/all`,
        });

        data.forEach((cash) => {
          if (cash.dateIssued) {
            cash.dateIssued = new Date(cash.dateIssued).toISOString().split('T')[0];
          }
          cash.customerInput = `${cash.customer.name}(${cash.customer.type})`;
        });
        this.cashFlows = data;

        if (this.customerList.length === 0) {
          var { data } = await axios({
            method: 'GET',
            url: `${this.baseUrl}/customers/all/all`,
          });

          this.customerList = data;

          this.customerList.forEach((customer) => {
            this.customerNameList.push(`${customer.name}(${customer.type})`);
          });
        }

        var { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/cashflows/balance`,
        });

        this.balance = data.amount;

        this.editedItem = {};
      } catch (error) {
        this.$store.commit('SET_ERROR', error.response.data.message);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },

    clickNewItem() {
      this.editedIndex = -1;
      this.editedItem = {};
      this.action = 'NEW';
    },

    editItem(item) {
      this.editedIndex = this.cashFlows.indexOf(item);
      this.editedItem = { ...item };
      this.action = 'EDIT';
      this.dialog = true;
    },

    async deleteItem(item) {
      this.editedIndex = this.cashFlows.indexOf(item);
      this.editedItem = { ...item };
      // eslint-disable-next-line no-alert
      if (confirm('Do u really wanna do this?')) {
        try {
          this.auth();

          const { data } = await axios({
            method: 'DELETE',
            url: `${this.baseUrl}/cashflows/${this.editedItem._id}`,
          });
          await this.initialize();
        } catch (error) {
          this.$store.commit('SET_ERROR', error.response.data.message);
        }
      }
    },

    close() {
      this.dialog = false;
    },

    async save() {
      try {
        this.auth();
        this.$store.commit('SET_LOADING', true);

        if (this.action === 'NEW') {
          const customerIndex = this.customerList.findIndex((customer) => customer.name === this.editedItem.customerInput.replace(/\((.*?)\)/, ''));
          const selectedCustomer = this.customerList[customerIndex];

          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/cashflows/create`,
            data: {
              customerId: selectedCustomer._id,
              user: this.$store.state.user._id,
              amount: Number(this.editedItem.amount),
              dateIssued: this.editedItem.dateIssued,
            },
          });
        } else if (this.action === 'EDIT') {
          const { data } = await axios({
            method: 'PUT',
            url: `${this.baseUrl}/cashflows/${this.editedItem._id}`,
            data: {
              dateIssued: this.editedItem.dateIssued,
            },
          });
        }
        await this.initialize();
      } catch (error) {
        console.log(error.response.data);
        this.$store.commit('SET_ERROR', error.response.data.message);
      } finally {
        this.$store.commit('SET_LOADING', false);
        this.close();
      }
    },
  },
};
</script>
