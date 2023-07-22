pragma circom 2.0.0; // The circom compiler version

template paymentChannel () {
    signal input a; // public Channel Address
    signal input b; // contract address from the Signature
    // signal output result1;
    a === b;

    signal input c; // public totalEscrowed Balance
    signal input d; // totalOwed Amount from the Signature
    signal output result2;

    if(d<=c){
        result2 = 1;
    }
    
    result2 === 1;
}

component main {public [a,b,c,d]} = paymentChannel();