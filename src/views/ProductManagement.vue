
<template>
<!-- eslint-disable max-len -->
  <v-data-table :headers="headers" :items="desserts" :loading="$store.state.loading" sort-by="calories" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Products</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on" @click="clickNewItem">New Item</v-btn>
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
                    <v-text-field v-model="editedItem.price" label="Price"></v-text-field>
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
  </v-data-table>
</template>

<script>
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */

import axios from 'axios';
import { checkLogin } from '../helpers/authorization';

export default {
  data: () => ({
    baseUrl: '',
    dialog: false,
    headers: [
      {
        text: 'Name',
        align: 'left',
        sortable: false,
        value: 'name',
      },
      { text: 'Buying Price', value: 'price' },
      { text: 'Stock', value: 'stock' },
      { text: 'Unit', value: 'unit' },
      { text: 'Category', value: 'category' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
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
        const { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/products/all`,
        });
        this.desserts = data;
        this.editedItem = {};
        console.log(data);
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
          this.auth();
          const { data } = await axios({
            method: 'DELETE',
            url: `${this.baseUrl}/products/${this.editedItem._id}`,
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
          const { data } = await axios({
            method: 'POST',
            url: `${this.baseUrl}/products/`,
            data: {
              name: this.editedItem.name,
              price: this.editedItem.price,
              stock: this.editedItem.stock,
              unit: this.editedItem.unit,
              category: this.editedItem.category,
            },
          });
        } else if (this.action === 'EDIT') {
          const { data } = await axios({
            method: 'PUT',
            url: `${this.baseUrl}/products/${this.editedItem._id}`,
            data: {
              name: this.editedItem.name,
              price: this.editedItem.price,
              stock: this.editedItem.stock,
              unit: this.editedItem.unit,
              category: this.editedItem.category,
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
