export class Transaction { 
    constructor (from, to, id, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.id = crypto.randomUUID();
    }

    isValid() {
        if (!this.from || !this.to) return false;
        if (this.amount <= 0) return false;
        return true;
    }
}



 
