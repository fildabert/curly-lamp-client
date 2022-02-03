<template>
  <!-- eslint-disable max-len -->
  <v-data-table
    :headers="headers"
    :items="desserts"
    :loading="$store.state.loading"
    sort-by="calories"
    class="elevation-1"
    :items-per-page="30"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Products</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="1000px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on" @click="clickNewItem"
              >New Item</v-btn
            >
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.name" label="Product Name"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.price"
                      label="Price"
                      :disabled="action === 'EDIT'"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.stock" label="Stock"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.unit" label="Unit"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.category" label="Category"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <!--   <v-autocomplete
                      label="Buying Price History"
                      :items="buyingPriceHistoryComputed"
                      v-model="editedItem.price"
                      type="text"
                      autocomplete="nope"
                    ></v-autocomplete>  -->
                  </v-col>
                  <v-col cols="6">
                    <v-dialog
                      ref="dialog2"
                      v-model="modalDate"
                      :return-value.sync="editedItem.scheduledDate"
                      persistent
                      width="290px"
                      v-if="isEditing"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="editedItem.scheduledDate"
                          label="Schedule Price Change"
                          prepend-icon="fas fa-calendar"
                          readonly
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="editedItem.scheduledDate" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modalDate = false">Cancel</v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.dialog2.save(editedItem.scheduledDate)"
                          >OK</v-btn
                        >
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="6" v-if="editedItem.scheduledDate">
                    <v-text-field
                      v-model="editedItem.futurePrice"
                      label="Future Price"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row v-if="isEditing && showLineChart" justify="center">
                  <v-col cols="8">
                    <RandomChart :buyingPriceHistory="editedItem.buyingPriceHistory"></RandomChart>
                  </v-col>
                  <v-col v-if="isEditing" cols="4">
                    <v-row>
                      <v-col cols="12" class="font-weight-bold">Scheduled Price Changes</v-col>
                      <v-col
                        cols="12"
                        :key="index"
                        v-for="(schedule, index) in editedItem.scheduledPriceChanges"
                        style="width: 100%"
                      >
                        <ul>
                          <li>
                            {{ schedule.futurePrice.toLocaleString() }} at {{ schedule.date }}

                            <v-icon small v-on="on" @click="removeScheduledDate(schedule._id)"
                              >fas fa-trash</v-icon
                            >
                          </li>
                        </ul>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-btn
                v-if="isEditing"
                color="blue darken-1"
                text
                @click="showLineChart = !showLineChart"
                >Show/Hide Price History</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
                :loading="$store.state.loading"
                :disabled="$store.state.loading"
                >Save</v-btn
              >
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

    <template v-slot:item.price="{ item, header, value }">
      <span>{{ Number(item.price.toFixed(0)).toLocaleString() }}</span>
    </template>
  </v-data-table>
</template>

<script>
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */

import axios from 'axios';
import { checkLogin } from '../helpers/authorization';
import RandomChart from '../components/RandomChart.vue';

export default {
  data: () => ({
    baseUrl: '',
    dialog: false,
    desserts: [],
    modalDate: false,
    editedIndex: -1,
    editedItem: {
      name: '',
      price: 0,
      stock: 0,
      unit: 0,
      category: 0,
    },
    temp: [],
    action: '',
    showLineChart: false,
  }),
  components: {
    RandomChart,
  },

  computed: {
    headers() {
      const headers = [
        {
          text: 'Name',
          align: 'left',
          sortable: false,
          value: 'name',
        },
        { text: 'Buying Price', value: 'price' },
        // { text: 'Stock', value: 'stock' },
        { text: 'Unit', value: 'unit' },
        { text: 'Category', value: 'category' },
        { text: 'Actions', value: 'action', sortable: false },
      ];

      if (this.$store.state.user.admin < 2) {
        const index = headers.findIndex((header) => header.text === 'Buying Price');
        headers.splice(index, 1);
      }
      return headers;
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    },
    buyingPriceHistoryComputed() {
      if (this.action === 'EDIT' && this.editedItem.buyingPriceHistory) {
        return this.editedItem.buyingPriceHistory.map((hist) => hist.price);
      }
      return [];
    },
    isEditing() {
      return (
        this.action === 'EDIT'
        && this.editedItem.buyingPriceHistory
        && this.editedItem.buyingPriceHistory.length > 0
      );
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
    async initialize(keepCurrentItem) {
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/products/all`,
        });
        this.desserts = data;
        if (!keepCurrentItem) {
          this.editedItem = {};
          this.showLineChart = false;
        } else {
          const updatedItem = data.find((d) => d._id === keepCurrentItem);
          if (updatedItem) {
            this.editedItem = updatedItem;
            console.log(this.editedItem, 'pls');
          }
        }
        // console.log(data);
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
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = { ...item };
      this.action = 'EDIT';
      this.dialog = true;
    },

    async deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = { ...item };
      // eslint-disable-next-line no-alert
      if (confirm('Do u really wanna do this?')) {
        try {
          this.auth(3);

          const { data } = await axios({
            method: 'DELETE',
            url: `${this.baseUrl}/products/${this.editedItem._id}`,
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

    close() {
      this.dialog = false;
    },

    async save() {
      try {
        this.auth(2);
        this.$store.commit('SET_LOADING', true);

        if (this.action === 'NEW') {
          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/products/`,
            data: {
              name: this.editedItem.name,
              price: this.editedItem.price,
              stock: this.editedItem.stock,
              unit: this.editedItem.unit,
              category: this.editedItem.category,
              user: this.$store.state.user._id,
            },
          });
        } else if (this.action === 'EDIT') {
          let scheduledPriceChange = null;
          if (this.editedItem.futurePrice) {
            scheduledPriceChange = {
              futurePrice: this.editedItem.futurePrice,
              date: this.editedItem.scheduledDate,
            };
          }

          const { data } = await axios({
            method: 'PUT',
            url: `${this.baseUrl}/products/${this.editedItem._id}`,
            data: {
              name: this.editedItem.name,
              // price: this.editedItem.price,
              stock: this.editedItem.stock,
              unit: this.editedItem.unit,
              category: this.editedItem.category,
              user: this.$store.state.user._id,
              scheduledPriceChange,
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

    async removeScheduledDate(scheduleId) {
      try {
        if (this.action === 'EDIT') {
          await axios({
            method: 'PUT',
            url: `${this.baseUrl}/products/removeSchedule/${this.editedItem._id}`,
            data: {
              scheduleId,
            },
          });
          await this.initialize(this.editedItem._id);
        }
      } catch (error) {
        console.log(error.response.data);
        this.$store.commit('SET_ERROR', error.response.data.message);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },
  },
};
</script>
