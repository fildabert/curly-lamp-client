import Vue from 'vue';
import VueRouter from 'vue-router';
import ProductManagement from '../views/ProductManagement.vue';
import PurchaseOrder from '../views/PurchaseOrder.vue';
import PurchaseOrderSupplier from '../views/PurchaseOrderSupplier.vue';
import Deliveries from '../views/Deliveries.vue';
import Details from '../views/Details.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'PurchaseOrder',
    component: PurchaseOrder,
  },
  {
    path: '/product-management',
    name: 'ProductManagement',
    component: ProductManagement,
  },
  {
    path: '/supplier',
    name: 'PurchaseOrderSupplier',
    component: PurchaseOrderSupplier,
  },
  {
    path: '/deliveries',
    name: 'Deliveries',
    component: Deliveries,
  },
  {
    path: '/delivery-order',
    name: 'Details',
    component: Details,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
