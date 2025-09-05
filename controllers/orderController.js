const Order=require("../models/orderModel");
const Product=require("../models/productModel");
const ErrorHandler=require("../utils/errorhandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");

//Create new Order
exports.newOrder=catchAsyncErrors(async(req,res,next)=>{
    const {
        shippingInfo,
        OrderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    }=req.body;
    const order=await Order.create({
        shippingInfo,
        OrderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id
    })
    res.status(200).json({
        success:true,
        order,
    })
})

// get Single Order
exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email");
    console.log(order);
    if(!order){
        return next(new ErrorHandler("Order not found with this id",404));
    }
    res.status(200).json({
        success:true,
        order,
    })
})

exports.myOrders=catchAsyncErrors(async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id});
   res.status(200).json({
    success:true,
    orders
   })
})

//get all Orders --Admin
exports.getAllOrders=catchAsyncErrors(async(req,res,next)=>{
    const orders=await Order.find();
    let totalAmount=0;
    orders.forEach((order)=>{
        totalAmount+=(order.totalPrice);
    });
    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    })
})


// update Order status --Admin
exports.updateOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    // if(!order){
    //     return next(new ErrorHandler(""))
    // }
    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }
    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("You have already delivered this order",400));
    }
   
    if(order.orderStatus==="Delivered"){
        order.OrderItems.forEach(async(order)=>{
        await updateStock(order.product,order.quantity);
    })}


    order.orderStatus=req.body.status;

    // order.deliveredAt=Date.now();


    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now();
    }
    
    await order.save({validateBeforeSave:false});

    res.status(200).json({
        success:true
    })
})

async function updateStock(id,quantity){
    const product=await Product.findById(id);

    product.stock-=quantity;

    await product.save({validateBeforeSave:false});
}


//delete Order --Admin
exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found with this Id",404));
    }
    await order.deleteOne();
    res.status(200).json({
        success:true,
    })
})
