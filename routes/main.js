const express = require('express');
const User = require('../models').User;
const Vacation = require('../models').Vacation;
const cmmn = require('../public/script');
const router = express.Router();

//인덱스 페이지 로딩
router.get('/', (req, res)=> {
  console.log('index router');
  res.render('index',{
    title: '휴가 신청 시스템',
    msg: ''
  });
});

/* 
 * 로그인 view
 */
router.get('/userInfo/login', (req, res)=>{
  res.render('userInfo/login', {
    title: '로그인'
  });
});

/* 
 * 로그인 router
 */
router.post('/userInfo/login/act', async(req, res, next)=>{
  console.log('login act router');
  try {
    const obj = req.body;
    const users = await cmmn.selectUser(obj);
    if(!users){
      const resultInfo = { 
        status: 404, 
        statusMsg: 'Not Found',
        msg: '사용자 정보가 존재하지 않습니다.' 
      }
      return res.send(resultInfo);
    }else{
      const resultInfo = {
        status: 200, 
        statusMsg: 'OK',
        msg: '사용자 정보 조회에 성공하였습니다.',
        result: users
      }
      req.session.business_num = users.business_num;
      req.session.user_name = users.name;
      req.session.remain_day = users.remain_day;
      return res.send(resultInfo);
    }
  } catch(error){
    console.log(error);
    next(error);
  }
})


/**
 * 게스트 ID 생성
 */
router.get('/userInfo/addUser', async(req, res, next)=>{
  console.log('add user');
  try{
    await User.create({
      name: '김영미',
      password: 'cactus1234',
      business_num: '2010249221'
    });
    return res.redirect('/');
  }catch(error){
    console.log(error);
    next();
  }
})
module.exports = router;