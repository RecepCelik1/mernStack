//=> mongoDB den gelen dataların filtrelendiği kısım. Bu kısımdan şüpheliyim


class ProductFilter {

    constructor(query, queryStr){ //=> query -> mongoDB sorgusu, queryStr -> filtreleme parametrelerini içeren nesne
        this.query = query 
        this.queryStr = queryStr
    }



    search(){ //=> girilen parametrelere göre arama yapma kısmı bunun için $regex kullanırız
        const keyword = this.queryStr.keyword ? { 
            name: {
                $regex : this.queryStr.keyword,
                $options : "i"
            }
        } : {}
        this.query = this.query.find({...keyword})
        return this;
    }



    filter(){ //=> filtreleme metodu, parametreleri kullanarak mongoDB sorgusunu filtreler gerekli alanları filtreleme nedeniyle siler
                    // geri kalan parametreleri JSON haline getirip sorgulamaya ekler
        const queryCopy = {...this.queryStr}; 
        const deleteArea = ["keyword", "page", "limit"];
        deleteArea.forEach(item => delete queryCopy[item])

        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`)

        this.query = this.query.find(JSON.parse(queryStr))
        return this;
    }



    pagination(resultPerPage){ //=> sayfalama metodu resultperpage adı üstünde
        const activePage = this.queryStr.page || 1
        const skip = resultPerPage * (activePage - 1)
        this.query = this.query.limit(resultPerPage).skip(skip)
        return this;
    }
}

module.exports = ProductFilter;