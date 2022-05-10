<template>
    <el-drawer
            title="我是标题"
            :visible="nodeVisible"
            :direction="'ltr'"
            @close="TOGGLE_NODE_VISIBLE(false)"
            :modal="false"
            >
        <el-form ref="form" :model="node_info" label-width="80px" v-if="node_info">
            <el-form-item label="类型">
                <el-input v-model="node_info.$type" disabled></el-input>
            </el-form-item>
            <el-form-item label="id">
                <el-input v-model="node_info.id"></el-input>
            </el-form-item>
            <div class="element-drawer__button">
                <el-button  size="mini" type="info">取消</el-button>
                <el-button  size="mini" type="primary">保存</el-button>

            </div>

        </el-form>
    </el-drawer>

</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'index',
  data () {
    return {
      form: {}
    }
  },

  methods: {
    ...mapMutations(['TOGGLE_NODE_VISIBLE'])
  },
  computed: {
    ...mapState({
      nodeVisible: state => state.bpmn.nodeVisible,
      node_info: state => state.bpmn.nodeInfo
    })
  }
}
</script>

<style scoped lang="less">
.element-drawer__button {
  margin-top: 8px;
  width: 100%;
  display: inline-flex;
  justify-content: space-around;
  button{
    flex:1;
  }
}
</style>
