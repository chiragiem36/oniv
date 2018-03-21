// const ObjectId = require('mongodb').ObjectId
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const router = require('express').Router()
// const formidable = require('formidable')
// const fs = require('fs')
// const path = require('path')
// const root = __dirname
// const request = require('request')
const qs = require('querystring')
const passKey = '9aIkpJ5UdL+V73h9zoVNPb5LAEeRMiPVucw0q+cYJXK6wyOO+0VzkXR+w6mmU'
// const ep = require('node-xlsx')

const conn = require('./blockchain').conn
const driver = require('bigchaindb-driver')

const mongo = require('./db.js')

let db

const dbCheck = setInterval(() => {
  const x = mongo.db()
  if (x && x !== undefined && x !== null) {
    db = x
    studentsId = db.collection('userId')
    clearInterval(dbCheck)
  }
}, 300)

router.get('/search/:filters', (req, res) => {
	const filters = qs.parse(req.params.filters)
	db.collection('studentIds').findOne({_id: filters.student}, {userId: 1}, (err, item) => {
		if (!err && item !== null) {
			conn.searchAssets(item.userId).then((asset) => {
				res.status(200)
				res.json({assets: asset})
			})
		}
	})
})

module.exports = router
