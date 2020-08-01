<template>
<!-- eslint-disable max-len -->
  <v-data-table :headers="headers" :search="search" :items="desserts" :loading="$store.state.loading" class="elevation-1" item-key="_id"
    single-expand
    show-expand
    :expanded.sync="expanded"
    :items-per-page="30"
    show-select
    :single-select="false"
    v-model="selected"
    @item-expanded="expandPO">
    <template v-slot:item.PONo="{ item }">
      <v-chip small :color="item.status === 'COMPLETED' ? 'green' : ''">{{ item.PONo }}</v-chip>
    </template>
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Purchase Order(Supplier)</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>

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
          label="Supplier"
          single-line
          hide-details
        ></v-text-field>

        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on" @click="clickNewItem">New PO</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline" v-if="action === 'NEW' || action === 'EDIT'">{{ formTitle }}</span>
              <span class="headline" v-if="action === 'INCREASE QUOTA'">Increase Quota</span>
              <span class="headline" v-if="action === 'PRINT'">Print Invoice</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <template v-if="action === 'NEW' || action === 'EDIT'">

                  <v-col cols="12">
                        <v-autocomplete
                          label="Product*"
                          :items="productNameList"
                          v-model="newOrder.productInput"
                          type="text"
                          autocomplete="nope"
                          required
                          :disabled="action === 'EDIT'"
                          :rules="[v => !!v || 'Product is required']"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Total Amount*"
                          v-model="newOrder.totalAmount"
                          autocomplete="nope"
                          :rules="[v => !!v || 'Total Amount is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-dialog
                          ref="dialog"
                          v-model="modalDate"
                          :return-value.sync="newOrder.dateIssued"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="newOrder.dateIssued"
                              label="Date Issued*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              required
                              :rules="[v => !!v || 'Date Issued is required']"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="newOrder.dateIssued" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog.save(newOrder.dateIssued)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="PO Number*"
                          v-model="newOrder.PONo"
                          autocomplete="nope"
                          :rules="[v => !!v || 'PO Number is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-autocomplete
                          label="Supplier*"
                          :items="customerNameList"
                          :disabled="action === 'EDIT'"
                          v-model="newOrder.customerInput"
                          type="text"
                          autocomplete="nope"
                          required
                          :rules="[v => !!v || 'Supplier is required']"
                        ></v-autocomplete>
                      </v-col>

                      <!-- <v-col cols="12">
                        <v-text-field
                          label="Supplier Name*"
                          v-model="newOrder.customerName"
                          autocomplete="nope"
                          :rules="[v => !!v || 'Supplier Name is required']"
                          required
                        ></v-text-field>
                      </v-col> -->
                  </template>

                  <template v-if="action === 'INCREASE QUOTA'">
                    <v-col cols="12" sm="6">
                        <v-text-field
                          label="Amount*"
                          v-model="newOrder.amount"
                          autocomplete="nope"
                          :rules="[v => !!v || 'Amount is required']"
                          required
                        ></v-text-field>
                      </v-col>
                  </template>

                  <template v-if="action === 'PRINT'">
                    <v-col cols="12" sm="6">
                        <v-dialog
                          ref="dialog"
                          v-model="modalDate"
                          :return-value.sync="modifiedOrder.startDate"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="modifiedOrder.startDate"
                              label="Start Date*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              required
                              :rules="[v => !!v || 'Start Date is required']"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="modifiedOrder.startDate" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog.save(modifiedOrder.startDate)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-dialog
                          ref="dialog2"
                          v-model="modalDate2"
                          :return-value.sync="modifiedOrder.endDate"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="modifiedOrder.endDate"
                              label="End Date*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              required
                              :rules="[v => !!v || 'End Date is required']"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="modifiedOrder.endDate" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate2 = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog2.save(modifiedOrder.endDate)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="Due Date (in days from today)*"
                          v-model="modifiedOrder.dueDate"
                          :rules="[v => !!v || 'Due date is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="Invoice No*"
                          v-model="modifiedOrder.invoiceName"
                          :rules="[v => !!v || 'Invoice No is required']"
                          required
                        ></v-text-field>
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
    <template v-slot:item.action="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" :disabled="selected.length > 0" @click="increaseQuota(item)">fas fa-plus</v-icon>
        </template>
          <span>Increase Quota</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" :disabled="selected.length > 0" @click="toggleStatus(item)">fas fa-check</v-icon>
        </template>
          <span>Toggle Status</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="clickPrint(item)">fas fa-print</v-icon>
        </template>
          <span>Print</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" :disabled="selected.length > 0" @click="clickEdit(item)">fas fa-edit</v-icon>
        </template>
          <span>Edit</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" :disabled="selected.length > 0" @click="deleteItem(item)">fas fa-trash</v-icon>
        </template>
          <span>Delete</span>
      </v-tooltip>

    </template>

    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <v-list subheader dense>
          <v-subheader>Delivery Orders</v-subheader>
          <v-list-item-group v-if="item.transactions.length > 0 && typeof item.transactions[0] !== 'string'">
            <v-list-item v-for="t in item.transactions.slice((page-1) * 40, ((page-1) + 1) * 40)" :key="t._id" selectable>
              <v-list-item-content>
                <v-list-item-title @click="$router.push(`/delivery-order?id=${t._id}`)">
                  D.O:
                  <v-chip small>{{ t.invoice }}</v-chip> [{{ t.productId.name }}] <v-chip small> {{ t.actualAmount || t.amount }} </v-chip> Tons delivered at
                  <v-chip small v-if="t.dateDelivered">{{ new Date(t.dateDelivered).toISOString().split('T')[0] }}</v-chip>
                  - status:
                  <v-chip small :color="t.status === 'COMPLETED' ? 'green' : 'orange lighten-1'">
                  {{ t.status }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-pagination
          v-if="item.transactions.length > 40"
          v-model="page"
          @click="() => console.log(page)"
          :length="Math.ceil(item.transactions.length/40)"
          ></v-pagination>
        </v-list>
      </td>
    </template>

    <template v-slot:item.ordersCompleted="{ item, header, value }">
      <span>{{ item.ordersCompleted.toLocaleString() }}</span>
    </template>

    <template v-slot:item.price="{ item, header, value }">
      <span>{{ item.price.toLocaleString() }}</span>
    </template>
  </v-data-table>
</template>

<script>
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */

import axios from 'axios';
import FileSaver from 'file-saver';
import { checkLogin } from '../helpers/authorization';

export default {
  data: () => ({
    page: 1,
    baseUrl: '',
    search: '',
    dialog: false,
    modalDate: false,
    desserts: [],
    editedIndex: -1,
    newOrder: {},
    action: '',
    productList: [],
    productNameList: [],
    customerList: [],
    customerNameList: [],
    expanded: [],
    selected: [],
    modalDate1: false,
    modalDate2: false,
    modifiedOrder: {},
    productFilter: '',
    customerFilter: '',
    PONoFilter: '',
  }),

  computed: {
    headers() {
      return [
        {
          text: 'PO Number',
          value: 'PONo',
          align: 'left',
          filter: (value) => {
            if (!this.PONoFilter) return true;
            return value.toString().toLowerCase().includes(this.PONoFilter.toLowerCase());
          },
        },
        {
          text: 'Product',
          sortable: false,
          value: 'productId.name',
          filter: (value) => {
            if (!this.productFilter) return true;
            return value.toString().toLowerCase().includes(this.productFilter.toLowerCase());
          },
        },
        {
          text: 'Supplier',
          value: 'customerName',
          filter: (value) => {
            if (!this.customerFilter) return true;
            return value.toString().toLowerCase().includes(this.customerFilter.toLowerCase());
          },

        },
        { text: 'Total Amount (tons)', value: 'totalAmount' },
        { text: 'Orders Completed (tons)', value: 'ordersCompleted' },
        { text: 'Date Issued', value: 'dateIssued' },
        { text: 'Buying price (per unit)', value: 'price' },
        { text: 'Actions', value: 'action', sortable: false },
      ];
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New PO' : 'Edit PO';
    },
  },

  watch: {
    dialog(val) {
      // eslint-disable-next-line no-unused-expressions
      val || this.close();
    },
    $route: {
      immediate: true,
      handler(to, from) {
        if ((from.name === 'PurchaseOrderSupplier' && to.name === 'Details') || (from.name === 'Details' && to.name === 'PurchaseOrderSupplier')) {
          this.$emit('destroypls', false);
        } else {
          this.$emit('destroypls', true);
        }
      },
    },
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

    async expandPO({ item, value }) {
      const selectedIndex = this.desserts.indexOf(item);
      if (value) {
        try {
          this.$store.commit('SET_LOADING', true);
          const { data } = await axios({
            method: 'GET',
            url: `${this.baseUrl}/purchase-orders/${item._id}`,
          });

          const expandedPO = data;
          expandedPO.dateIssued = expandedPO.dateIssued ? new Date(expandedPO.dateIssued).toISOString().split('T')[0] : '';
          expandedPO.productPrice = data.productId.price;

          this.desserts.splice(selectedIndex, 1, expandedPO);
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

    async initialize() {
      try {
        this.$store.commit('SET_LOADING', true);
        var { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/purchase-orders/supplier`,
        });

        this.desserts = data;

        this.desserts.forEach((dessert) => {
          dessert.ProductId = dessert.productId._id;
          if (dessert.dateIssued) dessert.dateIssued = new Date(dessert.dateIssued).toISOString().split('T')[0];
        });

        if (this.customerList.length === 0) {
          var { data } = await axios({
            method: 'GET',
            url: `${this.baseUrl}/customers/all/supplier`,
          });

          this.customerList = data;

          this.customerList.forEach((customer) => {
            this.customerNameList.push(customer.name);
          });
        }

        if (this.productList.length === 0) {
          var { data } = await axios({
            method: 'GET',
            url: `${this.baseUrl}/products/all`,
          });
          this.productList = data;

          this.productList.forEach((product) => {
            this.productNameList.push(product.name);
          });
        }
        this.editedItem = {};
      } catch (error) {
        this.$store.commit('SET_ERROR', error.response.data.message);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },

    clickNewItem() {
      this.editedIndex = -1;
      this.newOrder = {};
      this.action = 'NEW';
    },

    clickPrint(item) {
      this.newOrder = { ...item };
      this.action = 'PRINT';
      this.dialog = true;
    },

    clickEdit(item) {
      this.newOrder = { ...item };
      this.editedIndex = 1;
      this.action = 'EDIT';
      this.dialog = true;
    },

    increaseQuota(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.newOrder = { ...item };
      this.action = 'INCREASE QUOTA';
      this.dialog = true;
    },

    async toggleStatus(item) {
      try {
        this.$store.commit('SET_LOADING', true);
        await axios({
          method: 'PATCH',
          url: `${this.baseUrl}/purchase-orders/${item._id}`,
        });
      } catch (error) {
        this.$store.commit('SET_ERROR', error.response.data.message || error.response.data);
      } finally {
        this.initialize();
        this.$store.commit('SET_LOADING', false);
      }
    },

    newDelivery(item) {
      this.newOrder = { ...item };
      this.action = 'NEW DELIVERY';
      this.dialog = true;
    },

    async deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = { ...item };
      // eslint-disable-next-line no-alert
      if (confirm('Do u really wanna do this?')) {
        try {
          this.auth();
          const { data } = await axios({
            method: 'DELETE',
            url: `${this.baseUrl}/purchase-orders/${this.editedItem._id}`,
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
        const productIndex = this.productList.findIndex(
          (product) => product.name === this.newOrder.productInput,
        );
        const selectedProduct = this.productList[productIndex];
        this.$store.commit('SET_LOADING', true);

        if (this.action === 'NEW') {
          const customerIndex = this.customerList.findIndex((customer) => customer.name === this.newOrder.customerInput);
          const selectedCustomer = this.customerList[customerIndex];
          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/purchase-orders/supplier`,
            data: {
              ...this.newOrder,
              totalAmount: +this.newOrder.totalAmount,
              productId: selectedProduct._id,
              customerId: selectedCustomer._id,
              approvedBy: this.$store.state.user._id,
            },
          });
        } else if (this.action === 'EDIT') {
          this.$store.commit('SET_LOADING', true);
          const { data } = await axios({
            method: 'PUT',
            url: `${this.baseUrl}/purchase-orders/${this.newOrder._id}`,
            data: {
              totalAmount: +this.newOrder.totalAmount,
              PONo: this.newOrder.PONo,
              dateIssued: this.newOrder.dateIssued,
            },
          });
        } else if (this.action === 'INCREASE QUOTA') {
          const { data } = await axios({
            method: 'PUT',
            url: `${this.baseUrl}/purchase-orders/increase-quota`,
            data: {
              _id: this.newOrder._id,
              amount: this.newOrder.amount,
            },
          });
        } else if (this.action === 'NEW DELIVERY') {
          this.newOrder.orderId = this.newOrder._id;
          delete this.newOrder._id;
          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/transactions/supplier`,
            data: {
              ...this.newOrder,
              productId: this.newOrder.ProductId,
              approvedBy: this.$store.state.user._id,
            },
          });
        } else if (this.action === 'PRINT') {
          if (this.selected.length > 0) {
            await axios({
              method: 'POST',
              url: `${this.baseUrl}/purchase-orders/printMany`,
              data: {
                orderIds: this.selected.map((order) => order._id),
                startDate: this.modifiedOrder.startDate,
                endDate: this.modifiedOrder.endDate,
                dueDate: this.modifiedOrder.dueDate,
                invoiceName: this.modifiedOrder.invoiceName,
              },
            });
          } else {
            const { data } = await axios({
              method: 'GET',
              url: `${this.baseUrl}/purchase-orders/print/${this.newOrder._id}?startDate=${this.modifiedOrder.startDate}&endDate=${this.modifiedOrder.endDate}&dueDate=${this.modifiedOrder.dueDate}&invoiceName=${this.modifiedOrder.invoiceName}`,
              responseType: 'blob',
            });
            FileSaver.saveAs(
              data,
              `Invoice[${this.newOrder.PONo}]/${this.newOrder.productId.name}.xlsx`,
            );
          }
        }
        await this.initialize();
        this.close();
      } catch (error) {
        console.log(error);
        console.log(error.response.data);
        this.$store.commit('SET_ERROR', error.response.data.message || error.response.data);
        this.close();
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },
  },
};
</script>
