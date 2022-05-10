const bpmn = {
  state: {
    nodeVisible: false,
    nodeInfo: {}
  },
  mutations: {
    TOGGLE_NODE_VISIBLE: (state, visible) => {
      state.nodeVisible = visible
    },
    SET_NODE_INFO: (state, info) => {
      state.nodeInfo = info
    }
  },
  actions: {}
  // namespace: true
}

export default bpmn
