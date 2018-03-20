console.log('\x1b[32m%s\x1b[0m', 'Loading test server ...')

const IoFromAppJs = require('./../app.js')

let io

const getIo = setInterval(() => {
  const x = IoFromAppJs.io()
  if (x !== undefined && x !== null) {
    io  = x
    clearInterval(getIo)
  }
}, 1)

const request = require('request')
const time = require('./time.js')
const driver = require('bigchaindb-driver')

const API_PATH = "http://localhost:9984/api/v1/"

const conn = new driver.Connection(API_PATH)

let testColl
let studentColl
let classesCol

let tempAns = {}
let fT = {}

let activeTests = new Map()
let startTime = new Map()
let timeEsclaped = new Map()
let reTest = new Map()

let location
if(process.env.NODE_ENV === "development"){
  location = 'http://localhost'
} else {
  location = 'http://oniv.in'
}

const mongo = require('./../routes/db.js')

let db

const dbCheck = setInterval(() => {
  const x = mongo.db()
  if (x && x !== undefined && x !== null) {
      clearInterval(dbCheck)
      db = x
      testColl = db.collection('activeTests')
      studentColl = db.collection('students')
      classesCol = db.collection('classes')

      testColl.find().toArray((err, items2) => {

        if (items2.length > 0) {
          for (let n = 0; n < items2.length; n++) {
            const data = items2[n]
            activeTests.set(data._id, data)
            timeEsclaped.set(data._id, data.time)
          }
          console.log('\x1b[33m%s\x1b[0m', 'Active e-tests loaded')
        } else {
          console.log('\x1b[33m%s\x1b[0m', 'No active test Found')
        }

      })
    }
  }, 10)

const serverRequest = function(res){
  request(this,function(err,resp,body){
    if(!err && resp.statusCode === 200){
      res.status(200)
      res.end()
    } else {
      console.error(err)
      res.status(503)
      res.end()
    }
  })
}

const socketServer = require('./main.js');
const socketId = socketServer.socketId
const userId = socketServer.userId

console.log('\x1b[33m%s\x1b[0m', 'loading script to check if student is not-active')
  setInterval(() => {
      const t = time.getTime()

      if (fT.hasOwnProperty(t)) {
        Object.keys(fT[t]).forEach((x) => {

          if (!socketServer.socketId.hasOwnProperty(x)) {

            delete fT[t][x]

            const data = activeTests.get(x)
            data.answers = tempAns[x]
            data.tt = Number(data.duration)*60
            data.time = new Date()

            testColl.remove( { _id: x } )
            classesCol.update( { _id: data.batch }, { $set: { ['testsFinished.' + data.test + '.' + data._id] : true}})
            activeTests.delete(x)

            checkAnswers(data, null)
          }
        })
      }

    }, 500)

function testApp (socket) {

  socket.on('check activeTests', (data) => {

    let o = {}
    const isActiveTest = activeTests.has(data._id)

    if ( isActiveTest || ( isActiveTest && reTest.has(data._id))) {
      o.active = true
      o.test = activeTests.get(data._id)
      socket.emit('check activeTestsResponse', o)
    } else {

      o.active = false
      
      if (data.hasOwnProperty('test')) {
        conn.searchAssets(data._id).then((assets) => {

          let n = 0

          assets.forEach((x) => {
            if (x.data.test === data.test) {
              n++
              o.taken = true
              o.result = {
                result: x.data.result,
                time: x.data.time,
                tt: x.data.tt,
                online: x.data.online
              }
              conn.searchMetadata(x.id).then((meta) => {
                // console.log(o)

                socket.emit('check activeTestsResponse', o)

              })
            }

          })

          if ( n === 0) {
              o.taken = false
              socket.emit('check activeTestsResponse', o)
            }

        })

      } else {
        socket.emit('check activeTestsResponse', o)
      }
    }

  })

  socket.on('test taken', (data) => {

    conn.searchAssets(data._id).then((assets) => {

          const o = {etests: {}}

          if (assets.length > 0) {
            assets.forEach((x) => {
              o.etests[x.data.test] = x.data
            })

            o.status = true

            socket.emit('test taken', o)
          } else {
            socket.emit('test taken', {
              status: false
            })
          }

        })

    // studentColl.findOne( { _id: data._id }, { 'etests': 1}, (err, item) => {
    //   if (!err && item !== null && item.hasOwnProperty('etests')) {
    //     const o = item
    //     o.status = true
    //     socket.emit('test taken', o)
    //   } else {
    //     socket.emit('test taken', {
    //       status: false
    //     })
    //   }
    // })
  })

  socket.on('start test', (data) => {

    if (data.retake === false) {
      console.log('\x1b[32m%s\x1b[0m', data._id + ', started e-Test - ' + data.test)
      activeTests.set( data._id, data)
    } else {
      console.log('\x1b[35m%s\x1b[0m', data._id + ', resuming test ' + data.test)
    }

    if (!fT.hasOwnProperty(data.finish)) {
      fT[data.finish] = {}
    }

    fT[data.finish][data._id] = true

    testColl.insert( data ).then(() => {
      data.status = true
      socket.emit('test initiated', data)
    }).catch((err) => {
      console.log(err);
    })
  })

  socket.on('changed answers', (data) => {
    console.log('changed', data)
      tempAns[data._id] = data.answers

  })

  socket.on('check saved answers', (data) => {

    let answers

    console.log('\x1b[33m%s\x1b[0m', data._id + ', requested saved answers')

    if (tempAns.hasOwnProperty(data._id)) {
      answers = tempAns[data._id]
    } else {
      answers = null
    }

    console.log(answers, 'saved ans')

    socket.emit('saved answers', {
      answers
    })
  })

  socket.on('choices', (data) => {
    conn.searchMetadata(data._id).then((meta) => {
      meta.forEach((x) => {
        if (x.metadata.test === data.test) {
          socket.emit('choices', x.metadata.choices )
        }
      })
    })
  })

  socket.on('show correct answers', (data) => {
    db.collection('classes').findOne( {_id: data.batch}, {['answers.' + data.test]: 1}, (err, item) => {
      if (!err) {
        socket.emit('correct answers', item.answers[data.test] )
      }
    })
  })

  socket.on('end test', (data) => {
    console.log('ending test')
    if (data.ended) {

      if (activeTests.has(data._id)) {
        delete fT[activeTests.get(data._id).finish][data._id]
      }

      testColl.remove( { _id: data._id } )
      classesCol.update( { _id: data.batch }, { $set: { ['testsFinished.' + data.test + '.' + data._id] : true}})
      activeTests.delete(data._id)

      socket.emit('test ended', {
        status: true
      })
      console.log('test ended')
    }
  })

  socket.on('retake test', (data) => {
    reTest.set( data._id, data)

    socket.emit('retake added', {
      status: true
    })
  })

  socket.on('resume test', (data) => {
    activeTests.set(data._id, data)
    testColl.update({ _id: data._id }, data, true)
    const o = activeTests.get(data._id)
    o.status = true
    socket.emit('test resumed', o)
  })

  socket.on('answer', (data) => {

    if (data.retake === false) {

      checkAnswers(data, socket)
    }
  })
}

function checkMcq (raw, ans) {

    let att = 0
    let correct = 0

    raw.forEach((ques, i) => {

      if (ques.length > 0) {

        att++

        const c = ques.filter((o) => {

          if (ans[i].indexOf(o) > -1) {
            return true
          } else {
            return false
          }

        })

        if (c.length === ans[i].length && ans[i].length > 0) {
          correct++
        }
      }

    })

    return {
      att, correct
    }

  }

  function checkMatch(raw, ans) {
    let att = 0
    let correct = 0

    raw.forEach((ques, q) => { //loop through each question

      let rowChk = 0
      let touched = 0

      ques.forEach((row, r) => {  // loop through each row of question
        
        const rx = row.filter((col) => {  // filter through each colomn of row, to get array of correct selected option
          if (ans[q][r].indexOf(col) > -1) {
            return true // if col value if in corres. row of correct answers array, option checked is right
          } else {
            return false // else not
          }
        })

        if (row.length > 0) { // if length of newly formed array is greated than 0, then row is attempted
          touched++
        }

        if (rx.length === ans[q][r].length) { // if length of array of correct options and that of corres. row is equal, the row is correct
          rowChk++
        }
      })

      if (touched > 0) { // if row touched is greater than 1. then the question is attempted
        att++
      }

      if (rowChk === ques.length) {  // if total row correct in a question is equal to length of question array, then this attempt is correct
        correct++
      }
    })

    return {
      att, correct
    }
  }

  function checkInteger (raw, ans) {
    console.log(raw, ans)
    let att = 0
    let correct = 0

    raw.forEach((q, i) => {

      if (q !== undefined && q !== null && q !== '') {

        att++

        if (q == ans[i]) {
          correct++
        }

      }

    })

    return {
      att, correct
    }
  }

function checkAnswers(data, socket) {

  console.log(data, 'answers data')

  let score = 0
      classesCol.findOne( { _id: data.batch }, {['answers.' + data.test]: 1}, (err, item) => {
        if (!err) {
          let checkedAnswers = {}
          let attempted = 0
          let correct = 0

          const rawAnswers = data.answers
          delete tempAns[data._id]
          const answers = item.answers[data.test]

          Object.keys(rawAnswers).forEach((p) => {
            const part = rawAnswers[p]
            checkedAnswers[p] = {}
            // answers[p] = {}

            Object.keys(part).forEach((s) => {
              
              checkedAnswers[p][s] = {}

              switch (s) {
                case 'mcq':
                  const cMcq = checkMcq(part[s], answers[p][s])
                  checkedAnswers[p][s] = cMcq
                  attempted += cMcq.att
                  correct += cMcq.correct
                  break

                case 'match':
                  const cMa = checkMatch(part[s], answers[p][s])
                  checkedAnswers[p][s] = cMa
                  attempted += cMa.att
                  correct += cMa.correct
                  break

                case 'integer':
                  const cInt = checkInteger(part[s], answers[p][s])
                  checkedAnswers[p][s] = cInt
                  attempted += cInt.att
                  correct += cInt.correct
                  break
              }

            })

          })

          const incorrect = attempted - correct

          console.log(checkedAnswers, 'checked answers')
          console.log('Attempted - ' + attempted + ', Correct - ' + correct)

          studentColl.findOne( { _id: data._id }, { ['etests.' + data.test]: 1}, (err, item) => {
            if (!err) {
              if (!item.hasOwnProperty('etests') || !item.etests.hasOwnProperty(data.test)) {
              
              if (socket !== null ) {

                socket.emit('answers checked', {
                  status: true,
                  result: checkedAnswers,
                  time: data.time,
                  tt: data.tt,
                  isRetest: false
                })

              }

                studentColl.update( { _id: data._id }, {
                  $set: {
                    ['etests.' + data.test ]: {
                      result: checkedAnswers,
                      time: data.time,
                      tt: data.tt,
                      online: true
                    },
                    ['choices.' + data.test]: data.answers
                  }
                })

                // studentColl.findOne( { _id: data._id}, { name: 1, parent1:1, parent2:1, sn:1}, (err, item) => {
                //   if (!err && item !== null) {
                    
                //     const mo = []
                //     if (item.sn && item.sn.toString().length === 10) {
                //       mo.push(item.sn)
                //     }
                //     if (item.parent1 && item.parent1.toString().length === 10) {
                //       mo.push(item.parent1)
                //     }
                //     if (item.parent2 && item.parent2.toString().length === 10) {
                //       mo.push(item.parent2)
                //     }
                //     const o = {
                //       sn: {
                //         name: item.name,
                //         _id: item._id
                //       },
                //       testInfo: {
                //         id: data.test,
                //         date: data.date
                //       },
                //       dt: {
                //         correct,
                //         incorrect
                //       },
                //       mo,
                //       sender: 'MSUHAG'
                //     }

                //     request({
                //       url: location + '/api/sendsms/scores/test=online',
                //       body: o,
                //       json:true,
                //       method:'POST'
                //     }, (err, resp, body) => {
                //       if (err) {
                //         console.log(err)
                //       }
                //     })

                //   }
                // })

              } else {
                
                if (socket !== null) {
                  socket.emit('answers checked', {
                    status: true,
                    result: {
                      correct,
                      incorrect,
                      tt: data.tt,
                      time: new Date()
                    },
                    isRetest: true
                  })
                }
              }

              const meta = {
                              choices: data.answers,
                              test: data.test,
                              publicKey: data._id
                            }

              const asset = {
                              test: data.test,
                              finished: data.time,
                              time: new Date(),
                              retest: false,
                              publicKey: data._id,
                              result: checkedAnswers,
                              time: data.time,
                              tt: data.tt,
                              online: true
                            }

              const tx = driver.Transaction.makeCreateTransaction(
                  asset,
                  meta,
                  [ driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(data._id)) ],
                  data._id
                )

              db.collection('studentIds').findOne({userId: data._id}, {privateKey: 1}, (err, item) => {
                const txSigned = driver.Transaction.signTransaction(tx, item.privateKey)
                conn.postTransaction(txSigned)
              })
            }
          })
        }
      })
}

module.exports = testApp
