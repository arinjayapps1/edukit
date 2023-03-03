let pincodes;
let city;
let zipcodes;
let i=0;
const citydropdown = document.getElementById("checkout-city");
const statedropdown = document.getElementById("checkout-state");
const zipdropdown = document.getElementById('checkout-zip');

const fetchzipcodes = async () => {
    const response = await fetch('/getzipcodes').catch(err => {
        console.log("Error while fetching zipcodes");
    });
    if (response) {
        return response.json();
    }
}

const init= async()=>{
    let data= await fetchzipcodes();
    pincodes=data.pincodes;
     console.log(data);
     console.log(pincodes);
   }

const display=(zipcodes1,element)=>{
    element.innerHTML=zipcodes1.map((zipcode1)=>{
      return `<option value="${zipcode1}">${zipcode1}</option>`
    }).join('');


    };
   
init();
statedropdown.onchange=function(){
    //empty city- and Topicszip- dropdowns
    citydropdown.length = 1;
    zipdropdown.length = 1;
    city=pincodes.filter(p=>p.state1===this.value);
    city=['Choose city',... new Set(city.map(c=>c.city))];
    //console.log(city);
    display(city,citydropdown);   
}
citydropdown.onchange=function(){
    console.log("testing")
    console.log(this.value);
    zipdropdown.length = 1;
    zipcodes=pincodes.filter(p=>p.city===this.value);
    console.log(zipcodes);
    zipcodes=['Choose pincode',... new Set(zipcodes.map(z=>z.pincode))];
    console.log(zipcodes);
    display(zipcodes,zipdropdown);   
}

//console.log(citydropdown);

//citydropdown[0].innerHtml = '<option value=Faridabad>Faridabad</option>';