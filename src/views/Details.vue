<template>
<!-- eslint-disable max-len -->
  <v-container>
    <v-container style="width: 80%;">
     
      <v-timeline align-top :dense="$vuetify.breakpoint.smAndDown">
        <v-timeline-item
        :color="transaction.invoice ? 'primary' : 'grey'"
        >
          <v-card
            :color="transaction.invoice ? 'green darken-1' : 'orange lighten-1'"
          >
            <v-card-title class="title">Delivery was sent</v-card-title>
            <v-skeleton-loader
            v-if="$store.state.loading"
            ref="skeleton"
            type="article"
            class="mx-auto"
          ></v-skeleton-loader>
            <v-card-text v-if="!$store.state.loading" class="white text--primary">
              <p v-if="transaction.dateDelivered">Delivery Order: <strong>{{transaction.invoice}}</strong> [{{transaction.amount}} {{transaction.productId.unit}} {{transaction.productId.name}}] was sent to {{transaction.customerName}}
                at {{new Date(transaction.dateDelivered).toISOString().split('T')[0]}}
              </p>
              <v-text-field
              dense
            label="Delivery Order"
            v-model="transaction.invoice"
          ></v-text-field>
              <v-btn
                right
                class="mx-0"
                outlined
                :loading="$store.state.loading"
                @click="inputDeliveryOrder"
              >
                Update
              </v-btn>
            </v-card-text>
          </v-card>
        </v-timeline-item>


        <v-timeline-item :color="transaction.status === 'COMPLETED' ? 'primary' : 'grey'">
          <v-card
            :color="transaction.status === 'COMPLETED' ? 'green darken-1' : 'orange lighten-1'"
          >
            <v-card-title class="title">Confirm that {{transaction.customerName}} has received the goods</v-card-title>

            <v-skeleton-loader
            v-if="$store.state.loading"
            ref="skeleton"
            type="article"
            class="mx-auto"
          ></v-skeleton-loader>

            <v-card-text v-if="!$store.state.loading" class="white text--primary">
              <p>Please update the actual amount of <strong>{{transaction.productId.name}}</strong> received by {{transaction.customerName}}</p>
              <v-text-field
              dense
            label="Actual Amount"
            v-model="transaction.actualAmount"
          ></v-text-field>
          <v-text-field
              dense
            label="Car No"
            v-model="transaction.carNo"
          ></v-text-field>
              <v-btn
                right
                class="mx-0"
                outlined
                :loading="$store.state.loading"
                @click="completeOrder"
              >
                Update
              </v-btn>
            </v-card-text>
          </v-card>
        </v-timeline-item>


        <v-timeline-item :color="transaction.url ? 'primary' : 'grey'" v-if="transaction.status === 'COMPLETED'">
          <v-card
           :color="transaction.url ? 'green darken-1' : 'grey'"
          >
            <v-card-title class="title">Delivery Order Complete</v-card-title>
            <v-skeleton-loader
            v-if="$store.state.loading"
            ref="skeleton"
            type="article"
            class="mx-auto"
          ></v-skeleton-loader>

            <v-card-text v-if="!$store.state.loading" class="white text--primary">
              <p>Delivery Order: {{transaction.invoice}} is complete. You can upload the invoice in PDF or as an image to the cloud</p>
              <a target="_blank" rel="noopener noreferrer" v-if="transaction.url" :href="transaction.url">{{ decodeURI(transaction.url.split('/')[7]) }}</a>
                <v-file-input chips multiple v-model="file" label="File"></v-file-input>
              <v-btn
                @click="upload"
                class="mx-0"
                outlined
                :loading="$store.state.loading"
              >
                Upload
              </v-btn>
            </v-card-text>
          </v-card>
        </v-timeline-item>


      </v-timeline>

    </v-container>

  </v-container>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import axios from 'axios';
// import cloudinary from 'cloudinary';

export default {
  name: 'Details',
  created() {
    this.baseUrl = this.$store.state.baseUrl;
    this.initialize();
  },
  data: () => ({
    actualAmount: '',
    file: null,
    carNo: '',
    baseUrl: '',
    transaction: { productId: '' },
    items: [
      {
        color: 'red lighten-2',
        icon: 'mdi-star',
      },
      {
        color: 'purple darken-1',
        icon: 'mdi-book-variant',
      },
      {
        color: 'green lighten-1',
        icon: 'mdi-airballoon',
      },
      {
        color: 'indigo',
        icon: 'mdi-buffer',
      },
    ],
  }),
  methods: {
    async initialize() {
      this.$store.commit('SET_LOADING', true);
      try {
        const { data } = await axios({
          method: 'GET',
          url: `${this.baseUrl}/transactions/${this.$route.query.id}`,
        });
        this.transaction = data;
      } catch (error) {
        console.log(error.response);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },

    async inputDeliveryOrder() {
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'PUT',
          url: `${this.baseUrl}/transactions/${this.transaction._id}`,
          data: {
            ...this.transaction,
            invoice: this.transaction.invoice,
            amount: +this.transaction.amount,
            actualAmount: +this.transaction.actualAmount,
            orderId: this.transaction.orderId._id,
            productId: this.transaction.productId._id,
          },
        });
      } catch (error) {
        this.$store.commit('SET_ERROR', error.response.data.message || error.response.data);
      } finally {
        this.initialize();
        this.$store.commit('SET_LOADING', false);
      }
    },

    async completeOrder() {
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'PUT',
          url: `${this.baseUrl}/transactions/${this.transaction._id}`,
          data: {
            ...this.transaction,
            carNo: this.transaction.carNo,
            amount: +this.transaction.amount,
            actualAmount: +this.transaction.actualAmount,
            orderId: this.transaction.orderId._id,
            productId: this.transaction.productId._id,
          },
        });
      } catch (error) {
        this.$store.commit('SET_ERROR', error.response.data.message || error.response.data);
      } finally {
        this.initialize();
        this.$store.commit('SET_LOADING', false);
      }
    },
    async upload() {
      console.log('masuk');
      const formData = new FormData();
      formData.append('file', this.file[0]);
      formData.append('fileName', this.file[0].name);
      try {
        this.$store.commit('SET_LOADING', true);
        const { data } = await axios({
          method: 'POST',
          url: `${this.baseUrl}/transactions/upload/${this.transaction._id}`,
          data: formData,
        });
        console.log(data);
        await this.initialize();
      } catch (error) {
        console.log(error.response);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },
  },

};
</script>
