
<template>
  <!-- eslint-disable max-len -->
  <v-app>
    <template v-if="!$store.state.isLogin">
      <Login></Login>
      <v-snackbar
        v-model="$store.state.error"
        :multi-line="multiLine"
        color="red"
      >{{ $store.state.errorMessage }}</v-snackbar>
    </template>

    <template v-if="$store.state.isLogin">
      <v-app-bar app clipped-left color="#FFFFFF">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
                <!-- <v-img src="https://trustyourperceptions.files.wordpress.com/2016/05/1280px-human_semen_in_a_petri_dish-e1462598125307.jpg" max-height="80" max-width="80"></v-img> -->
        <v-img src="./assets/sinoma-logo.png" max-height="300" max-width="500"></v-img>

        <v-spacer></v-spacer>
        <v-list rounded dense style='max-height: 63px;' class="mb-3">
          <v-list-item-group color="primary">
          <v-list-item>
            <div></div>
          <v-list-item-avatar class="mr-3">
            <v-avatar :color="'#'+(Math.random()*0xFFFFFF<<0).toString(16)" style="padding-right: 7px;">
              <!-- <v-img src="./assets/dapis.png" max-height="90" max-width="50"></v-img> -->
              <span class="white--text headline">{{$store.state.user.username.split("")[0].toUpperCase()}}</span>
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="$store.state.user.username"></v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <v-icon @click="logout">fas fa-sign-out-alt</v-icon>
          </v-list-item-action>
        </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" app clipped color="white">
        <v-list dense >
          <v-list-item @click="$router.push('/')" class="mt-3">
            <v-list-item-action>
              <v-icon>far fa-list-alt</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="black--text">Purchase Order (Buyer)</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!-- <v-divider dark class="my-4" /> -->

          <v-list-item @click="$router.push('/supplier')">
            <v-list-item-action>
              <v-icon>fas fa-list-alt</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="black--text">Purchase Order(Supplier)</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="$router.push('/deliveries')">
            <v-list-item-action>
              <v-icon>fas fa-truck</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="black--text">Deliveries</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="$router.push('/product-management')">
            <v-list-item-action>
              <v-icon color="">fas fa-book</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="black--text">Product Management</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="$router.push('/customer-management')">
            <v-list-item-action>
              <v-icon>fas fa-user</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="black--text">Customer Management</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-content id="wallpaper">
        <!-- <v-progress-linear indeterminate color="blue" v-show="$store.state.loading" style="z-index: 2;"></v-progress-linear> -->
        <v-snackbar
          v-model="$store.state.error"
          :multi-line="multiLine"
          color="red"
        >{{ $store.state.errorMessage }}</v-snackbar>
        <v-container>
          <transition name="fade">
            <keep-alive exclude="Details" v-if="!destroyit">
              <router-view @destroypls="hello" v-if="!destroyit"></router-view>
            </keep-alive>
          
            <router-view v-if="destroyit" @destroypls="hello"></router-view>
          </transition>


        </v-container>
      </v-content>
    </template>
  </v-app>
</template>

<script>
import { checkLogin } from './helpers/authorization';
import Login from './views/Login.vue';

export default {
  props: {
    source: String,
  },
  components: {
    Login,
  },
  created() {
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
  },
  data: () => ({
    drawer: null,
    loading: false,
    snackbar: false,
    multiLine: false,
    componentKey: 0,
    destroyit: false,
  }),
  methods: {
    logout() {
      this.$store.commit('SET_LOGIN', { isLogin: false, user: {} });
      localStorage.removeItem('token');
    },
    hello(payload) {
      this.destroyit = payload;
    },
  },

};
</script>

<style>
#wallpaper {
  /* background-image: url('./assets/weed-wallpaper.jpg'); */
  background-position: center;
  background-color: #F4F7F8;
}

#keep .v-navigation-drawer__border {
  display: none;
}
.v-list-item:hover {
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .15s;
}

.fade-enter-active {
  transition-delay: .15s;
}

.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
