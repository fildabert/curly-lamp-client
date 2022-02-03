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
    meta: { title: 'Sinoma Trading - Back Office' },
  },
  {
    path: '/product-management',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: { title: 'Sinoma Trading - Product Management' },
  },
  {
    path: '/supplier',
    name: 'PurchaseOrderSupplier',
    component: PurchaseOrderSupplier,
    meta: { title: 'Sinoma Trading - PO(Supplier)' },
  },
  {
    path: '/deliveries',
    name: 'Deliveries',
    component: Deliveries,
    meta: { title: 'Sinoma Trading - Deliveries' },
  },
  {
    path: '/delivery-order',
    name: 'Details',
    component: Details,
    meta: { title: 'Sinoma Trading - Delivery Details' },
  },
  {
    path: '/customer-management',
    name: 'Customer',
    component: Customer,
    meta: { title: 'Sinoma Trading - Customer Management' },
  },
  {
    path: '/invoice-buyer',
    name: 'InvoiceBuyer',
    component: InvoiceBuyer,
    meta: { title: 'Sinoma Trading - Invoice(Receivable)' },
  },
  {
    path: '/invoice-supplier',
    name: 'InvoiceSupplier',
    component: InvoiceSupplier,
    meta: { title: 'Sinoma Trading - Invoice(Payable)' },
  },
  {
    path: '/cashflow',
    name: 'CashFlow',
    component: CashFlow,
    meta: { title: 'Sinoma Trading - Cash Flow' },
  },
];

const router = new VueRouter({
  routes,
});

export default router;
