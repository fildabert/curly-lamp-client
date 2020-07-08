/* eslint-disable linebreak-style */
import Vue from 'vue';
import VueRouter from 'vue-router';
import ProductManagement from '../views/ProductManagement.vue';
import PurchaseOrder from '../views/PurchaseOrder.vue';
import PurchaseOrderSupplier from '../views/PurchaseOrderSupplier.vue';
import Deliveries from '../views/Deliveries.vue';
import Details from '../views/Details.vue';
import Customer from '../views/Customer.vue';
import InvoiceBuyer from '../views/InvoiceBuyer.vue';
import CashFlow from '../views/CashFlow.vue';
import InvoiceSupplier from '../views/InvoiceSupplier.vue';

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
  {
    path: '/customer-management',
    name: 'Customer',
    component: Customer,
  },
  {
    path: '/invoice-buyer',
    name: 'InvoiceBuyer',
    component: InvoiceBuyer,
  },
  {
    path: '/invoice-supplier',
    name: 'InvoiceSupplier',
    component: InvoiceSupplier,
  },
  {
    path: '/cashflow',
    name: 'CashFlow',
    component: CashFlow,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
