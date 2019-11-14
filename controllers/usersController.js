const userModel = require('../models/usersModel');
exports.getUserInfo = async (req,res) => { 
    try{  
        let rollnumber = req.params.id;
        const userInfo = await userModel.findOne({rollnumber:rollnumber}); 
        res.status(200).json(userInfo);
    }catch(err){ 
        res.status(500).json({ 
            message:err
        })
    } 
    
}  



