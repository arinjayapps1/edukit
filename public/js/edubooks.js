const addtocartbtns=document.querySelectorAll('.add-cart');
const cartcnt=document.querySelector('.navbar-tool-label');
const gstnbtns=document.querySelectorAll('.gstn');
const loadbtn=document.querySelector('.loadbtn');
const msgdiv=document.querySelector('.message-div');
const taxpayer=document.querySelector('.taxpayer');
const gsteditbtn=document.querySelector('.gsteditbtn');
const cartItemCntLabel=document.querySelector('.navbar-tool-label');




addtocartbtns.forEach((btn)=>{
btn.addEventListener('click',(event)=>{
    console.log(event.currentTarget.parentNode);    
    const itemId=event.currentTarget.parentNode.querySelector('[name=itemId]').value;
    const csrf=event.currentTarget.parentNode.querySelector('[name=_csrf]').value;
    //window.location.assign("http://localhost:3000/signin");
   fetch('/addtoCart/'+itemId,{method:'POST',
    headers:{
       'csrf-token': csrf
    }
   }).then(
    (result)=>{
        //console.log("result"+result);
        if (result.status===402){
            window.location.assign("http://localhost:3000/signin");
        }
        if(result.status===200){
            return result.json();
        }
    } 
   ).then((data)=>
    {
        
        let {cartproducts}=data.cartproducts;
        
        console.log(data,cartproducts);
        cartItemCntLabel.innerHTML=data.cartproducts.length;
    })
   .catch(
    err=>{
        console.log(err)
    }
   );
});
});
function taxpayerdetails(element,value){
    element.forEach(e=>{
        if(e.classList.contains("form-label")){
            e.innerHTML=value;
        }
        if(e.type="hidden"){
         e.value=value;
        }
        
    })

};

gstnbtns.forEach(btn=>{   
btn.addEventListener('click', (event) => {
    const verifybtn = event.currentTarget;
    const GSTIN = event.currentTarget.parentNode.parentNode.querySelector('[name=GSTIN]').value;
    loadbtn.classList.remove("d-none");
    taxpayer.classList.add("d-none");
    verifybtn.classList.add("d-none");
    if (GSTIN) {

        fetch('/verifygst/' + GSTIN).then((result) => {
            return result.json();

        }).then((result) => {
            //console.log(data);  
            loadbtn.classList.add("d-none");
            verifybtn.classList.remove("d-none");
            if (result.flag) {
                msgdiv.classList.add("d-none");
                taxpayer.classList.remove("d-none");
                let cname = taxpayer.querySelectorAll(".cname");
                let cnamevalue = result.data.lgnm;
                let btname = taxpayer.querySelectorAll(".btname");
                let btnamevalue = result.data.tradeNam;
                let regdate = taxpayer.querySelectorAll(".regdate");
                let regdatevalue = result.data.rgdt;
                let UIN = taxpayer.querySelectorAll(".UIN");
                let UINvalue = result.data.sts;
                let taxType = taxpayer.querySelectorAll(".taxtype");
                let taxTypevalue = result.data.dty;
                let ctb = taxpayer.querySelectorAll(".ctb");
                let ctbvalue = result.data.ctb;
                console.log("cname value");
                console.log(cnamevalue);
                taxpayerdetails(cname, cnamevalue);
                taxpayerdetails(btname, btnamevalue);
                taxpayerdetails(regdate, regdatevalue);
                taxpayerdetails(UIN, UINvalue);
                taxpayerdetails(taxType, taxTypevalue);
                taxpayerdetails(ctb, ctbvalue);
                ///onsole.log(cname);
                //let cname=taxpayer.querySelectorAll('.cname'));
            } else {
                msgdiv.querySelector('.message').innerHTML = result.message;
                msgdiv.classList.remove("d-none");

            }

        }).catch((err) => {
            console.log(err);

        });
    }
    else{
        msgdiv.querySelector('.message').innerHTML = "GSTIN number is required.";
        msgdiv.classList.remove("d-none");
        verifybtn.classList.remove("d-none");
        loadbtn.classList.add("d-none");
        console.log("GSTIN EMPTY");
    }

})
});


