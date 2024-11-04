const express=require('express');
const router=express.Router();


router.use('/', require('../routes/eventRoutes') );
router.use('/', require('../routes/jobRoute') );


module.exports=router;