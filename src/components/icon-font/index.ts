import Icon from './Icon.vue'


export default {
  install(app:any, options = {}) {
    app.component('icon', Icon)
  }
}
