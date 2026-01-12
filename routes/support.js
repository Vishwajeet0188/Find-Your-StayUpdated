const express = require("express");
const router = express.Router();

router.get("/GetInTouch",(req,res) => {
    res.render("GetInTouch");
})

module.exports = router;