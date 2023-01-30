const {Client} = require("pg");
const client = new Client({
 user:"postgres",
 host:"db.eyzlslzfvanhmztlwcls.supabase.co",
 password:"Saloni@1231",
 database:"postgres",
 port:"5432",
 ssl:{ rejectUnauthorized:false },
});
client.connect(function(res,error){
  console.log(`Connected!!!`)
})

let express = require("express");
let app = express();
app.use(express.json());
app.use(function(req,res,next){
res.header("Access-Control-Allow-Origin","*");
res.header("Access-Control-Allow-Methods",
"GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD");
res.header("Access-Control-Allow-Headers",
"Origin,X-Requested-With,Content-Type,Accept");
next();
})
var port = process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app listening on port ${port}!`));

makeString=(query)=>{
 let {brand,ram,rom,os,sort}=query;
 let count = 0;
 let brd = brand?(makeArr(brand,"brand",count)):"";
 count+=brand?brand.split(",").length:count;
 let raam = ram?(makeArr(ram,"ram",count)):"";
 count+=ram?ram.split(",").length:count;
 let room = rom?(makeArr(rom,"rom",count)):"";
 count+=rom?rom.split(",").length:count;
let searchStr ="";
searchStr = brand?addTo(searchStr,brd):addToStr(searchStr,"brand",brand,count+1);
searchStr = ram?addTo(searchStr,raam):addToStr(searchStr,"ram",ram,count+1);
searchStr = rom?addTo(searchStr,room):addToStr(searchStr,"rom",rom,count+1);
searchStr = addToStr(searchStr,"os",os,count+1);
return searchStr;
}
addToStr=(str,pname,pval,count)=>
pval?str?str+" AND "+pname+"=$"+count:pname+"=$"+count:str;
addTo=(str,pval)=>
pval?str?str+" AND ("+pval+")":"("+pval+")":str;

makeArr=(param,pname,count)=>{
    let arr = param.split(",")
    let str=""
    for(let i=0;i<arr.length;i++){
     str=addQry(str,pname,arr[i],count+1)
     count ++;
    }
    return str;
}
addQry=(str,pname,pval,con)=>
pval?str?str+" OR "+pname+"=$"+con:pname+"=$"+con:str;

makeArrString=(query)=>{
    let {brand,ram,rom,os,sort}=query;
    let searchStr ="";
    searchStr = addStr(searchStr,brand);
    searchStr = addStr(searchStr,ram);
    searchStr = addStr(searchStr,rom);
    searchStr = addStr(searchStr,os);
    searchStr = addStr(searchStr,sort);
    return searchStr;
}
addStr=(str,pval)=>
 pval?str?str+","+pval:pval:str;

app.get("/mobiles",function(req,res,next){
let qry = `SELECT * FROM mobiles`;
let brand = req.query.brand;
let ram = req.query.ram;
let rom = req.query.rom;
let os = req.query.os;
let sort = req.query.sort;
let values = "";
let queries={brand,ram,rom,os}
 if(brand||ram||rom||os){
   if(sort){ qry = `SELECT * FROM mobiles WHERE ${makeString(queries)} ORDER BY ${sort}`;
    values = makeArrString(queries).split(",");
  }else{
    qry = `SELECT * FROM mobiles WHERE ${makeString(queries)} `;
    values = makeArrString(queries).split(",");
  }
 }else if(sort){
    qry = `SELECT * FROM mobiles ORDER BY ${sort} `;
 }
 if(values){
  client.query(qry,values,function(err,result){
    if(err) {res.status(404).send(err)}
    res.send(result.rows);
 })
 }else{
client.query(qry,function(err,result){
    if(err) {res.status(404).send(err)};
    res.send(result.rows);
});}
});

app.get("/mobiles/:id",function(req,res,next){
let id = req.params.id;
let qry = `SELECT * FROM mobiles WHERE id=$1`;
client.query(qry,[id],function(err,result){
    if(err) res.status(404).send(err);
    else { 
         let {rows=[]}= result;
        if(rows.length>0)
        res.send(rows);
        else 
        res.send("No data found");
    }
})
})
app.post("/mobiles",function(req,res,next){
 let body = req.body;
 let value = [body.name,body.price,body.brand,body.ram,body.rom,body.os];
 let qry = `INSERT INTO mobiles(name,price,brand,ram,rom,os) VALUES($1,$2,$3,$4,$5,$6)`;
 client.query(qry,value,function(err,result){
    if(err) res.status(404).send(err);
     res.send(result.affectedRows+" Data Successfully inserted!");
 });
})
app.put("/mobiles/:id",function(req,res,next){
 let id = req.params.id;
 let body = req.body;
 let value = [body.name,body.price,body.brand,body.ram,body.rom,body.os,id];
 let qry = `UPDATE mobiles SET name=$1, price=$2, brand=$3 ,ram=$4 ,rom=$5 ,os=$6 WHERE id=$7`;
 client.query(qry,value,function(err,result){
    if(err) res.status(404).send(err);
   res.send(result.affectedRows+" Row is Updatedd Successfully!");
 })
})
app.delete("/mobiles/:id",function(req,res,next){
 let id = req.params.id;
 let qry = `DELETE FROM mobiles WHERE id=$1`;
 client.query(qry,[id],function(err,result){
    if(err) res.status(404).send(err);
     res.send(result.affectedRows+" Row is Deleted Successfully!");
 });
})