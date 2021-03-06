const { getDb } = require("../utils/database");

class Order {
    constructor(userId,email,products,total,ordered_time,address){
        this.userId = userId;
        this.email = email;
        this.products = products;
        this.total = total;
        this.ordered_time = ordered_time;
        this.address = address;
    }

    save(){
        return getDb().collection('orders').insertOne(this);
    }

    static getItemsByQuery(query){
        return getDb().collection('orders').find(query).toArray();
    }
}

module.exports = Order;