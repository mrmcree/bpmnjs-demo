import Vue from 'vue'
import Vuex from 'vuex'
import bpmn from './modules/bpmn'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    radioValue: ''
  },
  getters: {
    radioValue ({ radioValue }) {
      return radioValue
    }
  },
  mutations: {
    setRadioValue (state, newVAlue) {
      state.radioValue = newVAlue
    }
  },
  actions: {},
  modules: { bpmn }
  // namespace: true
})
