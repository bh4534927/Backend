const Category = require('../Models/Categories')
const {CategoryValidator} = require("../Utils/Validator")
const Index = async(req,res)=>{
    //fetch all the categories except the __v and created ...
    const categories = await Category.find({},{
        _id: 0,
        __v: 0,
    })
    return res.json({
        data:categories
    })
}

const getCategories = async  (req,res)=>{
    //created new categry from the post data 
    const valid_details = await CategoryValidator.validateAsync(req.body)
    //then extract the details from the valid details 
    const {Institution,CategoryName} = valid_details
    //check in the db if the categories exists 
    const exists = await Category.countDocuments({Institution,CategoryName})
    if(exists>0){
        //the categories exists
        res.json({
            status:'error',
            message:'Category Exists'
        })
    }else{
        //save the categories
        const category = new Category({Institution,CategoryName})
        await category.save()
        if(category){
            res.json({
                status:'success',
                message:'Category Successfully Created'
            })
        }else{
            res.json({
                status:'error',
                message:'Unknown Error Occurred'
            })
        }

    }
}
const getCategoriesFromInstitutions = async (req,res)=>{
    //get the institution from the post data 
    const {institution} = req.body
    if(!institution){
        res.json({
            status:'error',
            message:'Institution Is Required'
        })
    }else{
        //check categories from the database
        const categories = await Category.find({Institution: institution},{
            __v:0,
            _id:0,
            createdAt:0,
            updatedAt:0
        })
        res.json({
            status:'success',
            message:'Data Successfully Fetched',
            categories:categories
        })
    }
}

module.exports = {Index,getCategories,getCategoriesFromInstitutions}