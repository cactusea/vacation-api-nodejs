module.exports = (sequelize, DataTypes) => (
  sequelize.define('vacation',{
    'id':{
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    'vacation_type':{ //휴가 유형(연/반/반반)
      type: DataTypes.STRING(10),
      allowNull:false
    },
    'created_at':{ //신청일
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('now()')
    },
    'start_date':{ //시작일
      type: DataTypes.DATE,
      allowNull: false,
    },
    'end_date':{ //종료일
      type: DataTypes.DATE,
      allowNull: true,
    },
    'comment':{ //비고
      type: DataTypes.STRING(200),
      allowNull: true
    }
  },
  {
    timestamps: false,
  })
)


/*
CREATE TABLE vacationsystem.vacations(
  id INT NOT NULL AUTO_INCREMENT,
  vacation_user VARCHAR(20) NOT NULL,
  vacation_type INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT now(),
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  comment VARCHAR(200),
  PRIMARY KEY(id),
  CONSTRAINT vacation_user
  FOREIGN KEY (vacation_user)
  REFERENCES vacationsystem.users (business_num)
  )
  COMMENT='휴가일 정보'
  DEFAULT CHARSET=utf8
  ENGINE=InnoDB;
*/