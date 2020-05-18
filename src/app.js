require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const movies = require('./moviestore')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    next()
  })

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.get('/movie', function GetMovie(req, res) {
  let res = movies;

  if (req.query.genre) {
    res = res.filter(movie =>
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    )
  }

  if (req.query.country) {
    res = res.filter(movie =>
      movie.country.toLowerCase().includes(req.query.country.toLowerCase())
    )
  }

  if (req.query.avg_vote) {
    res = res.filter(movie =>
      Number(movie.avg_vote) >= Number(req.query.avg_vote)
    )
  }

  res.json(response)
})

app.use((error, req, res, next) => {
    let message;
    if (NODE_ENV === 'production') {
        message = 'Server error';
    } else {
        console.log(error);
        message = error.message;
    }

    res.status(500).json({ error: message })
});

module.exports = app