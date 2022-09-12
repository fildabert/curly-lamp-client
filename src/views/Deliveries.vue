<template>
<!-- eslint-disable linebreak-style -->
<!-- eslint-disable max-len -->
  <v-data-table :search="search"
    :headers="headers"
    :items="desserts"
    :loading="$store.state.loading"
    :items-per-page="30"
    show-select
    v-model="selected"
    item-key="_id"
     class="elevation-1">
    <template v-slot:item.invoice="{ item }">
      <v-chip small :color="item.status === 'COMPLETED' ? 'green' : ''">{{ item.invoice }}</v-chip>
    </template>
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Deliveries</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-text-field
          v-model="DOFilter"
          prepend-icon="fas fa-search"
          label="DO Number"
          single-line
          hide-details
        ></v-text-field>
        <v-text-field
          v-model="PONoFilter"
          prepend-icon="fas fa-search"
          label="PO Number"
          single-line
          hide-details
        ></v-text-field>
        <v-text-field
          v-model="productFilter"
          prepend-icon="fas fa-search"
          label="Product"
          single-line
          hide-details
        ></v-text-field>
        <v-text-field
          v-model="customerFilter"
          prepend-icon="fas fa-search"
          label="Customer"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.invoice" :disabled="selected.length > 1" label="Delivery Order"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-dialog
                      ref="dialog"
                      v-model="modalDate"
                      :return-value.sync="editedItem.dateDelivered"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="editedItem.dateDelivered"
                          label="Date Delivered*"
                          prepend-icon="fas fa-calendar"
                          readonly
                          required
                          :rules="[v => !!v || 'Date Delivered is required']"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="editedItem.dateDelivered" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.dialog.save(editedItem.dateDelivered)"
                        >OK</v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>

                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.carNo" :disabled="selected.length > 1" label="Car No"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.actualAmount" :disabled="selected.length > 1" label="Actual amount"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.amount" disabled label="Amount"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.buyingPrice" label="Buying Price"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.sellingPrice" :disabled="!$store.state.user.admin" label="Selling Price"></v-text-field>
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
      <v-tooltip bottom v-if="item.type === 'BUYER'">
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="editItem(item)" :disabled="checkSelected">fas fa-edit</v-icon>
        </template>
          <span>Edit</span>
      </v-tooltip>

      <v-tooltip bottom v-if="item.type === 'BUYER'">
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="details(item)" :disabled="selected.length > 1">fas fa-ellipsis-h</v-icon>
        </template>
          <span>Details</span>
      </v-tooltip>

      <v-tooltip bottom v-if="item.type === 'BUYER'">
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="deleteItem(item)" :disabled="selected.length > 1">fas fa-trash</v-icon>
        </template>
          <span>Delete</span>
      </v-tooltip>

      <!-- <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="deleteItem(item)">fas fa-trash</v-icon>
        </template>
          <span>Delete</span>
      </v-tooltip> -->
    </template>
  </v-data-table>
</template>

<script>
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable linebreak-style */

import axios from 'axios';
import { checkLogin } from '../helpers/authorization';

export default {
  data: () => ({
    modalDate: false,
    search: '',
    baseUrl: '',
    dialog: false,
    desserts: [],
    editedIndex: -1,
    editedItem: {
      name: '',
      price: 0,
      stock: 0,
      unit: 0,
      category: 0,
    },
    action: '',
    DOFilter: '',
    productFilter: '',
    customerFilter: '',
    selected: [],
    PONoFilter: '',
  }),

  computed: {
    checkSelected() {
      const doMap = {};

      this.selected.forEach((DO) => {
        if (doMap[DO.customerName]) {
          doMap[DO.customerName] += 1;
        } else {
          doMap[DO.customerName] = 1;
        }
      });
      const selectedCustomerDOs = Object.keys(doMap).length;
      if (selectedCustomerDOs > 1) {
        return true;
      }
      return false;
    },
    headers() {
      return [
        {
          text: 'Delivery Order',
          align: 'left',
          sortable: false,
          value: 'invoice',
          filter: (value) => {
            if (!this.DOFilter) return true;
            return value.toString().toLowerCase().includes(this.DOFilter.toLowerCase());
          },
        },
        {
          text: 'PO',
          value: 'orderId.PONo',
          filter: (value) => {
            if (!this.PONoFilter) return true;
            return value.toString().toLowerCase().includes(this.PONoFilter.toLowerCase());
          },
        },
        {
          text: 'Product',
          value: 'productId.name',
          filter: (value) => {
            if (!this.productFilter) return true;
            return value.toString().toLowerCase().includes(this.productFilter.toLowerCase());
          },
        },
        {
          text: 'Name',
          value: 'customerName',
          filter: (value) => {
            if (!this.customerFilter) return true;
            return value.toString().toLowerCase().includes(this.customerFilter.toLowerCase());
          },
        },
        { text: 'Amount', value: 'amount', sortable: false },
        { text: 'Actual Amount', value: 'actualAmount', sortable: false },
        { text: 'Date Delivered', value: 'dateDelivered' },
        { text: 'Actions', value: 'action', sortable: false },
      ];
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    },
  },

  watch: {
    dialog(val) {
      // eslint-disable-next-line no-unused-expressions
      val || this.close();
    },
  },

  created() {
    document.title = this.$route.meta.title;
    this.baseUrl = this.$store.state.baseUrl;
    this.initialize();
  },

  methods: {
    details(item) {
      this.$router.push(`/delivery-order?id=${item._id}`);
    },
    auth(clearanceLvl) {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = checkLogin(token);
        if (userData) {
          if (userData.admin < clearanceLvl) {
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
        const { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/transactions/all`,
        });
        data.forEach((dessert, i) => {
          if (dessert.dateDelivered) {
            dessert.dateDelivered = new Date(dessert.dateDelivered).toISOString().split('T')[0];
          } else {
            console.log(dessert);
          }
        });
        this.desserts = data;
        this.editedItem = {};
      } catch (error) {
        console.log(error);
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
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = { ...item };
      // this.editedItem.dateDelivered = this.editedItem.dateDelivered.split('/').join('-');
      this.action = 'EDIT';
      this.dialog = true;
    },

    async deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = { ...item };
      // eslint-disable-next-line no-alert
      if (confirm('Are you sure you want to delete this Item?')) {
        try {
          this.auth();
          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/transactions/delete`,
            data: {
              trxId: this.editedItem._id,
              orderId: this.editedItem.orderId._id,
              user: this.$store.state.user._id,
            },
          });
          this.initialize();
        } catch (error) {
          console.log(error);
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
          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/transactions/`,
            data: {
              name: this.editedItem.name,
              price: this.editedItem.price,
              stock: this.editedItem.stock,
              unit: this.editedItem.unit,
              category: this.editedItem.category,
            },
          });
        } else if (this.action === 'EDIT') {
          if (this.selected.length > 1) {
            const { data } = await axios({
              method: 'PUT',
              url: `${this.baseUrl}/transactions/updateMany`,
              data: {
                trxIds: this.selected.map((DO) => DO._id),
                dateDelivered: this.editedItem.dateDelivered,
                buyingPrice: this.editedItem.buyingPrice,
                sellingPrice: this.editedItem.sellingPrice,
              },
            });
          } else {
            const { data } = await axios({
              method: 'PUT',
              url: `${this.baseUrl}/transactions/${this.editedItem._id}`,
              data: {
                ...this.editedItem,
                amount: +this.editedItem.amount,
                actualAmount: +this.editedItem.actualAmount,
                orderId: this.editedItem.orderId._id,
                productId: this.editedItem.productId._id,
              },
            });
          }
        }
        this.initialize();
      } catch (error) {
        console.log(error.response.data);
        this.$store.commit('SET_ERROR', error.response.data.message);
      } finally {
        this.close();
      }
    },
  },
};
</script>
