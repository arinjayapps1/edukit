const https = require("https");
const orderLine = require('../models/order-item');
const Location = require('../models/location');
const tax=require('../models/taxrate');

const itemurl     = "https://books.zoho.in/api/v3/items?organization_id=" + process.env.ZOHO_ORG_ID;
const invurl      = "https://books.zoho.in/api/v3/invoices?organization_id=" + process.env.ZOHO_ORG_ID;
const payurl      = "https://books.zoho.in/api/v3/customerpayments?organization_id=" + process.env.ZOHO_ORG_ID;
const custurl     = "https://books.zoho.in/api/v3/contacts?organization_id="+ process.env.ZOHO_ORG_ID;
const contacturl  = "https://books.zoho.in/api/v3/contacts/contactpersons?organization_id="+ process.env.ZOHO_ORG_ID;
const locationurl = "https://books.zoho.in/api/v3/contacts/";
const billurl     = "https://books.zoho.in/api/v3/bills?organization_id="+ process.env.ZOHO_ORG_ID;
const getBills    = "https://books.zoho.in/api/v3/bills?organization_id="+process.env.ZOHO_ORG_ID;
//460000000026049/address?organization_id=10234695' 

exports.createInvoice = (order, shippingCharge,accessToken) => {
  return new Promise(async (resolve, reject) => {
    let currentDate = new Date();
    let orderDate = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1).toString().padStart(2, '0') + "-" + currentDate.getDate().toString().padStart(2, '0')
    let linedata = [];
    let orderAmt = 0;
    let orderId = order.id;
    let i = 0;
    let invoiceId;

    try {
      //fetching order lines
      let lines = await orderLine.findAll({
        where: {
          ORDER_ID: orderId
        }
      });
      let billaddress= await Location.findByPk(order.billToLocationId);
      //preparing data for ZOHO API.
      lines.forEach(line => {
        orderAmt += line.itemPrice * line.quantity;
        linedata[i] = {
          "item_id": line.zohoItemId,
          "item_order": i + 1,
          "rate": line.itemPrice,
          "quantity": line.quantity
        };
        i++;
      });
      //
      let invoiceData = {
        "customer_id": order.zohoCustomerId,
        //order.zohoCustomerId,
        "date": orderDate,
        "due_date": orderDate,
        "currency_id": "1190249000000000064",
        "billing_address": {
          "address_id":billaddress.zohocustbilltoaddressId
        },
        "shipping_address": {
          "address_id":billaddress.zohocustshiptoaddressId
        },
        
        "line_items": linedata,
        "total": orderAmt + shippingCharge,
        "template_id": "1190249000000015130",
        "shipping_charge": shippingCharge,
      };
      console.log(invoiceData);
      const options = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": "Zoho-oauthtoken " + accessToken
        }
      };
      //console.log(options);
      const request = https.request(invurl, options, response => {
        //console.log(`statusCode: ${response.statusCode}`);
        response.on('data', d => {
          //console.log(JSON.parse(d));
          apidata = JSON.parse(d);

          resolve(apidata);

        });
      });
      request.on('error', error => {
        reject(new Error(`Invoice Creation in ZOHO failed due to ${error}`));

      });
      request.write(JSON.stringify(invoiceData));
      request.end();
    } catch (err) {
      reject(new Error(`Invoice Creation in ZOHO failed due to ${err}`));
    }
  });
}

exports.createItem = (newProduct, req, res) => {
  return new Promise(async (resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Zoho-oauthtoken " + res.locals.accesstoken
      }
    };
    try{
    //
    let taxdetails= await tax.findByPk(req.body.tax)
     //
    //console.log(taxDetails);
    const itemData = {
      "name": req.session.user.id + "-" + newProduct.name,
      "rate": newProduct.discPrice,
      "description": newProduct.description,
      "product_type": "goods",
      "is_taxable": true,
      "purchase_account_id": "1190249000000000567",
      "purchase_account_name": "Cost of Goods Sold",
      "account_id": "1190249000000000486",
      "account_name": "Sales",
      "item_type": "sales_and_purchases",
      "hsn_or_sac": "49019100",
      "purchase_rate": newProduct.costPrice,
      "item_tax_preferences": [{
          "tax_specification": "inter",
          "tax_type": 0,
          "tax_name": "IGST" + req.body.tax,
          "tax_percentage": req.body.tax+'.000000',
          //results[0].TAX_RATE,
          "tax_id": taxdetails.zohoInterTaxId
          //results[0].ZOHO_INTER_TAX_ID
        },
        {
          "tax_specification": "intra",
          "tax_type": 2,
          "tax_name": "GST" + req.body.tax,
          "tax_percentage": req.body.tax+'.000000',
          //results[0].TAX_RATE,
          "tax_id": taxdetails.zohoIntraTaxId
          //results[0].ZOHO_INTRA_TAX_ID
        }
      ]
    };
    const request = https.request(itemurl, options, response => {
      //console.log(`statusCode: ${response.statusCode}`);
      response.on('data', d => {
        //console.log(JSON.parse(d));
        apidata = JSON.parse(d);
        resolve(apidata);

      });
    });
    request.on('error', error => {
      reject(new Error(`Item Creation in ZOHO failed due to ${error}`));

    });

    console.log(itemData);
    request.write(JSON.stringify(itemData));
    request.end();
  }
  catch(err){
    reject(new Error(`Item Creation in ZOHO failed due to ${err}`));
  }
  });

}

exports.createPayment=(invoices,razorpay_payment_id,checkAmt,accessToken)=>{
  return new Promise(async (resolve, reject) => {
    let currentDate = new Date();
    let invdata = [];
    let i = 0;
    try{
      invoices.forEach(inv=>{
        console.log(inv.invoice.invoice_id);
        invdata[i] = {
         "invoice_id": inv.invoice.invoice_id,
         "amount_applied": inv.invoice.total
   
       };
        i++;
       });
       let paymentData={
         "customer_id": invoices[0].invoice.customer_id,
         "payment_mode": "creditcard",
         "amount": checkAmt,
         "date": "2023-01-12",
         "reference_number":razorpay_payment_id,
         "invoices": invdata,
         "exchange_rate": 1,
         "invoice_id": invoices[0].invoice.invoice_id,
         "amount_applied": invoices[0].invoice.total
        
     }
     const options = {
       method: 'POST',
       headers: {
         "Content-Type": "application/json;charset=UTF-8",
         "Authorization": "Zoho-oauthtoken " + accessToken
       }
     };
     const request = https.request(payurl, options, response => {
       //console.log(`statusCode: ${response.statusCode}`);
       response.on('data', d => {
         //console.log(JSON.parse(d));
         apidata = JSON.parse(d);
   
         resolve(apidata);
   
       });
      });
      request.on('error', error => {
        reject(new Error(`Customer Payment Creation in ZOHO failed due to ${error}`));

      });
      request.write(JSON.stringify(paymentData));
      request.end();
    }
    catch(err){
      console.log("Error while Creation ZOHO Customer Payment:" + err);
    }
  });
  
}

exports.createSeller = (seller,accessToken,contactType) => {
    return new Promise(async (resolve, reject) => {
      let customerData;
      try{
      const options = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": "Zoho-oauthtoken " + accessToken
        }
      };
      
      if (seller.addressLine1){
        customerData = {
          "contact_name": seller.companyName,
          "vendor_name": seller.companyName,
          "company_name": seller.companyName,
          "email": seller.email,
          "mobile": seller.mobile,
          "contact_type": contactType,
          "gst_treatment": seller.gst_treatment,
          "gst_no": seller.gstin,
          "billing_address": {
            "attention": seller.contactName,
            "address": seller.addressLine1,
            "street2": seller.addressLine2,
            "city": seller.city,
            "state": seller.state,
            "zip": seller.zipcode,
            "country": "INDIA"
          },
          "shipping_address": {
            "attention": seller.contactName,
            "address": seller.addressLine1,
            "street2": seller.addressLine2,
            "city": seller.city,
            "state": seller.state,
            "zip": seller.zipcode,
            "country": "INDIA"
          },
          "contact_persons": [{
            "first_name":seller.contactFirstName,
            "last_name":seller.contactLastName,
            "email":seller.email,
            "mobile":seller.mobile
          }]
        };
      }
      else{
        customerData = {
          "contact_name": seller.companyName,
          "vendor_name": seller.companyName,
          "company_name": seller.companyName,
          "email": seller.email,
          "mobile": seller.mobile,
          "contact_type": contactType,
          "gst_treatment": seller.gst_treatment,
          "gst_no": seller.gstin
        };
      }
      
      const request = https.request(custurl, options, response => {
        //console.log(`statusCode: ${response.statusCode}`);
        response.on('data', d => {
          //console.log(JSON.parse(d));
          apidata = JSON.parse(d);
    
          resolve(apidata);
    
        });
       });
       request.on('error', error => {
        reject(new Error(`Customer Creation in ZOHO failed due to ${error}`));

      });
      request.write(JSON.stringify(customerData));
      request.end();

      console.log(customerData);
    }
    catch(err){
      console.log("Error while Creating ZOHO Vendor :" + err);
    }
    });
}
exports.createLocation = (contactId,accessToken,location) => {
  return new Promise(async (resolve, reject) => {
    let locationData;
    let locationurl1=locationurl+contactId+"/address?organization_id="+process.env.ZOHO_ORG_ID;
    try{
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Zoho-oauthtoken " + accessToken
      }
    };
    
   const request = https.request(locationurl1, options, response => {
      //console.log(`statusCode: ${response.statusCode}`);
      response.on('data', d => {
        //console.log(JSON.parse(d));
        apidata = JSON.parse(d);
  
        resolve(apidata);
  
      });
     });
     request.on('error', error => {
      reject(new Error(`Location Creation in ZOHO failed due to ${error}`));

    });
    request.write(JSON.stringify(location));
    request.end();

    console.log(location);
  }
  catch(err){
    console.log("Error while Creating ZOHO location :" + err);
  }
  });
}

exports.createBill=(order,accesstoken)=>{
  return new Promise(async (resolve, reject) => {
    let locationData;
    
    let currentDate = new Date();
    let linedata = [];
    let i = 0;
    let billDate = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1).toString().padStart(2, '0') + "-" + currentDate.getDate().toString().padStart(2, '0')
    try{
      let lines = await orderLine.findAll({
        where: {
          ORDER_ID: order.id
        }
      });
      
      
      lines.forEach(line => {
        let tax_id;
        //orderAmt += line.itemPrice * line.quantity;
        if(order.sourceState==order.destinationState){
          tax_id=line.zohoIntraTaxId;
        }
        else{
          tax_id=line.zohoInterTaxId;
        }
        linedata[i] = {
          "item_id": line.zohoItemId,
          "itc_eligibility": "eligible",
          "item_order": i + 1,
          "rate": line.itemCostPrice,
          "quantity": line.quantity,
          "tax_id":tax_id
        };
        i++;
      });
      let bllData = {
        "vendor_id": order.zohoVendorId,
        "source_of_supply": order.sourceState,
        "destination_of_supply": order.destinationState,
        "gst_no": order.gstin,
        "contact_category": "business_gst",
        "gst_treatment": "business_gst",
        "invoice_conversion_type": "invoice",
        "status": "open",
        "bill_number": order.id,
        "date": billDate,
        "payment_terms_label": "Net 7",
        "currency_id": "1190249000000000064",
        "line_items": linedata,
        "template_id": "1190249000000000245"
      };
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Zoho-oauthtoken " + accesstoken
      }
    };
    
   const request = https.request(billurl, options, response => {
      //console.log(`statusCode: ${response.statusCode}`);
      response.on('data', d => {
        //console.log(JSON.parse(d));
        apidata = JSON.parse(d);
  
        resolve(apidata);
  
      });
     });
     request.on('error', error => {
      reject(new Error(`BIll Creation in ZOHO failed due to ${error}`));

    });
    request.write(JSON.stringify(bllData));
    request.end();

    console.log(bllData);
  }
  catch(err){
    console.log("Error while Creating ZOHO vendor bill :" + err);
  }
  });
}

exports.getBills=(vendor_id,accesstoken,apifirstdate,apilastdate)=>{
  return new Promise(async (resolve, reject) => {
    let locationData;
    let getBillsUrl
    if (apifirstdate!==null && apilastdate!==null){
      getBillsUrl=getBills+"&vendor_id="+vendor_id+"&date_start="+apifirstdate+"&date_end="+apilastdate;
    }
    else{
      getBillsUrl=getBills+"&vendor_id="+vendor_id;
    }
    
    try{
    const options = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Zoho-oauthtoken " + accesstoken
      }
    };
    
   const request = https.request(getBillsUrl, options, response => {
      //console.log(`statusCode: ${response.statusCode}`);
      response.on('data', d => {
        //console.log(JSON.parse(d));
        apidata = JSON.parse(d);
  
        resolve(apidata);
  
      });
     });
     request.on('error', error => {
      reject(new Error(`Error while fetching Bills from ZOHO due to API Error:${error}`));

    });
    //request.write(JSON.stringify(bllData));
    request.end();

  }
  catch(err){
    console.log("Error while fetching bills from ZOHO due to error:" + err);
  }
  });
}