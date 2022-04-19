const express = require('express');
const User = require('../models').User;
const Vacation = require('../models').Vacation;
const cmmn = require('../public/script');
const router = express.Router();

/* 
 * 휴가 정보 조회 view 
 */
router.get('/main', (req, res)=> {
  console.log('vacation main router');
  res.render('vacation/main', {
    title: '휴가 정보 조회',
    user_name: req.session.user_name,
    remain_day: req.session.remain_day
  });
})

/* 
 * 휴가 정보 조회 router
 */
router.post('/main/act', async (req, res)=> {
  console.log('vacation main get router');
  const obj = req.body;
  //TODO: 임시...테스트로...세션 ㅠㅠ
  obj.business_num = req.session.business_num;
  obj.password = 'cactus1234';
  //end
  const users = await cmmn.selectUser(obj);
  const vacations = await cmmn.selectVacation(obj);
  if(!users){
    const resultInfo = { 
      status: 404, 
      statusMsg: 'Not Found',
      msg: '사용자 정보가 존재하지 않습니다.' 
    }
    return res.send(resultInfo);
  }
  if(!vacations || vacations.length===0){
    const resultInfo = { 
      status: 404, 
      statusMsg: 'Not Found',
      msg: '신청한 휴가 정보가 존재하지 않습니다.' 
    }
    return res.send(resultInfo);
  }
  if(users && vacations){
    const resultInfo = {
      status: 200, 
      statusMsg: 'OK',
      msg: '휴가 정보 조회에 성공하였습니다.',
      result: {users, vacations}
    }
    
    return res.send(resultInfo);
  }
})

/* 
 * 휴가 신청정보 입력 view
 */
router.get('/submit', (req, res)=> {
  console.log('vacation submit view router');
  res.render('vacation/submit', {
    title: '휴가 신청'
  });
})

/*
 * 휴가 신청정보 입력 router
 */
router.post('/submit/act', async (req, res, next)=>{
  console.log('vacation submit act router');
  try{
    const obj = req.body;
    const vacation_type = obj.vacation_type;
    const start_date = obj.start_date;
    let end_date = obj.end_date;

    if(start_date===''){
      const resultInfo = {
        status: 400,
        statusMsg: 'Bad Request',
        msg: '휴가 시작일은 필수값입니다.',
      }
      return res.send(resultInfo);
    }
    if(vacation_type>=1 && end_date===''){ 
      const resultInfo = {
        status: 400,
        statusMsg: 'Bad Request',
        msg: '연차를 신청한 경우 휴가 종료일은 필수값입니다.',
      }
      return res.send(resultInfo);
    }

    //반차, 반반차의 경우 시작일=종료일로 변환
    end_date = end_date === '' ? start_date : end_date;

    //신청일이 오늘 기준보다 미래에 있는지 확인
    const today = new Date();
    today.getHours(0,0,0,0);
    if(start_date < today){
      const resultInfo = {
        status: 400,
        statusMsg: 'Bad Request',
        msg: '오늘보다 이전 날짜로 휴가를 신청할 수 없습니다.',
      }
      return res.send(resultInfo);
    }

    //시작일이 종료일보다 빠르거나 같은지 확인
    if(start_date > end_date){
      const resultInfo = {
        status: 400,
        statusMsg: 'Bad Request',
        msg: '시작일은 종료일보다 늦을 수 없습니다.',
      }
      return res.send(resultInfo);
    }

    //코멘트의 최대 길이 계산
    const comment_length = obj.comment.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g,"$&$1$2").length;
    console.log('comment_length: '+comment_length);
    if(comment_length>200){
      const resultInfo = {
        status: 400,
        statusMsg: 'Bad Request',
        msg: '비고란은 200바이트 이내로 작성하여 주세요.',
      }
      return res.send(resultInfo);
    }
    
    //휴가 기간 계산
    let strDate = new Date(start_date);
    let endDate = new Date(end_date);
    strDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    let vacation_day = endDate.getTime() - strDate.getTime();
    vacation_day = Math.ceil(vacation_day / (1000 * 3600 * 24))+1;
    
    let tempDate=new Date(start_date);
    //휴가 기간 중 주말 제외 계산
    while(true){
      if(tempDate>endDate){
        break;
      }else{
        let target = tempDate.getDay();
        if(target===0 || target===6){
          vacation_day--;
        }
        tempDate.setDate(tempDate.getDate()+1);
      }
    }
    console.log('총 휴가일수는 '+vacation_day);
  
    if(vacation_day===0){
      console.log('정말 이 날짜에 휴가를 내실건가요?');
    }

    //잔여휴가기간 계산
    const userInfo = await cmmn.selectUser(obj);
    let remainDay = userInfo.remain_day;
    const type = parseFloat(obj.vacation_type);
    const day = parseInt(vacation_day);
    const scheduleDay = remainDay - (type * day);

    // 현재 남은 휴가일로 휴가를 쓸 수 있는지 확인
    if(remainDay < scheduleDay){
      const resultInfo = {
        status: 400,
        statusMsg: 'Bad Request',
        msg: '남은 휴가 일수 내로 휴가를 신청할 수 없습니다.',
      }
      return res.send(resultInfo);
    }
    obj.remainDay = scheduleDay;

    //휴가정보 입력
    await Vacation.create({
      vacation_user: obj.business_num,
      vacation_type: obj.vacation_type,
      start_date: strDate,
      end_date: endDate,
      comment: obj.comment
    });

    //사용자의 잔여휴가일수 수정
    await cmmn.updateRemainDay(obj);
    
    const resultInfo = {
      status: 200,
      statusMsg: 'OK',
      msg: '휴가 신청이 완료되었습니다!',
    }
    return res.send(resultInfo);

  }catch(error){
    console.dir(error);
    next(error);
  }
});

/* 
 * 휴가 취소 view router
 */
router.get('/cancel', (req, res)=> {
  console.log('vacation cancel router');
  res.render('vacation/cancel', {
    title: '휴가 취소'
  });
})

/* 
 * 휴가 취소 router
 */
router.post('/cancel/act', async (req, res, next)=> {
  console.log('vacation cancel router');
  try{
    const obj = req.body;
    const userInfo = await cmmn.selectUser(obj);
    if(!userInfo){
      const resultInfo = { 
        status: 404,
        statusMsg: 'Not Found',
        msg: '사용자 정보가 존재하지 않습니다.' 
      }
      return res.send(resultInfo);
    }

    //휴가 정보가 있는지 확인
    const vacInfo = await cmmn.selectOneVacation(obj);
    if(!vacInfo || vacInfo.length === 0){
      const resultInfo = {
        status: 404,
        statusMsg: 'Not Found',
        msg: '해당하는 휴가 정보가 없습니다.',
      }
      return res.send(resultInfo);
    }
    
    //휴가 취소 가능한 날짜인지 확인
    let strDate = new Date(vacInfo.start_date);
    let endDate = new Date(vacInfo.end_date);
    let today = new Date();
    strDate.getHours(0,0,0,0);
    endDate.getHours(0,0,0,0);
    today.getHours(0,0,0,0);

    let scheduleDay = today.getTime() - strDate.getTime();
    scheduleDay = Math.ceil(scheduleDay / (1000 * 3600 * 24))+1;

    //0 혹은 음수일 경우, 신청 날짜가 지난 것
    console.log('scheduleDay: '+scheduleDay); 
    if(scheduleDay<1){
      const resultInfo = { 
        status: 400,
        statusMsg: 'Bad Request',
        msg: '이미 시작된 휴가는 취소할 수 없습니다.'
      }
      return res.send(resultInfo);
    }

    //복구할 날짜 계산
    const type = parseFloat(vacInfo.vacation_type); //연차 종류
    const day = parseInt(scheduleDay);
    console.log(userInfo.remain_day);

    const remainDay = parseInt(userInfo.remain_day) + (type * day);
    obj.remainDay = remainDay;
    console.log('remainDay: '+remainDay);

    console.dir(obj);
    //휴가 정보 삭제
    await Vacation.destroy({
      where: {
        id: obj.vacation_id,
        vacation_user: obj.business_num
      }
    });

    //사용자의 잔여휴가일수 수정
    await cmmn.updateRemainDay(obj);

    const resultInfo = {
      status: 200,
      statusMsg: 'OK',
      msg: '휴가 취소가 완료되었습니다!',
    }
    return res.send(resultInfo);

  }catch(error){
    console.log(error);
    next(error);
  }
})



module.exports = router;