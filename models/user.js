const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectID;

class User {
    constructor(email,password,userType,hotel_name,created,cart){
        this.email = email;
        this.password = password;
        this.userType = userType;
        this.hotel_name = hotel_name;
        this.created = created;
        this.cart = cart;
        this.address = address;
    }

    save(){
        return getDb().collection('users').insertOne(this);
    }

    static findById(userId){
        return getDb().collection('users').findOne({_id:userId});
    }

    static findByEmail(email){
        return getDb().collection('users').findOne({email:email});
    }

    static updateById(id,values){
        return getDb().collection('users').updateOne({_id:new ObjectId(id)},{$set:values});
    }

    static findByQuery(query){
        return getDb().collection('users').findOne(query);
    }

    static addToCart(userId,values){
        return getDb().collection('users').updateOne({_id:new ObjectId(userId)},{$push:{"cart.items":values}});
    }

    static updateCart(userId,itemId,values){
        return getDb().collection('users').updateOne(
            {_id:new ObjectId(userId),"cart.items.foodId":itemId},
            {$set:values}
        );
    }

    static findCartItemByQuery(query){
        return getDb().collection('users').find(
            query,
        ).project({'cart.items.$':1}).toArray();
    }

    static getCartItems(userId){
        return getDb().collection('users').aggregate([
            {
                $match:{
                    _id:new ObjectId(userId),
                }
            },
            {
                $unwind:'$cart.items'
            },
            {
                $lookup:{
                    from:'items',
                    localField:'cart.items.foodId',
                    foreignField:'_id',
                    as:'cart.items.food'
                }
            }, 
            {
                $unwind:'$cart.items.food'
            },
            {
                $group :{
                    _id:'$_id',
                    "items":{"$push":"$cart.items"},
                }
            },
            {
                $project:{
                    _id:1,
                    'items':1,
                    'total':{
                        $sum:{
                            $map:{
                                input:'$items',
                                as:'item',
                                in:{
                                    $multiply:["$$item.quantity","$$item.food.food_price"]
                                }
                            }
                        }
                    }
                }
            }
        ]).toArray();
    }

}

module.exports = User;