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


app.get("/checkevent",autherise,async(req,res)=>{
  if( !req.user){
    return res.json({status:false,message:"not allowed"})
  }
})



app.delete("/del",async(req,res)=>{
  const del = await Eventmodel.deleteMany({});

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
 
  httpOnly:false,
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
// const data =[
//   {
//     "title": "Sunset Music Festival",
//     "description": "A beachside music festival with live bands, food stalls, and bonfires.",
//     "price": 999,
//     "location": "Goa",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   },
//   {
//     "title": "Tech Workshop 2025",
//     "description": "A full-day workshop covering the latest trends in AI and web development.",
//     "price": 1499,
//     "location": "Bangalore",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   },
//   {
//     "title": "Street Food Carnival",
//     "description": "Experience the taste of India with more than 50 food vendors in one place.",
//     "price": 299,
//     "location": "Delhi",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   },
//   {
//     "title": "Art and Wine Evening",
//     "description": "Enjoy a relaxing evening painting while sipping on fine wine.",
//     "price": 1200,
//     "location": "Mumbai",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   },
//   {
//     "title": "Adventure Trekking Camp",
//     "description": "3-day trekking and camping trip in the Himalayan foothills.",
//     "price": 3500,
//     "location": "Manali",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   },
//   {
//     "title": "Film Screening Night",
//     "description": "Open-air screening of award-winning indie films under the stars.",
//     "price": 400,
//     "location": "Pune",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   },
//   {
//     "title": "Cultural Dance Fiesta",
//     "description": "A colorful showcase of classical and folk dances from across India.",
//     "price": 600,
//     "location": "Kochi",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   },
//   {
//     "title": "Book Reading & Poetry Slam",
//     "description": "An intimate evening of literature, spoken word, and coffee.",
//     "price": 250,
//     "location": "Chennai",
//     "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60"
//   }
// ]



// const insertfunc=async()=>{
//     const val = await Eventmodel.insertMany(data);
// }