<template>
  <div class="mid-container">
    <ToolBar
      @updateXml="updateXml"
      @updateScale="updateScale"
      :bpmnModeler="bpmnModeler"
      :elementSelector="elementSelector"
      :xml="xml"
      :scale.sync="scale"
    />

    <div class="bpmn-container" v-show="radioValue === 'Diagram'">
      <div class="canvas-container">
        <div ref="canvas" class="canves"></div>

<!--        <div class="properties" :class="{ open: openPanel }">-->
<!--          <div class="toggle" @click="openPanel = !openPanel">属性面板</div>-->

<!--&lt;!&ndash;          <bpmn-panel&ndash;&gt;-->
<!--&lt;!&ndash;            :modeler="bpmnModeler"&ndash;&gt;-->
<!--&lt;!&ndash;            :process="initData"&ndash;&gt;-->
<!--&lt;!&ndash;            v-if="bpmnModeler"&ndash;&gt;-->
<!--&lt;!&ndash;          ></bpmn-panel>&ndash;&gt;-->

<!--          &lt;!&ndash;          <div ref="propertiesPanel" class="panel"></div>&ndash;&gt;-->
<!--        </div>-->
      </div>
    </div>

    <div class="xml-container" v-if="isShowXml">
      <codemirror
        ref="cmEditor"
        @changes="mirrorCodeChange"
        :value="xml.toString()"
        :options="cmOptions"
      />
    </div>

    <div class="bottom-container">
      <el-radio-group v-model="radioValue" size="mini">
        <el-radio-button label="Diagram"></el-radio-button>
        <el-radio-button label="Xml"></el-radio-button>
      </el-radio-group>
    </div>
      <customPanel></customPanel>
  </div>
</template>

<script>
import magicModdleDescriptor from '@/components/custom/descriptors/magic.json'
import Modeler from 'bpmn-js/lib/Modeler'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'
import 'bpmn-js-properties-panel/styles/properties.less'
import 'diagram-js-minimap/assets/diagram-js-minimap.css'
import minimapModule from 'diagram-js-minimap'
import propertiesPanelModule from 'bpmn-js-properties-panel'
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json'
import CustomModeler from '@/components/customMyModeler'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
// xml syntax highlighting
import 'codemirror/mode/xml/xml'
// auto close tags
import 'codemirror/addon/fold/xml-fold'
import 'codemirror/addon/edit/closetag'
// search addons我是修改后的虚线节点
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'

import '@/assets/css/diagram.less'
import '@/assets/icon/Icon.less'
import ToolBar from '@/components/diagram/ToolBar.vue'
import { xmlStr } from './xmlData.js'
import customTranslate from './customTranslate/customTranslate'
import { mapMutations, mapState } from 'vuex'
import customModule from '@/components/custom'
import activitiModele from '@/components/diagram/libs/activiti.json'
import flowableModdle from '@/components/diagram/libs/flowable.json'
import flowableDescriptor from '@/components/diagram/libs/flowableDescriptor.json'
import customPanel from '@/components/diagram/customPanel'
import BpmnPanel from '@/components/diagram/panel/index'

export default {
  components: { ToolBar, codemirror, BpmnPanel, customPanel },
  props: {},
  data () {
    return {
      product: 'flowable',
      bpmnModeler: null,
      xml: '',
      elementSelector: [],
      openPanel: true,
      scale: 1,
      radioValue: 'Diagram',
      cmOptions: {
        autoCloseTags: true,
        dragDrop: true,
        allowDropFileTypes: ['text/plain'],
        lineWrapping: true,
        lineNumbers: true,
        mode: {
          name: 'application/xml',
          htmlMode: false
        },
        tabSize: 2
      },
      initData: null
    }
  },
  computed: {
    ...mapState({
      nodeVisible: state => state.bpmn.nodeVisible
    }),
    isShowXml () {
      return this.radioValue === 'Xml'
    }
  },
  watch: {
    radioValue: {
      immediate: true,
      handler (v, o) {
        this.setRadioValue(v)
        if (v !== 'Xml' && o) {
          this.createNewDiagram()
        }
      }
    }
  },
  mounted () {
    const processId = new Date().getTime()
    this.initTemplate = xmlStr
    this.initData = {
      key: 'process' + processId,
      name: '流程' + processId,
      xml: this.initTemplate
    }
    this.init()
  },
  methods: {
    ...mapMutations(['setRadioValue', 'TOGGLE_NODE_VISIBLE', 'SET_NODE_INFO']),
    init () {
      const customTranslateModule = {
        translate: ['value', customTranslate]
      }
      const _moddleExtensions = this.getModdleExtensions()
      this.bpmnModeler = new CustomModeler({
        container: this.$refs.canvas,
        keyboard: {
          bindTo: document
        },
        propertiesPanel: {
          parent: this.$refs.propertiesPanel
        },
        additionalModules: [
          customTranslateModule,
          minimapModule,
          // propertiesPanelModule,
          propertiesProviderModule
        ],
        moddleExtensions: { flowable: flowableDescriptor }
        // moddleExtensions: {
        //   camunda: camundaModdleDescriptor
        //   // magic: magicModdleDescriptor
        // }
      })

      this.createNewDiagram()

      this.initEvent()

      // 默认打开 minimap
      this.bpmnModeler.get('minimap').open()
    },
    /* moddle扩展 */
    getModdleExtensions () {
      let moddleExtensions = {}
      if (this.product === 'flowable') {
        moddleExtensions = {
          flowable: flowableModdle
        }
      }
      if (this.product === 'activiti') {
        moddleExtensions = {
          activiti: activitiModele
        }
      }
      return moddleExtensions
    },
    /* 创建 */
    async createNewDiagram () {
      try {
        await this.bpmnModeler.importXML(this.xml || xmlStr).catch(err => {
          this.$message.error('导入失败')
        })
        this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
        await this.saveXML()
        this.success()
      } catch (err) {
        console.log(err)
      }
    },
    success () {
      this.addModelerListener()
      this.addEventBusListener()
    },
    // 监听 modeler
    addModelerListener () {
      const bpmnjs = this.bpmnModeler
      const that = this
      // 这里我是用了一个forEach给modeler上添加要绑定的事件
      const events = [
        'shape.added',
        'shape.move.end',
        'shape.removed',
        'connect.end',
        'connect.move'
      ]
      events.forEach(function (event) {
        that.bpmnModeler.on(event, e => {
          console.log('[addModelerListener]', event, e)
          var elementRegistry = bpmnjs.get('elementRegistry')
          var shape = e.element ? elementRegistry.get(e.element.id) : e.shape
          console.log('[addModelerListener]', shape)
        })
      })
    },
    /* 监听 */
    addEventBusListener () {
      // 监听 element
      const that = this
      const eventBus = this.bpmnModeler.get('eventBus')
      const modeling = this.bpmnModeler.get('modeling')
      const elementRegistry = this.bpmnModeler.get('elementRegistry')
      const eventTypes = ['element.click', 'element.changed']
      eventTypes.forEach((eventType) => {
        eventBus.on(eventType, (e) => {
          console.log(e)
          if (!e || e.element.type == 'bpmn:Process') return
          if (eventType === 'element.changed') {
            // that.elementChanged(e)
          } else if (eventType === 'element.click') {
            console.log('点击了element', e.element)
            const info = e.element ? elementRegistry.get(e.element.id) : e.shape
            this.SET_NODE_INFO(JSON.parse(JSON.stringify(info.businessObject)))
            // var shape = e.element ? elementRegistry.get(e.element.id) : e.shape
            // if (shape.type === 'bpmn:StartEvent') {
            //   modeling.updateProperties(shape, {
            //     name: '',
            //     isInterrupting: false,
            //     customText: '1111'
            //   })
            //   // modeling.setColor(shape, {
            //   //   fill: '#ff0000',
            //   //   stroke: null
            //   // })
            // }
          }
        })
      })
    },
    initEvent () {
      const eventBus = this.bpmnModeler.get('eventBus')
      eventBus.on('selection.changed', e => {
        this.elementSelector = e.newSelection
      })
    },

    updateXml (xml) {
      this.xml = xml
      this.createNewDiagram()
    },

    updateScale (value) {
      this.scale = value
    },

    getCurDiagram () {
      return this
    },

    async saveXML () {
      const res = await this.bpmnModeler.saveXML({ format: true })
      this.xml = res.xml.toString()
    },

    mirrorCodeChange (instance, changeObj) {
      this.xml = instance.getValue()
    }
  }
}
</script>

<style lang="less" scoped>
.bpmn-container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 95px);
  .canvas-container {
    display: flex;
    height: 100%;
  }

  .canves {
    height: 100%;
    width: 100%;
  }

  .properties {
    //overflow-y: auto;
    position: relative;
    width: 0px;
    flex: none;
    border-left: solid 1px #ccc;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    outline: none;
    background: #f8f8f8;
    &.open {
      width: 350px;
    }

    .toggle {
      position: absolute;
      left: -30px;
      top: 50%;
      background: #f8f8f8;
      padding: 7px 10px;
      transform: rotate(-90deg);
      white-space: nowrap;
      font-size: 13px;
      border: solid 1px #ccc;
      border-bottom: none;
      border-radius: 2px 2px 0 0;
      transform-origin: top left;
      z-index: 10;
      cursor: pointer;
      user-select: none;
    }

    .panel {
      border-left: 1px solid #ccc;
      overflow-y: auto;
      /deep/.bpp-properties-panel {
        height: 100%;
      }
    }
  }
}

.bottom-container {
  z-index: 9;
  position: absolute;
  bottom: 10px;
  left: 10px;
}

/deep/.CodeMirror {
  height: calc(100vh - 95px);
}
</style>

<style lang="less">
.bjs-powered-by {
  display: none;
}
</style>
