module.exports = (sequelize, DataTypes) => (
  sequelize.define('user',{
    'business_num':{ //사번
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    'name':{ //이름
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    'password':{ //패스워드
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    'remain_day':{ //잔여휴가일수
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '15'
    },
    'created_at':{
      type: DataTypes.DATE,
      allowNull:false,
      defaultValue: sequelize.literal('now()')
    }
  },
  {
    timestamps: false
  })
)
