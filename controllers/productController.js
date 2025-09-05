const Product=require("../models/productModel.js");
const ErrorHandler=require("../utils/errorhandler.js");
const ApiFeatures=require("../utils/apifeatures.js");
const qs=require("qs");
const cloudinary=require("cloudinary");
// const catchAsyncErrors= new ApiFeatures("../middleware/catchAsyncErrors");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


// Create Product--> Admin
exports.createProduct=(async(req,res,next)=>{

    let images=[];

    if(typeof req.body.images === "string"){
        images.push(req.body.images);
    }else{
        images=req.body.images;
    }

    const imagesLink=[];
    for(let i=0;i<images.length;i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:"products",
        })

        imagesLink.push({
            public_id:result.public_id,
            url:result.secure_url,
        })
    }
    req.body.images=imagesLink;
    req.body.user=req.user.id;

    const product = await Product.create(req.body);
    console.log(product);

    res.status(201).json({
        sucess:true,
        product
    })
})



exports.updateProduct=catchAsyncErrors(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("product not found",404));
        }


        let images=[];

    if(typeof req.body.images === "string"){
        images.push(req.body.images);
    }else{
        images=req.body.images;
    }

    

    if(images !== undefined){
         for(let i=0;i<product.images.length;i++){
          await cloudinary.v2.uploader.destroy(
                product.images[i].public_id
            )
        }
        
    

    const imagesLinks=[];

    for(let i=0;i<images.length;i++){
        const result=await cloudinary.v2.uploader.upload(images[i],{
            folder:"products",
        })

        imagesLinks.push({
            public_id:result.public_id,
            url:result.secure_url,
        })
    }
    req.body.images = imagesLinks;
    
}    
    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
res.status(200).json({
    success:true,
    product
})
    
})

//Get all Product
exports.getAllProducts=catchAsyncErrors(async(req,res)=>{
    const resultPerPage=8;

    const parsedQuery=qs.parse(req.query);
    console.log("Parsed query string",parsedQuery);


    const productsCount=await Product.countDocuments();

   
    
    
    const ApiFeature=new ApiFeatures(Product.find(),parsedQuery).search().filter().pagination(resultPerPage);

    // let products=await apiFeature.query;

    // let filteredProductsCount=products.length;

    // apiFeature.pagination(resultPerPage);


    const products=await ApiFeature.query;
    res.status(200).json({
        success:true,
        products,
        productsCount,
        resultPerPage,
        // filteredProductsCount
    });
})

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("product not found",404));
        }
    
    res.status(200).json({
        success:true,
        product,
        
    })
})






exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("product not found",404));
        }

        for(let i=0;i<product.images.length;i++){
          await cloudinary.v2.uploader.destroy(
                product.images[i].public_id
            )
        }
        


    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success:true,
        message:"Product Deleted successfully"
    })
})

// Create New Review or Update the review

exports.createProductReview=catchAsyncErrors(async(req,res,next)=>{
    const {rating,comment,productId}=req.body;

    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }

    const product=await Product.findById(productId);
// console.log(product);
    if(!product){
        return next(new ErrorHandler("product doesnot exist",404));
    }

    const isReviewed=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString()===req.user._id.toString())
                (rev.rating=rating),
                (rev.comment=comment)
            
    })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length;
    }

    let avg=0;

    product.reviews.forEach((rev)=>{
        avg+=rev.rating;
    })

    product.ratings=avg/(product.reviews.length);

    await product.save({
        validateBeforeSave:false
    })

    res.status(200).json({
        success:true
    })
})

//Get all reviews

exports.getProductReviews=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("product not found",404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews,
    })
})

//Delete Review
exports.deleteReview=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    const reviews=product.reviews.filter((rev)=>rev._id.toString()!=req.query.id.toString());

    let avg=0;

    reviews.forEach((rev)=>{
        avg+=rev.rating;
    })
    const ratings=avg/reviews.length;

    const numOfReviews=reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })
    res.status(200).json({
        success:true
    })



})
