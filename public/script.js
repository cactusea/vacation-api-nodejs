const express = require('express');
const sequelize = require('sequelize');
const User = require('../models').User;
const Vacation = require('../models').Vacation;

module.exports.selectUser = async (obj)=>{
  const info = await User.findOne({
    where: {
      business_num: obj.business_num, 
      password: obj.password
    }
  });
  return info;
};
module.exports.selectVacation = async (obj)=>{
  const info = await Vacation.findAll({
    attributes: [
      'id',
      'vacation_type',
      [ sequelize.fn('date_format', sequelize.col('start_date'), '%Y-%m-%d'), 'start_date' ],
      [ sequelize.fn('date_format', sequelize.col('end_date'), '%Y-%m-%d'), 'end_date' ],
      'comment',
      'vacation_user'
    ] ,
    where: {
      vacation_user: obj.business_num
    }
  });
  return info;
};
module.exports.selectOneVacation = async (obj)=>{
  const info = await Vacation.findOne({
    attributes: [
      'id',
      'vacation_type',
      [ sequelize.fn('date_format', sequelize.col('start_date'), '%Y-%m-%d'), 'start_date' ],
      [ sequelize.fn('date_format', sequelize.col('end_date'), '%Y-%m-%d'), 'end_date' ],
      'comment',
      'vacation_user'
    ] ,
    where: {
      vacation_user: obj.business_num,
      id: obj.vacation_id
    }
  });
  return info;
};
module.exports.updateRemainDay = async (obj)=>{
  const info = await User.update({ 
    remain_day: obj.remainDay
  }, {
    where: {
      business_num: obj.business_num,
      password: obj.password
    }
  });
  return info;
};

