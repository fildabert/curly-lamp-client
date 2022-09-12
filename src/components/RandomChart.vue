<template>
  <div>
    <line-chart :chart-data="datacollection" :height="150"  ></line-chart>
  </div>
</template>

<script>
import LineChart from '../helpers/linechart';

export default {
  components: {
    LineChart,
  },
  props: {
    buyingPriceHistory: Array,
  },
  data() {
    return {
      datacollection: { labels: [], datasets: [] },
    };
  },
  mounted() {
    console.log(this.buyingPriceHistory);
    this.fillData();
  },
  methods: {
    fillData() {
      this.datacollection = { labels: [], datasets: [] };
      const [dateAxis, buyingPriceAxis] = this.buyingPriceHistory.reduce(([dates, prices], obj) => {
        dates.push(obj.date.split('T')[0]);
        prices.push(obj.price);
        return [dates, prices];
      }, [[], []]);
      const randomColor = `#${(Math.random() * 0xFFFFFF << 0).toString(16)}`;
      this.datacollection = {
        labels: dateAxis,
        datasets: [
          {
            label: 'Buying Price History',
            backgroundColor: randomColor,
            // fill: gradientFill,
            // borderColor: randomColor,
            data: buyingPriceAxis,
          },
        ],
      };
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
  },
  watch: {
    buyingPriceHistory() {
      this.fillData();
    },
  },

};
</script>

<style>
  .small {
    max-height: 100px;
    max-width: 600px;
    margin:  150px auto;
  }
</style>
