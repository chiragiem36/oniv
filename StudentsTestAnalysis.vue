<template>
  <div v-if="!loading">
  	<div class="row" v-if="test">
              <span class="col-xs-4 offset-xs-1 bg-grey-3 text-grey-9" style="padding-top: 10px; padding-bottom: 10px; border: solid 1px rgb(180, 180, 180);">
                <span style="font-size: 18px">Test ID - {{ test.id }}</span>
              </span>
              <span class="col-xs-4 offset-xs-1 bg-grey-3 text-grey-9" style="padding-top: 10px; padding-bottom: 10px; border: solid 1px rgb(180, 180, 180);">
                <span style="font-size: 18px">Test name - {{ test.name }}</span>
              </span>
            </div>
  	<div class="row bg-white" style="margin-top: 30px">
          <div class="col-xs-12" style="overflow-y: auto;" :style="{height: height2}">
            <div class="row" style="height: 100%; overflow-y: auto">
              <div class="col-xs-12">
                <div v-if="test && result" class="row justify-center text-grey-7" style="font-size: 14px">
                  <span class="col-xs-10 text-center" style="font-size: 13px;margin-bottom: 20px">
                    student wrote this test on - 
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
<!-- 
                  <div class="col-xs-10 text-grey-9" style="font-size: 18px;">
                    <q-btn color="blue" v-if="!showDetails" @click="showDetails = !showDetails">show details</q-btn>
                    <q-btn v-else color="red" @click="showDetails = !showDetails">hide details</q-btn>
                  </div> -->

                  <div class="col-xs-12">
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

                </div>
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
  </div>
</template>

<script>

let domain
    if (process.env.NODE_ENV) {
      domain = 'http://localhost:8000'
    } else {
      domain = window.origin
    }

import store from './../../store.js'
import router from './../../router.js'

export default {
  data () {
    return {
    	loading: true,
    	showDetails: false
    }
  },
  created () {
  	if (!store.state.selectedBatch) {
  		
  		const params = this.$route.params
    	const selectedBatch = params.sc + '/' + params.bt + '/' + params.sec
  		
  		this.$http.get(domain + '/coaching/batch/batchinfo/requestor=admin&lookfor=' + encodeURIComponent(selectedBatch) + '/etests=1' ).then((res) => {

  			delete res.body._id

  			store.commit('set', {
  				el: 'selectedBatch',
  				value: res.body
  			})

  			this.loading = false

	  	}).catch((err) => {
	  		console.log(err)
	  	})
  	} else {
  		this.loading = false
  	}
  },
  computed: {
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
  	height4 () {
      return (window.innerHeight - 140)*.1 + 'px'
    },
  	height2 () {
  		return window.innerHeight - 200 + 'px'
  	},
  	test () {
  		if (store.state && store.state.hasOwnProperty('selectedBatch')) {
  			return store.state.selectedBatch.etests.live[this.$route.params.testId]
  		}
  		return false
  	},
  	result () {
  		if (store.state.selectedBatch.etests) {
  			return store.state.studentData.etests[this.$route.params.testId]
  		}
  		return false
  	}
  }
}
</script>

<style>
</style>
