const express=require('express');
const router=express.Router();


router.use('/', require('../routes/eventRoutes') );
router.use('/', require('../routes/jobRoute') );
router.use('/', require('../routes/jobApplicationRoute') );
router.use('/', require('../routes/employeeRoute'));
router.use('/', require('../routes/feedbackRoute'));

module.exports=router;