const mongoose = require('mongoose'); 

const userSchema = mongoose.Schema({ 
    name:{ 
        type:String,  
        required:[true, 'We Expect you to have a name atleast']
    }, 
    surname:{ 
        type:String, 
    }, 
    email:{ 
        type:String, 
        required:[true],
        unique:true,
    }, 
    password:{ 
        type:String,
        required:[true]
    }, 
    rollnumber:{ 
        type:String, 
        required:[true,'Roll Number is necessary'],
        unique:true,
    }, 
    attendance:{ 
        type:Number,  
        default:0
    },
    pollsConducted:{ 
        type:Number, 
        default:0,
    },
    pollsParticipated:{ 
        type:Number, 
        default:0,
    },  
    registered:{ 
        type:Boolean,
        default:false
    }
})  
const usersModel = mongoose.model('users',userSchema); 

module.exports=usersModel;