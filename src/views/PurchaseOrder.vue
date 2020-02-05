
<template>
  <!-- eslint-disable max-len -->
  <v-data-table
    :headers="headers"
    :items="desserts"
    sort-by="dueDate"
    class="elevation-1"
    :search="search"
    :loading="$store.state.loading"
    item-key="_id"
    single-expand
    show-expand
    :expanded.sync="expanded"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Purchase Order</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-text-field
          v-model="search"
          prepend-icon="fas fa-search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>

        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on" @click="clickPO">New PO</v-btn>
          </template>

          <v-form ref="form" v-model="valid" lazy-validation autocomplete="nope" persistent>
            <v-card>
              <v-card-title>
                <span
                  v-if="!newDelivery && !editOrder && !print"
                  class="headline"
                >New Purchase Order</span>
                <span v-if="newDelivery" class="headline">New Delivery</span>
                <span v-if="editOrder" class="headline">Edit Purchase Order</span>
                <span v-if="print" class="headline">Print Invoice and Delivery Order</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <!-- NEW PURCHASE ORDER -->
                    <template v-if="!newDelivery && !editOrder && !print">
                      <v-col cols="12">
                        <v-autocomplete
                          label="Product*"
                          :items="productNameList"
                          v-model="newOrder.productInput"
                          type="text"
                          autocomplete="nope"
                          required
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
                      <!-- <v-col cols="12" sm="6">
                        <v-dialog
                          ref="dialog"
                          v-model="modalDate"
                          :return-value.sync="newOrder.dueDate"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="newOrder.dueDate"
                              label="Due Date*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              required
                              :rules="[v => !!v || 'Due Date is required']"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="newOrder.dueDate" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog.save(newOrder.dueDate)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>-->

                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Selling Price*"
                          v-model="newOrder.price"
                          :rules="[v => !!v || 'Selling Price (per unit) is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="PO Number*"
                          v-model="newOrder.PONo"
                          :rules="[v => !!v || 'PO Number is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="Customer Name*"
                          v-model="newOrder.customerName"
                          :rules="[v => !!v || 'Customer Name is required']"
                          required
                        ></v-text-field>
                      </v-col>
                    </template>

                    <!-- NEW DELIVERY -->
                    <template v-if="newDelivery">
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Amount*"
                          v-model="newTransaction.amount"
                          :rules="[v => !!v || 'Amount is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Delivery Order*"
                          v-model="newTransaction.invoice"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-dialog
                          ref="dialog2"
                          v-model="modalDate2"
                          :return-value.sync="modifiedOrder.dateDelivered"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="modifiedOrder.dateDelivered"
                              label="Date Delivered*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              required
                              :rules="[v => !!v || 'Date Delivered is required']"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="modifiedOrder.dateDelivered" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate2 = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog2.save(modifiedOrder.dateDelivered)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="Customer Name*"
                          v-model="selectedPO.customerName"
                          :rules="[v => !!v || 'Customer Name is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="2">
                        <v-switch
                          v-model="repeatDelivery"
                          label="Repeat"
                          dense
                        ></v-switch>
                      </v-col>
                      <v-col cols="2" offset="1" v-if="repeatDelivery">
                        <v-text-field v-model="newTransaction.repeat" label="Times"></v-text-field>
                      </v-col>
                    </template>

                    <!-- EDIT PURCHASE ORDER -->

                    <template v-if="editOrder">
                      <v-col cols="12">
                        <v-autocomplete
                          label="Product*"
                          :items="productNameList"
                          v-model="modifiedOrder.productInput"
                          type="text"
                          autocomplete="nope"
                          required
                          :rules="[v => !!v || 'Product is required']"
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Total Amount*"
                          v-model="modifiedOrder.totalAmount"
                          disabled
                          autocomplete="nope"
                          :rules="[v => !!v || 'Total Amount is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Orders Completed*"
                          disabled
                          v-model="modifiedOrder.ordersCompleted"
                          autocomplete="nope"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          label="Selling Price (per unit)*"
                          v-model="modifiedOrder.price"
                          :rules="[v => !!v || 'Selling Price is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="PO Number*"
                          v-model="modifiedOrder.PONo"
                          :rules="[v => !!v || 'PO Number is required']"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          label="Customer Name*"
                          v-model="modifiedOrder.customerName"
                          :rules="[v => !!v || 'Customer Name is required']"
                          required
                        ></v-text-field>
                      </v-col>

                    </template>

                    <!-- Print -->

                    <template v-if="print">
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
                        <v-dialog
                          ref="dialog3"
                          v-model="modalDate3"
                          :return-value.sync="modifiedOrder.dueDate"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="modifiedOrder.dueDate"
                              label="Due Date*"
                              prepend-icon="fas fa-calendar"
                              readonly
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="modifiedOrder.dueDate" scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dialog3.save(modifiedOrder.dueDate)"
                            >OK</v-btn>
                          </v-date-picker>
                        </v-dialog>
                      </v-col>
                    </template>
                  </v-row>
                </v-container>
                <small>*indicates required field</small>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
                <v-btn
                  color="blue darken-1"
                  v-if="!newDelivery && !editOrder && !print"
                  text
                  @click="save"
                  :loading="$store.state.loading"
                  :disabled="$store.state.loading"
                >Save</v-btn>
                <v-btn
                  color="blue darken-1"
                  v-if="newDelivery"
                  text
                  @click="createTransaction"
                  :loading="$store.state.loading"
                  :disabled="$store.state.loading"
                >Save</v-btn>
                <v-btn
                  color="blue darken-1"
                  v-if="editOrder"
                  text
                  @click="editPurchaseOrder"
                  :loading="$store.state.loading"
                  :disabled="$store.state.loading"
                >Save</v-btn>
                <v-btn
                  color="blue darken-1"
                  v-if="print"
                  text
                  @click="printOrder"
                  :loading="$store.state.loading"
                  :disabled="$store.state.loading"
                >Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.action="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="clickTruck(item)">fas fa-truck</v-icon>
        </template>
        <span>New Delivery</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="clickEdit(item)">fas fa-edit</v-icon>
        </template>
        <span>Edit</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="clickPrint(item)">fas fa-print</v-icon>
        </template>
        <span>Print</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon small class="mr-2" v-on="on" @click="clickTrash(item)">fas fa-trash</v-icon>
        </template>
        <span>Delete</span>
      </v-tooltip>
    </template>

    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <v-list subheader dense>
          <v-subheader>Delivery Orders</v-subheader>
          <v-list-item-group>
            <v-list-item v-for="t in item.transactions.slice((page-1) * 5, ((page-1) + 1) * 5)" :key="t._id" selectable>
              <v-list-item-content>
                <v-list-item-title @click="$router.push(`/delivery-order?id=${t._id}`)">
                  D.O:
                  <v-chip small>{{ t.invoice }}</v-chip> delivered at
                  <v-chip small>{{ new Date(t.dateDelivered).toISOString().split('T')[0] }}</v-chip>
                  - status:
                  <v-chip small :color="t.status === 'COMPLETED' ? 'green' : 'orange lighten-1'">
                  {{ t.status }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-pagination
          v-if="item.transactions.length > 5"
          v-model="page"
          @click="() => console.log(page)"
          :length="Math.ceil(item.transactions.length/5)"
          ></v-pagination>
        </v-list>
      </td>
    </template>
  </v-data-table>
</template>

<script>
/* eslint-disable no-underscore-dangle */
/* eslint-disable vars-on-top */
import axios from 'axios';
import FileSaver from 'file-saver';
import { checkLogin } from '../helpers/authorization';

export default {
  data: () => ({
    page: 1,
    search: '',
    baseUrl: '',
    dialog: false,
    expanded: [],
    newDelivery: false,
    editOrder: false,
    modalDate: false,
    modalDate2: false,
    modalDate3: false,
    valid: false,
    valid2: true,
    print: false,
    productList: [],
    productNameList: [],
    selectedPO: '',
    headers: [
      {
        text: 'Product',
        align: 'left',
        sortable: false,
        value: 'productName',
      },
      { text: 'Customer', value: 'customerName' },
      { text: 'Total Amount (tons)', value: 'totalAmount' },
      { text: 'Orders Completed (tons)', value: 'ordersCompleted' },
      { text: 'Selling price (per unit)', value: 'price' },
      { text: 'PO Number', value: 'PONo' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    desserts: [],
    editedIndex: -1,
    newOrder: {
      productName: '',
      totalAmount: '',
      ordersCompleted: 0,
      dueDate: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
    },
    modifiedOrder: {
      productName: '',
      totalAmount: '',
      ordersCompleted: 0,
      dueDate: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
    },
    newTransaction: {
      amount: '',
      sellingPrice: '',
    },
    defaultItem: {
      name: '',
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
    },
    repeatDelivery: false,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    },
  },

  watch: {
    dialog(val) {
      // eslint-disable-next-line no-unused-expressions
      val || this.close();
    },
    repeatDelivery(val) {
      if (!val) {
        this.newTransaction.repeat = null;
      }
    },
  },

  created() {
    this.baseUrl = this.$store.state.baseUrl;
    const token = localStorage.getItem('token');
    if (token) {
      const userData = checkLogin(token);
      if (userData) {
        this.$store.commit('SET_LOGIN', {
          isLogin: true,
          user: { ...userData },
        });
      } else {
        this.$store.commit('SET_LOGIN', { isLogin: false, user: {} });
      }
    }
    this.initialize();
  },

  methods: {
    async initialize() {
      try {
        this.$store.commit('SET_LOADING', true);
        var { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/products/all`,
        });
        this.productList = data;
        data.forEach((prod) => {
          this.productNameList.push(prod.name);
        });

        var { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/purchase-orders/all`,
        });

        const purchaseOrders = [];

        data.forEach((order) => {
          order.dueDate = new Date(order.dueDate).toLocaleDateString();
          let productName = '';
          if (order.status === 'COMPLETED') {
            productName = `${order.productId.name} ✅`;
          } else {
            productName = order.productId.name;
          }
          purchaseOrders.push({
            ...order,
            productName,
            productPrice: order.productId.price,
          });
        });
        this.desserts = purchaseOrders;
      } catch (error) {
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },

    async createTransaction(purchaseOrder) {
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'POST',
          url: `${this.baseUrl}/transactions`,
          data: {
            orderId: this.selectedPO._id,
            productId: this.selectedPO.productId._id,
            amount: +this.newTransaction.amount,
            invoice: this.newTransaction.invoice,
            sellingPrice: +this.selectedPO.price,
            customerName: this.selectedPO.customerName,
            customerPhone: this.selectedPO.customerPhone,
            customerAddress: this.selectedPO.customerAddress,
            // dueDate: this.modifiedOrder.dueDate,
            dateDelivered: this.modifiedOrder.dateDelivered,
            approvedBy: this.$store.state.user._id,
            repeat: this.newTransaction.repeat,
          },
        });

        await this.initialize();
        this.newTransaction.amount = '';
        this.newTransaction.sellingPrice = '';
        this.close();
      } catch (error) {
        this.$store.commit(
          'SET_ERROR',
          error.response.data.message || error.response.data,
        );
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },

    close() {
      this.dialog = false;
      this.dialog2 = false;
      this.modifiedOrder = {};
      this.print = false;
      this.newTransaction = {};
      this.newOrder = {};
      this.newOrder.ordersCompleted = 0;
      this.validate();
      this.repeatDelivery = false;
    },

    async save() {
      if (!this.validate()) {
        this.$store.commit('SET_LOADING', true);
        const productIndex = this.productList.findIndex(
          (product) => product.name === this.newOrder.productInput,
        );
        const selectedProduct = this.productList[productIndex];
        try {
          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/purchase-orders`,
            data: {
              ...this.newOrder,
              productId: selectedProduct._id,
              approvedBy: this.$store.state.user._id,
            },
          });
          await this.initialize();
          this.close();
        } catch (error) {
          console.log(error.response.data);
          this.$store.commit(
            'SET_ERROR',
            error.response.data.message || error.response.data,
          );
        } finally {
          this.$store.commit('SET_LOADING', false);
        }
      }
    },

    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
        return false;
      }
      return true;
    },

    clickPO() {
      this.newDelivery = false;
      this.editOrder = false;
      this.print = false;
    },

    clickTruck(PO) {
      this.selectedPO = PO;
      this.dialog = true;
      this.newDelivery = true;
      this.editOrder = false;
    },

    clickPrint(PO) {
      this.selectedPO = PO;
      this.dialog = true;
      this.newDelivery = false;
      this.editOrder = false;
      this.print = true;
    },

    async clickTrash(PO) {
      this.selectedPO = PO;
      if (
        confirm(`Are u sure u want to delete ${this.selectedPO.productName}?`)
      ) {
        try {
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
          const { data } = await axios({
            method: 'DELETE',
            url: `${this.baseUrl}/purchase-orders/${this.selectedPO._id}`,
          });
          await this.initialize();
        } catch (error) {
          this.$store.commit('SET_ERROR', error.response.data.message);
        }
      }
    },

    clickEdit(PO) {
      console.log(PO);
      this.modifiedOrder = PO;
      this.modifiedOrder.productInput = PO.productId.name;
      this.dialog = true;
      this.newDelivery = false;
      this.editOrder = true;
    },

    async editPurchaseOrder() {
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'PUT',
          url: `${this.baseUrl}/purchase-orders/${this.modifiedOrder._id}`,
          data: {
            productId: this.modifiedOrder.productId._id,
            customerName: this.modifiedOrder.customerName,
            customerPhone: this.modifiedOrder.customerPhone,
            customerAddress: this.modifiedOrder.customerAddress,
            totalAmount: +this.modifiedOrder.totalAmount,
            ordersCompleted: this.modifiedOrder.ordersCompleted,
            price: this.modifiedOrder.price,
            PONo: this.modifiedOrder.PONo,
          },
        });
        await this.initialize();
        this.close();
      } catch (error) {
        this.$store.commit(
          'SET_ERROR',
          error.response.data.message || error.response.data,
        );
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },

    async printOrder() {
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/purchase-orders/print/${this.selectedPO._id}?startDate=${this.modifiedOrder.startDate}&endDate=${this.modifiedOrder.endDate}`,
          responseType: 'blob',
        });
        FileSaver.saveAs(
          data,
          `Invoice[${this.selectedPO.PONo}]/${this.selectedPO.productId.name}.xlsx`,
        );
      } catch (error) {
        this.$store.commit(
          'SET_ERROR',
          `No invoice found between ${this.modifiedOrder.startDate} to ${this.modifiedOrder.endDate}`,
        );
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },
  },
};
</script>
