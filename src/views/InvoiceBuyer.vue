<template>
<!-- eslint-disable linebreak-style -->
<!-- eslint-disable max-len -->
  <v-data-table :headers="headers" :search="search" :items="invoices" :loading="$store.state.loading" sort-by="calories" class="elevation-1"
  item-key="_id"
    single-expand
    show-expand
    :items-per-page="30"
    @item-expanded="expandInvoice"
    :expanded.sync="expanded">
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Invoice (Receivable)</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-text-field
          v-model="search"
          prepend-icon="fas fa-search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="700px">
          <v-card>
            <v-card-title>
              <span class="headline"> Edit Invoice </span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="8" sm="8" md="8">
                    <v-text-field v-model="editedItem.name" label="Invoice No" aria-required :rules="[v => !!v || 'Invoice No is required']"></v-text-field>
                  </v-col>

                  <v-col cols="4" sm="4">
                        <v-dialog
                          ref="dialog"
                          v-model="modalDate"
                          :return-value.sync="editedItem.dueDate"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="editedItem.dueDate"
                              label="Due Date*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              required
                              :disabled="$store.state.user.admin < 3"
                              :rules="[v => !!v || 'Due Date is required']"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="editedItem.dueDate" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog.save(editedItem.dueDate)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>

                  <template v-for="(invoiceInfo, index) in editedItem.invoiceInfos">
                    <v-col cols="3" sm="3" md="3" :key="invoiceInfo._id">
                      <v-text-field v-model="editedItem.invoiceInfos[index].product.name" label="Product" aria-required disabled></v-text-field>
                    </v-col>
                    <v-col cols="3" sm="3" md="3">
                      <v-text-field v-model="editedItem.invoiceInfos[index].totalQuantity" label="Quantity" aria-required :disabled="$store.state.user.admin < 2"></v-text-field>
                    </v-col>
                    <v-col cols="3" sm="3" md="3">
                     <v-text-field v-model="editedItem.invoiceInfos[index].price" label="Price" aria-required :disabled="$store.state.user.admin < 3"></v-text-field>
                    </v-col>
                    <v-col cols="3" sm="3" md="3">
                     <v-text-field :value="editedItem.invoiceInfos[index].totalQuantity * editedItem.invoiceInfos[index].price" label="Total Amount" aria-required disabled></v-text-field>
                    </v-col>
                  </template>

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

    <!-- <template v-slot:item.customer.name="{ item }">
      <v-chip small :color="item.status === 'COMPLETED' ? 'green' : ''">{{ item.PONo }}</v-chip>
    </template> -->

    <template v-slot:item.totalAmount="{ item, header, value }">
      <span>{{ item.totalAmount.toLocaleString() }}</span>
    </template>

    <template v-slot:item.amountPaid="{ item, header, value }">
      <v-chip small :color="item.paid ? 'green' : item.alert ? 'red' : 'yellow'">{{ item.amountPaid.toLocaleString() }}</v-chip>
    </template>

    <template v-slot:item.quantity="{ item, header, value }">
      <span>{{ item.quantity.toLocaleString() }}</span>
    </template>

    <template v-slot:item.name="{ item, header, value }" >
      <v-chip small :color="item.duplicate ? 'pink lighten-2' : '' ">{{ item.name }}</v-chip>
    </template>

    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <v-list subheader dense>
          <v-subheader>PO: <v-chip small v-for="PO in item.purchaseOrder" :key="PO._id">{{ PO.PONo }}</v-chip></v-subheader>
          <v-subheader>Delivery Orders </v-subheader>
          <v-list-item-group>
            <v-list-item v-for="t in item.transactions.slice((page-1) * 30, ((page-1) + 1) * 30)" :key="t._id" selectable>
              <v-list-item-content>
                <v-list-item-title>
                <v-row dense no-gutters>
                  <v-col cols="auto" class="mr-auto" @click="$router.push(`/delivery-order?id=${t._id}`)">
                      D.O:
                    <v-chip small>{{ t.invoice }}</v-chip> <span v-if="t.productId">[{{ t.productId.name }}]</span> <v-chip small> {{ t.actualAmount || t.amount }} </v-chip>
                    <span v-if="t.productId">{{ t.productId.unit }}</span>  delivered at
                    <v-chip small v-if="t.dateDelivered">{{ new Date(t.dateDelivered).toISOString().split('T')[0] }}</v-chip>
                    - status:
                    <v-chip small :color="t.status === 'COMPLETED' ? 'green' : 'orange lighten-1'">
                    {{ t.status }}
                    </v-chip>
                    <v-tooltip v-if="transactionMap[t._id] ? transactionMap[t._id].length > 1 : false" bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon small color="orange" v-on="on">fas fa-exclamation-triangle</v-icon>
                      </template>
                      <span>{{ transactionMap[t._id].length }} duplicates found in {{ JSON.stringify(transactionMap[t._id].map((trx) => trx.name)) }}</span>
                   </v-tooltip>

                  </v-col>

                  <v-col cols="auto">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon small class="mr-2" v-on="on" @click="takeOutDeliveryOrder(item, t)">fas fa-minus</v-icon>
                      </template>
                      <span>Remove</span>
                   </v-tooltip>
                  </v-col>

                </v-row>

                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-pagination
          v-if="item.transactions.length > 30"
          v-model="page"
          @click="() => console.log(page)"
          :length="Math.ceil(item.transactions.length/30)"
          ></v-pagination>
        </v-list>
      </td>
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
  name: 'InvoiceBuyer',
  data: () => ({
    baseUrl: '',
    search: '',
    dialog: false,
    modalDate: false,
    headers: [
      { text: 'Buyer', value: 'customer.name' },
      { text: 'Invoice No', value: 'name' },
      // { text: 'Purchase Order', value: 'purchaseOrder' },
      { text: 'Date Range', value: 'dateRange' },
      { text: 'Quantity', value: 'quantity', width: '100' },
      { text: 'Total Amount', value: 'totalAmount', width: '130' },
      { text: 'Due Date', value: 'dueDate', width: '130' },
      { text: 'Amount Paid', value: 'amountPaid' },
      {
        text: 'Actions', value: 'action', sortable: false, align: 'right',
      },
    ],
    invoices: [],
    expanded: [],
    editedIndex: -1,
    editedItem: {
      name: '',
      price: 0,
      stock: 0,
      unit: 0,
      category: 0,
    },
    action: '',
    page: 1,
    transactionMap: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Customer' : 'Edit Customer';
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
    document.title = this.$route.meta.title;
    this.baseUrl = this.$store.state.baseUrl;
    this.initialize();
  },

  methods: {
    async expandInvoice({ item, value }) {
      console.log(item, value, 'halo');
      const selectedIndex = this.invoices.findIndex((inv) => inv._id === item._id);
      if (value) {
        try {
          this.$store.commit('SET_LOADING', true);
          const { data } = await axios({
            method: 'GET',
            url: `${this.baseUrl}/invoices/${item._id}`,
          });

          const diffTime = new Date(data.dueDate) - new Date();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          data.alert = false;
          if (diffDays <= 0) {
            data.alert = true;
          }

          data.duplicate = false;
          data.transactions.forEach((trx) => {
            if (this.transactionMap[trx._id].length > 1) {
              data.duplicate = true;
            }
          });

          const expandedInvoice = data;

          expandedInvoice.dueDate = new Date(expandedInvoice.dueDate).toISOString().split('T')[0];
          expandedInvoice.dateRange = `${new Date(expandedInvoice.startDate).toISOString().split('T')[0]} -> ${new Date(expandedInvoice.endDate).toISOString().split('T')[0]}`;

          this.invoices.splice(selectedIndex, 1, expandedInvoice);
        } catch (error) {
          this.$store.commit(
            'SET_ERROR',
            error.response.data.message || error.response.data,
          );
        } finally {
          this.$store.commit('SET_LOADING', false);
        }
      }
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
    async initialize(needUpdateExpandedInvoice) {
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/invoices/all/buyer`,
        });
        this.transactionMap = {};
        data.forEach((invoice) => {
          const diffTime = new Date(invoice.dueDate) - new Date();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          invoice.alert = false;
          if (diffDays <= 0) {
            invoice.alert = true;
          }
          invoice.dueDate = new Date(invoice.dueDate).toISOString().split('T')[0];
          invoice.dateRange = `${new Date(invoice.startDate).toISOString().split('T')[0]} -> ${new Date(invoice.endDate).toISOString().split('T')[0]}`;
          invoice.transactions.forEach((transaction) => {
            if (!this.transactionMap[transaction]) {
              this.transactionMap[transaction] = [invoice];
            } else {
              this.transactionMap[transaction].push(invoice);

              this.transactionMap[transaction].forEach((inv) => {
                inv.duplicate = true;
              });
            }
          });
        });

        this.invoices = data;
        if (needUpdateExpandedInvoice) {
          await this.expandInvoice({ item: needUpdateExpandedInvoice, value: true });
        }
        this.editedItem = {};
        console.log(data);
      } catch (error) {
        console.log(error);
        this.$store.commit('SET_ERROR', error.response.data.message);
      } finally {
        this.$store.commit('SET_LOADING', false);
        this.dialog = false;
      }
    },

    clickNewItem() {
      this.editedIndex = -1;
      this.editedItem = {};
      this.action = 'NEW';
    },

    async refreshItem(item) {
      this.editedIndex = this.invoices.indexOf(item);
      this.editedItem = { ...item };
      this.action = 'REFRESH';
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'PATCH',
          url: `${this.baseUrl}/invoices/${item._id}`,
        });
        await this.initialize;
        this.$store.commit('SET_INFO', `Deducted ${data.updatedCustomer.name}'s balance by: ${data.deduct}`);
      } catch (error) {
        this.$store.commit('SET_ERROR', error.response.data.message);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
      // this.dialog = true;
    },

    editItem(item) {
      this.editedIndex = this.invoices.indexOf(item);
      this.editedItem = { ...item };
      this.action = 'EDIT';
      this.dialog = true;
    },

    async deleteItem(item) {
      this.editedIndex = this.invoices.indexOf(item);
      this.editedItem = { ...item };
      // eslint-disable-next-line no-alert
      if (confirm('Do u really wanna do this?')) {
        try {
          this.auth();

          const { data } = await axios({
            method: 'DELETE',
            url: `${this.baseUrl}/invoices/${this.editedItem._id}`,
            data: {
              user: this.$store.state.user._id,
            },
          });
          await this.initialize();
        } catch (error) {
          this.$store.commit('SET_ERROR', error.response.data.message);
        }
      }
    },

    async takeOutDeliveryOrder(invoice, transaction) {
      if (confirm('Do u really wanna do this?')) {
        try {
          // this.auth(2);
          const { data } = await axios({
            method: 'PATCH',
            url: `${this.baseUrl}/invoices/takeOutDeliveryOrder`,
            data: {
              invoiceId: invoice._id,
              transactionId: transaction._id,
            },
          });
          await this.initialize(invoice);
        } catch (error) {
          this.$store.commit('SET_ERROR', error.response.data.message);
        } finally {
          this.$store.commit('SET_LOADING', false);
          this.close();
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
            url: `${this.baseUrl}/customers/`,
            data: {
              name: this.editedItem.name,
              phone: this.editedItem.phone,
              address: this.editedItem.address,
              type: this.editedItem.type,
            },
          });
        } else if (this.action === 'EDIT') {
          const { data } = await axios({
            method: 'PATCH',
            url: `${this.baseUrl}/invoices/editInvoice`,
            data: {
              _id: this.editedItem._id,
              name: this.editedItem.name,
              dueDate: this.editedItem.dueDate,
              invoiceInfos: this.editedItem.invoiceInfos,
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
