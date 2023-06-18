import categoryModel from "../../../DB/models/CategoryModel.js"
import commentModel from "../../../DB/models/CommentModel.js"


/**--------------------------------
    * @desc Create New category
    * @route    /api/category/create-category
    * @method   POST
    * @access   Private (Only Admin)
-----------------------------------*/ 
const createCategory=async(req,res,nxt)=>{

    const categoryExist=await categoryModel.findOne({title:req.body.title.toLowerCase()})
    if(categoryExist) return nxt(new Error(`Category ${req.body.title} is already exist , choose another category name`))

    // create comment and save in DB
    const category=await categoryModel.create({
        title:req.body.title.toLowerCase(),
        createdBy:req.user._id,
    })
    
    category?res.status(201).json({message:"category created successfully",category}):nxt(new Error("fail to add category ,try again"))


}
/**--------------------------------
    * @desc Get All categories

    * @route    /api/category/
    * @method   GET
    * @access   Public
-----------------------------------*/ 
const getAllCategories=async(req,res,nxt)=>{

    const categories = await categoryModel.find()
        .sort({createdAt:-1})
    res.status(200).json({ message: 'Done', categories });
}

/**--------------------------------
    * @desc Delete Category
    * @route    /api/category/:categoryId
    * @method   DELETE
    * @access   Private (only admin )
-----------------------------------*/

const deleteCategory=async(req,res,nxt)=>{
    const {categoryId}=req.params;
    // check if categoroy exist in DB
    const category=await categoryModel.findById(categoryId);
    if(!category)return nxt(new Error("in-valid category",{cause:404}))
    
    // delete category
    const deletedCategory=await categoryModel.findByIdAndDelete(categoryId)
    // check category has been deleted or not
    deletedCategory? res.status(200).json({message:"category has been deleted"}):nxt(new Error("faile to delete category"),{cause:400})

}


export{
    createCategory,
    getAllCategories,
    deleteCategory

}