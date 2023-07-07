import * as echarts from 'echarts';
export default class EchartUtil {

  static createChart(label: any, data: any[]) {

    let chart = echarts.init(label.element);
    let option: any
    let type: string = label.chart_type
    if (type === 'line') {
      option = {
        title: { text: label.name, left: 'center' },
        xAxis: {
          type: 'category',
          data: data.map(e => e.name),
          axisLabel: { show: true, rotate: 30, margin: 8 },
          axisTick: {
            alignWithLabel: true, // 轴刻度
          },
        },
        yAxis: { type: 'value' },
        series: [{ data: data.map(e => e.value), type: 'line', label: { show: true } }]
      }
    }

    if (type === 'pie') {
      option = {
        title: { text: label.name, left: 'center' },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          left: 'center',
          bottom: 10,
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            data: data
          }
        ]
      };
    }

    if (option) {
      chart.setOption(option);
    }
  }

  static line(data: any) {

  }
}