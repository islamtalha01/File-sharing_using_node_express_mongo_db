const express=require("express")
const multer=require("multer")
require("dotenv").config()
const app= express()
const File=require("./models/File")
const bcrypt= require("bcrypt")
const mongoose=require("mongoose")
app.use(express.urlencoded({extended:true}))
mongoose.connect(process.env.Database_url).then(() => {
    console.log("Connected to Database");
    }).catch((err) => {
        console.log("Not Connected to Database ERROR! ", err);
    });

app.get("/",(req,res)=>
{
    app.set("view engine","ejs")
    res.render("index")
})

const upload=multer({dest:"uploads"})
app.post("/upload",upload.single("file"),async(req,res)=>{
const filedata =
{
    path:req.file.path,
    originalname:req.file.originalname
    
}
if (req.body.password !=null && req.body.password !=="")
{
    filedata.password= await bcrypt.hash(req.body.password,10)
}
const file= await File.create(filedata);
console.log(file);
res.render("index",{filelink:`${req.headers.origin}/file/${file.id}`})

})
app.get("/file/:id",handledownload)
app.post("/file/:id",handledownload)
async function handledownload(req,res)
{

    const file = await File.findById(req.params.id)
    if(file.password!=null)
    {
      res.render("password")

      if(!(await bcrypt.compare(req.body.password,file.password)))
      {
         res.render("password",{error:true})
         return
      }
    
    }

    file.downloadcount++
    await file.save() 
     console.log(file.downloadcount)
    res.download(file.path,file.originalname)
}
app.listen(process.env.PORT)