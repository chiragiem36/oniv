<template>
  <div v-if="loaded">
    <!-- <div v-if="desktop" class="row bg-black items-center text-center" style="position: absolute; top: 0px; left: 0px;z-index: 1; font-size: 20px; height: 47px; width: 100%">
      <span class="col-xs-12 text-white">
        {{ timeLeft | toHrs }}
      </span>
    </div> -->
    <q-modal v-model="survey">
      <div class="row justify-center">
        <div class="col-xs-10 offset-xs-1">
          <div class="row" style="padding-top: 10px; padding-bottom: 10px">
            <span class="col-xs-12 text-grey-9" style="font-size: 24px">
              Survey
            </span>
          </div>
          <div class="row" style="padding-top: 10px; padding-bottom: 10px">
            <span class="col-xs-12 text-grey-7">
              In order to improve our platform and your experience, please take this survey, to let us know the issues you faced and your suggestions to make this platform better.
            </span>
          </div>
          <div class="row" style="padding-top: 10px; padding-bottom: 10px">
            <span class="col-xs-12 text-grey-7 text-right" @click="$router.push('/survey')">
              <q-btn color="primary" flat>Take me to the survey</q-btn>
            </span>
          </div>
        </div>
      </div>
    </q-modal>
    <div class="row text-center">
      <div class="col-sm-9">
        <template v-if="desktop || showResult" :style="{height: height2}">
          <div class="row bg-white" style="border-radius: 3px">
          <div class="col-xs-12" style="overflow-y: auto;" :style="{height: height2}">
            <div v-if="!testOn && showResult" class="row bg-grey-4" style="height: 100%; overflow-y: auto; border-right: solid 1px rgb(150, 150, 150)">
              <div class="col-xs-12">
                <div class="row justify-center text-grey-7" style="font-size: 14px" :style="{ 'margin-top': height4 }">
                  <span class="col-xs-10 text-center" style="font-size: 13px;margin-bottom: 5px">
                    test ID - 
                    <span class="text-grey-9">
                      {{ test.name }}
                    </span>
                  </span>
                  <span class="col-xs-10 text-center" style="font-size: 13px;margin-bottom: 20px">
                    test Name - 
                    <span class="text-grey-9">
                      {{ test.name }}
                    </span>
                  </span>
                  <span class="col-xs-10 text-center" style="font-size: 13px;margin-bottom: 20px">
                    You wrote this test on - 
                    <br><span class="text-grey-9">
                      {{ new Date(result.time).toDateString() + ', ' + new Date(result.time).toLocaleString().split(',')[1] }}
                    </span>
                  </span>

                  <div class="col-xs-6 col-sm-4" style="padding-top: 30px; margin-bottom: 30px; border-top: solid 1px rgb(200, 200, 200)">
                    <div class="row">
                      <span class="col-xs-8">Max. Score : </span>
                      <span class="col-xs-4 text-blue">{{ maxScore }}</span>
                    </div>
                    <div class="row" style="margin-top: 10px">
                      <span class="col-xs-8">Your total score : </span>
                      <span class="col-xs-4 text-green">{{ totalScore }}</span>
                    </div>
                    <div class="row" style="margin-top: 10px">
                      <span class="col-xs-8">Time taken : </span>
                      <span class="col-xs-4 text-grey">{{ (result.tt - (result.tt % 60))/60 }}min {{ (result.tt % 60) }}sec</span>
                    </div>
                  </div>

                  <div class="col-xs-10 text-grey-9" style="font-size: 18px;">
                    <q-btn color="blue" v-if="!showDetails" @click="showDetails = !showDetails">show details</q-btn>
                    <q-btn v-else color="red" @click="showDetails = !showDetails">hide details</q-btn>
                  </div>

                  <div class="col-xs-12" v-if="showDetails">
                    <div class="row justify-around">
                      <div class="col-sm-5 col-xs-10 bg-grey-2" v-for="(part, partName) in result.result" style="padding-top: 30px;padding-bottom: 30px;margin-top: 30px; border: solid 1px rgb(180, 180, 180); border-radius: 3px">
                        <span class="text-grey-8" style="font-weight: bold">{{ partName.toUpperCase() }}</span>
                        <div class="row items-center" v-for="(section, secName) in part" style="margin-top: 5px">
                          <span class="col-xs-6">
                            {{ secName.toUpperCase() }}
                          </span>
                          <span class="col-xs-6">
                            <span class="row text-right" style="margin-top: 10px">
                              <span class="col-xs-6 text-blue">Attempted -
                              </span>
                              <span class="col-xs-3 offset-xs-1 text-left">
                                {{ part[secName].att }}
                              </span>
                            </span>
                            <span class="row text-right" style="margin-top: 10px">
                              <span class="col-xs-6 text-green">
                                Correct - 
                              </span>
                              <span class="col-xs-3 offset-xs-1 text-left">
                                {{ part[secName].correct }} 
                              </span>
                            </span>
                            <span class="row text-right" style="margin-top: 10px">
                              <span class="col-xs-6 text-red">
                                Incorrect - 
                              </span>
                              <span class="col-xs-3 offset-xs-1 text-left">
                                {{ part[secName].att - part[secName].correct }} 
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span v-if="test.viewable" style="margin-top: 10px" class="col-xs-12 text-center">
                    <q-btn :disabled="new Date(test.viewable).valueOf() > Date.now()" color="primary" @click="download" flat>Download questions ( .pdf )</q-btn>
                  </span>

                  <span v-if="test.viewable && new Date(test.viewable) > Date.now()" style="margin-top: 5px; font-size: 12px" class="col-xs-12 text-grey-6 text-center">
                    <q-icon name="error" style="font-size: 20px" /> You can download questions only after {{ new Date(test.viewable).toLocaleDateString() + ', ' +  new Date(test.viewable).toLocaleTimeString() }}
                  </span>

                  <span style="margin-top: 30px" class="col-xs-12 text-center">
                    <q-btn color="secondary" @click="reTest" disabled>re-take test</q-btn>
                  </span>
                  <span style="margin-top: 30px; font-size: 12px" class="col-xs-12 text-grey-7 text-center">
                    <q-icon name="error" style="font-size: 20px" /> Re-Tests are not Available Yet
                  </span>
                  <div class="col-xs-12 text-grey-7 text-center" style="margin-top: 30px; font-size: 13px">
                    <span style="padding-top: 10px; padding-bottom: 10px; border-top: solid 1px rgb(170, 170, 170)">Note - Marks Scored in Re-Test will not be Stored.</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="!testOn && !showResult" class="row bg-grey-3 text-grey-7 items-center text-center" :style="{height: height2}" style="font-size: 12px;">
              <div class="col-sm-4 offset-sm-4 col-xs-10 offset-1">
                <div class="row">
                  <span class="col-xs-10 offset-xs-1">Test ID - <span class="text-grey-8">{{ test.id }}</span>
                  </span>
                  <span class="col-xs-10 offset-xs-1" style="margin-top: 5px">Test name - <span class="text-grey-8">{{ test.name }}</span>
                  </span>
              </div>
              <!-- <div class="row" style="margin-top: 20px">
                  <div class="col-xs-10 offset-xs-1">
                    <div class="row">
                      <span class="col-xs-8">Correct attempt - </span>
                      <span class="col-xs-4 text-green">{{ test.plus }}</span>
                    </div>
                    <div class="row" style="margin-top: 5px">
                      <span class="col-xs-8">Incorrect attempt - </span>
                      <span class="col-xs-4 text-red">{{ test.minus }}</span>
                    </div>
                  </div>
              </div> -->
              <div class="row" style="margin-top: 20px">
                  <div class="col-xs-10 offset-xs-1">
                    <!-- <div class="row">
                      <span class="col-xs-8">Total Questions - </span>
                      <span class="col-xs-4 text-blue">{{ test.length }}</span>
                    </div> -->
                    <div class="row" style="margin-top: 5px">
                      <span class="col-xs-8">Total duration - </span>
                      <span class="col-xs-4 text-black">{{ test.duration }} mins</span>
                    </div>
                  </div>
              </div>
              </div>
            </div>
            <canvas v-show="testOn && !showResult" ref="question" style="border-radius: 3px" />
            <q-select v-if="testOn" style="position: absolute; top: 40px; left: 10px" :options="pages" v-model="pageNum"></q-select>
            <div v-show="desktop && testOn" id="timer" class="text-center bg-blue-5" style="position: absolute; bottom: 70px; left: 20px; border-radius: 3px">
              <div class="">
                <q-btn id="prev" icon="arrow left" color="white" flat></q-btn>
                <q-btn id="next" icon="arrow right" color="white" flat></q-btn>
                <q-btn id="in" icon="zoom in" color="white" flat></q-btn>
                <q-btn id="out" icon="zoom out" color="white" flat></q-btn>
              </div>
            </div>
          </div>
          <!-- <div v-if="desktop" id="timer" class="row text-center" style="margin-top: 2px; border-radius: 3px">
          <div class="col-xs-10 col-sm-4 bg-secondary">
            <q-btn id="prev" icon="arrow left" color="white" flat></q-btn>
            <q-btn id="next" icon="arrow right" color="white" flat></q-btn>
            <q-btn id="in" icon="zoom in" color="white" flat></q-btn>
            <q-btn id="out" icon="zoom out" color="white" flat></q-btn>
          </div>
        </div> -->
        </div>
        </template>
        <template v-if="!desktop && !showResult">
          <div class="row bg-grey-3 items-center" :style="{height: height5}">
            <div class="col-xs-10 offset-1">
              <div class="row">
                <span class="col-xs-12 text-center text-grey-5" style="font-size: 32px">
                  <q-icon color="grey" name="error" style="font-size: 50px" /> WOOPS
                </span>
                <span class="col-xs-12 text-center text-grey-5" style="margin-top: 20px; font-size: 13px">
                  Electronic Tests are not Yet available for smartphone. We are working hard to make it work on your Smartphone
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="desktop" :style="{height: height - 58 + 'px'}" class="col-sm-3">
        
        <template v-if="sA">
          <answers-desktop></answers-desktop>
        </template>
        
        <template v-else>
          <div class="row bg-blue-8" style="padding-top: 5px; padding-bottom: 3px; margin-bottom: 2px;">
          <div class="col-xs-6 self-center text-black text-center">
            <span style="font-size: 24px">{{ test.duration | toHrs }}</span>
          </div>
          <div class="col-xs-6 text-white text-center">
            <q-btn class="text-white" :disabled="!testOn" @click="finish" flat>Finish</q-btn>
          </div>
        </div>
          <div class="row bg-blue-9 text-center" style="padding-top: 4px; padding-bottom: 3px">
            <span class="col-xs-12">...</span>
          </div>
          <div class="row items-center bg-blue-7" style="padding-left: 5px;" :style="{height: height - 172 + 'px'}">
            <div class="col-xs-12">
              <q-btn v-if="showResult" color="white" @click="showChoices" flat>show my answers</q-btn>
              <q-btn v-if="!showResult" color="red-7" @click="startTest">Start Test</q-btn>
            </div>
            <div v-if="showResult" class="col-xs-12">
              <div v-if="test.viewable" class="row">
                <span class="col-xs-12">
                  <q-btn :disabled="Date.now() < new Date(test.viewable).valueOf()" color="white" @click="showAnswers" flat>show correct answers</q-btn>
                </span>
              </div>
              <div v-if="Date.now() < new Date(test.viewable).valueOf()" class="row">
                <span class="col-xs-10 offset-xs-1 text-grey-5">
                  You can view correct answers only after {{ new Date(test.viewable).toLocaleDateString() + ', ' +  new Date(test.viewable).toLocaleTimeString() }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <q-btn v-if="!desktop && testOn" id="next" icon="description" color="green" @click="finish" style="position: absolute; bottom: 100px; right: 10px; z-index: 10">Finish</q-btn>
  </div>
</template>

<script>

let domain

if(process.env.NODE_ENV === 'development') {
  domain = 'http://192.168.43.210:8000'
} else {
  domain = window.origin
}

import { QSelect, QModal } from 'quasar'
import PDFJS from 'pdfjs-dist'
import AnswersDesktop from './AnswersDesktop.vue'
import store from './../../store.js'
import router from './../../router.js'
// import { QCheckbox, QInput, QField, QSelect } from 'quasar'

export default {
  components: {
    QSelect, 'answers-desktop': AnswersDesktop, QModal
  },
  filters: {
    toHrs (value) {
      if (value != '-- : --') {
        let sec = value % 60
        const totalMin = (value - sec) / 60
        let min = totalMin % 60
        let hour = (totalMin - min) / 60
        if (hour.toString().length === 1) {
          hour = '0' + hour
        }
        if (min.toString().length === 1) {
          min = '0' + min
        }
        if (sec.toString().length === 1) {
          sec = '0' + sec
        }
        return hour + ':' + min + ':' + sec
      } else {
        return value
      }
    }
  },
  mounted () {
    this.renderPdf()
  },
  created () {
    
    store.commit('setObj', {
      sA: false,
      goBack: false
    })

    this.$q.events.$on('finish', (data) => {
      this.finish()
    })
    this.$q.events.$on('jump to', (pageNum) => {
      if (this.pageNum == 0) {
        return
      }
      this.pageNum = Number(pageNum)
      this.toPage()
    })
    let answers = {}
    this.test.format.sections.forEach((x) => {
            answers[x.name] = {}

            if (x.hasOwnProperty('mcq') && x.mcq.total > 0) {
              answers[x.name].mcq = []
              for (var i = 0; i < x.mcq.total; i++) {
                answers[x.name].mcq.push([])
              }
            }


            if (x.hasOwnProperty('match') && x.match.total > 0) {
              answers[x.name].match = []
              for (var i = 0; i < x.match.total; i++) {
                answers[x.name].match.push([[],[],[],[],[]])
              }
            }

            if (x.hasOwnProperty('integer') && x.integer.total > 0) {
              answers[x.name].integer = []
              for (var i = 0; i < x.integer.total; i++) {
                answers[x.name].integer.push('')
              }
            }
          })

    store.commit('setObj', {
              answers
            })

    store.commit('setObj', {
      section: this.test.id
    })

    store.commit('setObj', {
      tl: Number(this.test.duration)*60
    })

    this.$q.events.$on('timer ended', () => {
      this.finish()
    })

    const that = this

    if (!store.state._id && !store.state.batch) {
      that.$http.get(domain + '/coaching/batch/requestor=student/filters/batch=1').then((res) => {
        if (res.status === 200) {
          store.commit('setObj', res.body)
        }
      }).then(() => {
        checkActiveTest()
      })
    } else {
      checkActiveTest()
    }

    function checkActiveTest () {
      // that.test = store.state.test
      that.tl = Number(that.test.duration)*60

      that.socket.emit('check saved answers', {
        _id: that.id
      })

      that.socket.on('saved answers', (data) => {
        let answers = {}
        console.log(that.test.format.sections, 'sections')
        if (data.answers === null) {
          console.log('no saved answers found')
          that.test.format.sections.forEach((x) => {
            answers[x.name] = {}

            if (x.hasOwnProperty('mcq') && x.mcq.total > 0) {
              answers[x.name].mcq = []
              for (var i = 0; i < x.mcq.total; i++) {
                answers[x.name].mcq.push([])
              }
            }

            if (x.hasOwnProperty('match') && x.match.total > 0) {
              answers[x.name].match = []
              for (var i = 0; i < x.match.total; i++) {
                answers[x.name].match.push([[],[],[],[],[]])
              }
            }

            if (x.hasOwnProperty('integer') && x.integer.total > 0) {
              answers[x.name].integer = []
            }

          })

          console.log(answers)

          that.answers = answers

        } else {
          console.log('saved answers found')
          answers = data.answers
        }

        store.commit('setObj', {
          answers
        })
      })

      that.loaded = true

      //check if a test is active
      that.socket.emit('check activeTests', {
        _id: that.id,
        test: that.test.id
      })

      //check for response any test is active. If active test, then whether that test and active test are same

      that.socket.on('check activeTestsResponse', (res) => {
        console.log('check check')
        if (res.active === true && res.test.test === that.test.id) {
          res.resumeTime = Date.now()
          
          store.commit('setObj', {
              sA: true
            })

          that.resumeTest(res)
        } else if (res.active === true && res.test.test != that.test.id && res.test.length > 0) {
          router.push('/tests/online')
        } else if (res.active === false && res.taken === true) {

          that.result = res.result
          that.showResult = true

          store.commit('set', 'bar', false)
        } else {
          store.commit('set', 'bar', false)
        }

      })
    }

  },
  data () {
    return {
      total: '-- : --',
      survey: false,
      showDetails: false,
      pages: [],
      pageNum: 1,
      options: [],
      loaded: false,
      retake: false,
      showResult: false,
      testOn: false,
      answers: {}
    }
  },
  watch: {
    'pageNum' () {
      this.toPage()
    }
  },
  methods: {
    download () {
      window.open('/questionpaper/batch=' + encodeURIComponent(store.state.batch) + '/' + this.test.id, 'blank')
    },
    syncAns () {
      this.socket.emit('changed answers', {
          _id: this.id,
          answers: this.answers
        })
    },
    renderPdf () {

      const that = this

      store.commit('setObj', {
        bar: true
      })
      let url = domain + '/fetchquestionpaper/' + this.test.filename

      let pdfDoc = null
          that.pageRendering = false
          that.pageNumPending = null
          that.scale = 1.5

      this.pdfDoc = pdfDoc

      let canvas = this.$refs.question
          that.canvas = canvas
      
      let ctx = canvas.getContext('2d');
          that.ctx = ctx

          document.getElementById('prev').addEventListener('click', that.onPrevPage);

          /**
           * Displays next page.
           */

          document.getElementById('next').addEventListener('click', that.onNextPage);

          document.getElementById('in').addEventListener('click', that.zoomIn)

          document.getElementById('out').addEventListener('click', that.zoomOut)

          PDFJS.getDocument(url).then(function(pdfDoc_) {
            that.pdfDoc = pdfDoc_;

            for (var i = 1; i <= that.pdfDoc.numPages; i++) {
              that.pages.push({
                label: i.toString(),
                value: i
              })
            }
            // Initial/first page rendering
            that.renderPage(that.pageNum);
          });

    },
    renderPage (num) {
            this.pageRendering = true

            this.pdfDoc.getPage(num).then((page) => {
              var viewport = page.getViewport(this.scale)
              this.canvas.height = viewport.height
              this.canvas.width = viewport.width

              const renderContext = {
                canvasContext: this.ctx,
                viewport
              }

              const renderTask = page.render(renderContext)

              renderTask.promise.then(() => {
                this.pageRendering = false
                if (this.pageNumPending !== null) {
                  this.renderPage(this.pageNumPending)
                  this.pageNumPending = null
                }
              })

            })
            store.commit('setObj', {
              bar: false
            })
          },
          queueRenderPage(num) {
            if (this.pageRendering) {
              this.pageNumPending = num;
            } else {
              this.renderPage(num);
            }
          },
          onPrevPage() {
            if (this.pageNum <= 1) {
              return;
            }
            this.pageNum--;
            this.queueRenderPage(this.pageNum);
          },
          onNextPage() {
            if (this.pageNum >= this.pdfDoc.numPages) {
              return;
            }
            this.pageNum++;
            this.queueRenderPage(this.pageNum);
          },
          toPage() {
            if (this.pageNum > this.pdfDoc.numPages) {
              return
            }
            this.renderPage(this.pageNum)
          },
          zoomIn() {
            if (this.scale >= 2) {
              return
            }
            this.scale = this.scale + 0.1
            this.renderPage(this.pageNum)
          },
          zoomOut() {
            if (this.scale <= .6) {
              return
            }
            this.scale = this.scale - 0.1
            this.renderPage(this.pageNum)
          },
    resumeTest (testInfo) {
      console.log('resuming test')
      let secn
      if (testInfo.hasOwnProperty('resumeTime')) {
        secn = Number(testInfo.resumeTime)
      } else {
        secn = Number(testInfo.test.initTime)
      }

      this.testOn =  true
      const time = Number(this.test.duration)*60 - Math.floor((Date.now() - secn)/1000)
      this.timeEsc = time
      if ( time > 0) {
        this.socket.emit('resume test', testInfo)

        this.socket.on('test resumed', (res) => {
          if (res.status) {
            this.testOn = true
            store.commit('setObj', {
              sA: true
            })

            this.$q.events.$emit('start timer', {
              time: res.test.initTime,
              duration: this.test.duration
            })

            store.commit('set', 'bar', false)
          }
        })
      }
    },
    startTest () {

      const iT = new Date().setMilliseconds(0)

      this.socket.emit('start test', {
        _id: this.id,
        test: this.test.id,
        initTime: iT,
        retake: this.retake,
        batch: store.state.batch,
        finish: iT + Number(this.test.duration)*60*1000
      })
      this.socket.on('test initiated', (res) => {
        if (res.status === true) {
          store.commit('setObj', {
            activeTest: res.test
          })

          this.syncAns()

          this.socket.emit('changed answers', {
            _id: this.id,
            answers: this.answers
          })

          this.testOn = true
          
          store.commit('setObj', {
              sA: true
            })

          store.commit('set', 'bar', false)
          
          this.$q.events.$emit('start timer', {
            time: res.initTime,
            duration: this.test.duration
          })

        }
      })
    },
    reTest () {
      this.socket.emit('retake test', {
        _id: this.id,
        test: this.test.id,
        initTime: Date.now()
      })

      this.socket.on('retake added', (res) => {
        this.retake = true
        this.startTest()
      })
    },
    finish () {
      if (this.testOn === true ) {
        store.commit('set', 'bar', true)
        this.testOn = false

        store.commit('setObj', {
              sA: false
            })

        store.commit('set', 'bar', true)
        this.socket.emit('end test', {
              ended: true,
              _id: this.id,
              batch: store.state.batch,
              test: this.test.id,
            })

        this.socket.on('test ended', (res) => {
          if (res.status) {
            store.commit('setObj', {
              activeTest: false
            })
            this.submitAnswers()
          }
        })
      }
    },
    submitAnswers () {
      this.$q.events.$emit('stop timer', true)
      store.commit('set', 'bar', true)

      console.log(this.answers, 'answers')
      
      this.socket.emit('answer', {
        _id: this.id,
        batch: store.state.batch,
        test: this.test.id,
        answers: store.state.answers,
        time: new Date(),
        retake: this.retake,
        batch: store.state.batch,
        tt: store.state.tt
      })

      this.survey = true

      this.socket.on('answers checked', (res) => {
        // window.location.reload()
        if (res.status && res.isRetest === true) {
          this.result = {
            time: res.time,
            tt: res.tt,
            result: res.result
          }
          this.showResult = true
        } else if (res.status === true && res.isRetest === false) {
          this.result = {
            time: res.time,
            tt: res.tt,
            result: res.result
          }
          this.showResult = true
        }
        store.commit('set', 'bar', false)
      })
    },
    showSheet () {
      store.commit('set', 'bar', true)
      this.socket.emit('end test', {
        ended: true,
        _id: this.id,
        test: this.test.id
      })

      this.socket.on('test ended', (res) => {
        if (res.status) {
          router.push('/test/' + this.test.id + '/answers')
        }
      })
    },
    showChoices () {
      this.socket.emit('choices', {
        _id: this.id,
        test: this.test.id
      })
      this.socket.on('choices', (res) => {
        store.commit('setObj', {
          answers: res,
          goBack: true
        })
        
        store.commit('setObj', {
              sA: true
            })
      })
    },
    showAnswers () {
      if( Date.now() >= new Date(this.test.viewable).valueOf()) {
        this.socket.emit('show correct answers', {
          batch: store.state.batch,
          test: this.test.id
        })

        this.socket.on('correct answers', (res) => {
          store.commit('setObj', {
            answers: res,
            goBack: true
          })
          
          store.commit('setObj', {
              sA: true
            })
        })
      }
    }
  },
  computed: {
    sA () {
      return store.state.sA
    },
    totalScore () {
      let score = 0

      this.test.format.sections.forEach((p) => {
        Object.keys(p).forEach((s) => {
          if ( s !== 'name' && s !== 'page') {
            if (this.result.result[p.name] && this.result.result[p.name][s]) {
              const x = this.result.result[p.name][s]
              score += x.correct*p[s].plus
              score -= (x.att - x.correct)*p[s].minus
            }
          }
        })
      })

      this.total = score

      return this.total
      
    },
    maxScore () {

      let max = 0

      this.test.format.sections.forEach((p) => {
        Object.keys(p).forEach((s) => {
          if (s !== 'name' && s !== 'page') {
            max += p[s].total*p[s].plus
          }
        })
      })
      return max
    },
    tt () {
      return store.state.tt
    },
    socket () {
      return store.state.sockets.test
    },
    id () {
      return store.state._id
    },
    test () {
      return store.state.test
    },
    height () {
      return window.innerHeight - 5
    },
    height2 () {
      if (this.desktop) {
        return window.innerHeight - 110 + 'px'
      } else {
        return window.innerHeight - 110 + 'px'
      }
    },
    height4 () {
      return (window.innerHeight - 140)*.1 + 'px'
    },
    height5 () {
      return window.innerHeight - 110 + 'px'
    },
    desktop () {
      if (window.innerWidth >= 720) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style>
</style>
