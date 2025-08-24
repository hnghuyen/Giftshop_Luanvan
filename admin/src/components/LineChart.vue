<template>
  <div>
    <LineChartJS :chart-data="chartData" :chart-options="chartOptions" />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const props = defineProps({
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, required: false, default: () => ({}) },
})

const LineChartJS = Line
</script>

<style scoped>
div {
  height: 100%;
}
</style>
