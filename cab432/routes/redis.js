const express = require("express");
const responseTime = require("response-time");
const axios = require("axios");
const redis = require("redis");
const router = express.Router();
require('dotenv').config();

const redisClient = redis.createClient(
  // {
  //   url: "redis://naokiredis.km2jzi.ng.0001.apse2.cache.amazonaws.com:6379"
  // }
);

(async () => {
  try {
    await redisClient.connect();
  } catch(err) {
    console.log(err);
  }
})();

async function checkRedis(md5) {
  //console.log("redis md5: ", md5);
  const result = await redisClient.get(md5);
  console.log("Adding hash to redis");
  
  if(result == null) 
  {
    console.log("There is no matched data");
    await redisClient.setEx(md5, 3600, "true")
    return false;
  }else{
    console.log("matched data",result)
    return true;
  }
}

router.get('/', async (req, res) => {

    const query = req.query.hash;
      
    const result = await redisClient.get(query);
    if (result) {
      res.json({hashExists: true});
    } else {
      console.log("Adding hash to redis");
      await redisClient.setEx(query, 3600, "true");
      res.json({hashExists: false});
    }
});

router.post('/', (req, res) => {
  console.log("Redis now");
})

module.exports =checkRedis;
