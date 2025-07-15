const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const cors = require("cors");
const Link = process.env.Link;
const Eventmodel = require("./Model/Model.js");
const cloudinary = require('cloudinary').v2
const connect=() => mongoose.connect(Link);
const entry = process.env.Entry;
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const Usermodel = require("./Model/Usermodel");
const { craetetoken } = require("./utils/Craetetoken.js");
var cookieParser = require('cookie-parser');
const { autherise } = require("./auth/auth.js");
const Bookinfmodel = require("./Model/Bookingmodel.js");
const cloudname = process.env.cloud;
const cloudkey = process.env.cloudkey;
const secret = process.env.secret;
const Link1 = process.env.Link1;
const Link2 = process.env.Link2;
const Link3 = process.env.Link3;
cloudinary.config({
  cloud_name: cloudname,
  api_key:cloudkey,
  api_secret: secret,
});





async function connectDB() {
  try {
    await mongoose.connect(Link)
  
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

connectDB();
const allowed = [Link1,Link2,Link3];
app.use(express.json());
app.use(express.urlencoded({extended:true}));
    app.use(cookieParser());
app.use(cors(
  {origin:allowed,
    credentials:true}


));


app.get("/chec", (req, res) => {
  const token = req.cookies.tdtoken;
  if (token && token.length > 0) {
    return res.json({ status: false }); // User is signed in
  } else {
    return res.json({ status: true }); // Not signed in
  }
});

const events = [
  {
    title: "Summer Beach Festival",
    description: "Join us for a vibrant beach festival with live music, food stalls, and beach games.",
    price: 499,
    location: "Varkala Beach, Kerala",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
  },
  {
    title: "Mountain Trekking Adventure",
    description: "A guided trekking experience through the Western Ghats with camping under the stars.",
    price: 1299,
    location: "Munnar, Kerala",
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
  },
  {
    title: "Backwater Boat Ride",
    description: "Relax and enjoy a scenic boat ride through the peaceful Kerala backwaters.",
    price: 899,
    location: "Alleppey, Kerala",
    imageUrl: "https://images.unsplash.com/photo-1584270354949-1fe69ec7fb0f"
  },
  {
    title: "Night Food Street Carnival",
    description: "Taste the flavors of Kerala in a vibrant street food carnival under the stars.",
    price: 199,
    location: "Fort Kochi, Kerala",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
  },
  {
    title: "Cultural Dance Evening",
    description: "Watch traditional Kathakali and Mohiniyattam performances with live music.",
    price: 350,
    location: "Thrissur, Kerala",
    imageUrl: "https://images.unsplash.com/photo-1638881613385-9d13a8c1c706"
  },
  {
    title: "Rainforest Photography Hike",
    description: "Capture the beauty of lush green rainforests and exotic wildlife on this photo walk.",
    price: 749,
    location: "Wayanad, Kerala",
    imageUrl: "https://images.unsplash.com/photo-1549880186-7cbb0f63f2d3"
  },
  {
    title: "Yoga and Wellness Retreat",
    description: "A 3-day rejuvenation retreat with yoga, meditation, and Ayurvedic food.",
    price: 2499,
    location: "Kovalam, Kerala",
    imageUrl: "https://images.unsplash.com/photo-1610622463856-7f9863b8ddf9"
  },
  {
    title: "Tech Innovation Expo",
    description: "Explore startups, AI demos, robotics showcases, and network with tech leaders.",
    price: 150,
    location: "Technopark, Trivandrum",
    imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769"
  }
];


app.get("/del",async(req,res)=>{
  
  const val = await Eventmodel.insertMany(events);
})



app.get("/checkevent",autherise,async(req,res)=>{
  if( !req.user){
    return res.json({status:false,message:"not allowed"})
  }
})












app.delete("/delete/:id",async(req,res)=>{
  const id = req.params.id;
  const del = await Eventmodel.findByIdAndDelete(id);
  if(!del){
    return res.json({message:"something wrong",status:false})
  }
  return res.json({message:"Deleted Successfully",status:true});
})




app.get("/suggest",async(req,res)=>{
try{
    const query = req.query.q;
if(query){
  
const findval = await Eventmodel.find(
  {
    location:{$regex:query,$options:"i"}
  }
).limit(5);

if(findval.length > 0 ){
  return res.json({info:findval})
}else{
  return res.json({message:"not found"})
}

}else{
  res.json("no query");
}


}catch(err){
  console.log(err);
}

})

app.post("/book/:id",autherise,async(req,res)=>{
try{
    
const usrid = req.user;
if(usrid){

  const data1 = req.body;
const bookings = new Bookinfmodel({
  title:data1.title,
  description:data1.description,
  date:data1.date,
  location:data1.location,
  userid:usrid
})

 await bookings.save();

return res.json({status:true,message:"booked"});


}
else{
  console.log("not done")
  return res.json({status:false,message:"you are not registered"});
}
}

catch(err){
  console.log(err)
}
 if (!res.headersSent) {
      return res.status(500).json({ status: false, message: "Internal Server Error" });
 }
});

app.get("/bookedevents",autherise,async(req,res)=>{
  try{
const id = req.user;
if(id){
  const data = await Bookinfmodel.find({userid:id});
  
  if(data.length > 0){
return  res.json({message:"events",datas:data})

  }
  else{
    return res.json({message:"no events"})
  }
}else{
  return res.json({message:"no events"})
}

  }catch(err){
console.log(err);
  }
})





app.post("/update", upload.single('image'),async(req,res)=>{
    try{
  const filepath = req.file.path;
  const {id,title,description,price,location} = req.body;

    const result = await cloudinary.uploader.upload(filepath);
  const pushvalues = await Eventmodel.updateOne(
    {_id:id},
    {
      $set :{
      title:title,
      description:description,
      imageUrl:result.secure_url,
      price:price,
      location:location
    }  
    }                                                                
  )
  
return res.json({message:"Edited Successfully",status:true})

  }catch(err){
    console.log(err)
     return res.json({message:"something Wrong",status:false})

  }

})

app.post("/uploads",autherise, upload.single('image'), async (req, res) => {

const filepath = req.file.path;
const num = req.user;
const{title,description,price,location} = req.body;

const result = await cloudinary.uploader.upload(filepath);
try{
  const pushval =  new Eventmodel({
 owner:num,
  title:title,
  description:description,
  price:price,
  location:location,
  imageUrl:result.secure_url,
}) 
 await pushval.save();

 return res.json({message:"Edited Successfully",status:true})
   
}
catch(err){
  console.log(err)
 return res.json({message:"something Wrong",status:false})
}

 
});



app.get("/info", async (req, res) => {
  try {
    const val = await Eventmodel.find({});
    return res.json(val);
  } catch (err) {
    console.error("🔥 /info route error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});


app.post("/login",async(req,res)=>{
 
  const{email,password} = req.body;

  if( !email || !password){
  return  res.json({message:"Both fileds are required",status:false})
  }

  try{

const userone = await Usermodel.findOne({email});

if(Object.keys(userone) .length >0 ){

 const auhlogin = await bcrypt.compare(password,userone .password)


if(!auhlogin){
return  res.json({message :"incorrect email or password" , status:false})
}

  const loginval = craetetoken(userone._id);
 
  res.cookie( "tdtoken" ,loginval,{
sameSite:"None",
  httpOnly:false,
  secure:true,
  maxAge:3*60*60*1000
})
 return res.json({message:"user logged inn",status:true});

}
else{
 return res.json({message:"user not found",status:false})

}

 
  }catch(err){
console.log(err);
  }
 

})


app.get("/ownevent",autherise,async(req,res)=>{
 
 try{
  const id = req.user;
   const val = await Eventmodel.find({owner:id});
if(Object.keys(val).length > 0){
  return res.json({"datas":val});
}
else{
  
 return res.json({message:"Not found"})

}
 }
catch(err){
  console.log(err)
}
});




app.get("/details/:id",async(req,res)=>{
   try{
  
    const id = req.params.id;
    const data1 = await Eventmodel.findById(id);
   
    res.json({datas:data1});
 
   }
   catch(err){
    console.log(err);
   }
});



app.post("/signup",async(req,res,next)=>{
const{username,email,password} = req.body;
if( !username || !email || !password){
  return res.json("all fiels are required");
}
const emailcomp = await Usermodel.findOne({email});
if(emailcomp){
  return res.json({message:"alredy registered",status:false})
}
const user = await Usermodel.create({username,email,password})

  const token = craetetoken(user._id);
 
res.cookie("tdtoken",token,{
 httpOnly:false,
sameSite:"None",
secure:true,
 maxAge:3*24*60*60*1000
})
res.json({message:"singing succesfull",success:true})
next()









})


app.all("/",(req,res)=>{
  return res.json("not found")
})




app.listen(3000,()=>{
    console.log("connected to server");
})


