export default class Transaction { 
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = Number(amount);
    }

    isValid() {
        // Mining reward transaction: from === null
        if (this.from === null) return true;

        if (!this.from || !this.to) return false;
        if (this.amount <= 0) return false;
        return true;
    }
}
