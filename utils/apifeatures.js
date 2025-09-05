class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword=this.queryStr.keyword?
        {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i"
            }
        }:{};
        this.query=this.query.find({...keyword});
        return this;
    }


    filter() {
  const queryCopy = { ...this.queryStr };

  // Remove fields that are not for filtering
  const removeFields = ["keyword", "page", "limit"];
  removeFields.forEach((key) => delete queryCopy[key]);

  console.log("Query Copy Before Parsing:", queryCopy);

  // Convert gte/lte/gt/lt to MongoDB operators
  let queryStr = JSON.stringify(queryCopy);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

  console.log("Query String After Replace:", queryStr);

  const parsed = JSON.parse(queryStr);
  

  // Ensure numeric values are cast to numbers
  if (parsed.price) {
    if (parsed.price.$gte) parsed.price.$gte = Number(parsed.price.$gte);
    if (parsed.price.$lte) parsed.price.$lte = Number(parsed.price.$lte);
  }

  if (parsed.ratings) {
    if (parsed.ratings.$gte) parsed.ratings.$gte = Number(parsed.ratings.$gte);
  }

  console.log("Parsed Query:", parsed);

  this.query = this.query.find(parsed);
  return this;
}





    pagination(resultPerPage){
        const currentPage=Number(this.queryStr.page)||1;
        const skip=resultPerPage*(currentPage-1);
        this.query=this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}
module.exports=ApiFeatures;