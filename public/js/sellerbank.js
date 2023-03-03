//const Razorpay = require('razorpay');
document.getElementById("razor-pay4").onclick=function (e) {
    let today = new Date();
    let mm = today.getMonth() + 1;
    let receiptId = "Receipt_" + req.session.user.id + "_" + today.getDate().toString() + mm.toString() + today.getFullYear().toString() + today.getHours().toString() + today.getMinutes().toString() + today.getSeconds().toString();
    alert('receiptId');
    //rzp1.open();
    //e.preventDefault();
  }