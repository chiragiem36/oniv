<template>
  <div class="row">
  	<div class="col-xs-12">
  		<div class="row">
              <span class="col-xs-6 offset-xs-3 text-grey-9 bg-grey-3" style="padding-top: 10px; padding-bottom: 10px; border: solid 1px rgb(180, 180, 180); ">
                <span style="font-size: 18px">Electronic-Test record</span>
              </span>
            </div>
  		<div v-if="etests" class="row items-center" style="margin-top: 30px; padding-top: 7px; padding-bottom: 7px; border-bottom: solid 1px rgb(200, 200, 200)">
	  		<span class="col-xs-4" @click="order = !order">
	  			<q-btn icon-right="swap vert" flat>Test Taken</q-btn>
	  		</span>
	  		<span class="col-xs-4">
	  			Test ID
	  		</span>
	  		<span class="col-xs-4">
	  			Test Name
	  		</span>
	  	</div>
	  	<div v-if="etests" class="row">
	  		<div class="col-xs-12" style="overflow-y: auto;max-height: 380px">
	  			<div class="row bg-grey-3" v-for="(etest, id) in etests" style="padding-top: 7px; padding-bottom: 7px; border: solid 1px rgb(200, 200, 200);border-top: none" @click="$router.push('view=test-analysis&id=' + id)">
	  				<span class="col-xs-4 text-grey-7">{{ new Date(etest.time).toDateString() }}</span>
	  				<span class="col-xs-4">
	  					{{ id }}
	  				</span>
	  				<span v-if="testNames" class="col-xs-4">
	  					{{ testNames[id].name }}
	  				</span>
	  				<!-- <span class="col-xs-8 offset-xs-2" style="margin-top: 10px">
	  					time taken - {{ etest.tt }} sec
	  				</span> -->
		  		</div>
		  	</div>
		</div>
		<div v-else class="row items-center" style="height: 300px">
			<span class="col-xs-8 offset-xs-2" style="font-size: 18px">
				no attempted etests found in record
			</span>
		</div>
  	</div>
  </div>
</template>

<script>

import store from './../../store.js'
import router from './../../router.js'

export default {
  data () {
    return {}
  },
  computed: {
  	testNames () {
  		if (store && store.state.hasOwnProperty('selectedBatch') && store.state.selectedBatch.hasOwnProperty('etests')) {
  			return store.state.selectedBatch.etests.live
  		}
  		return false
  	},
  	etests () {
  		if (Object.keys(store.state.studentData.etests).length > 0) {
  			return store.state.studentData.etests
  		} else {
  			return false
  		}
  	}
  }
}
</script>

<style>
</style>
