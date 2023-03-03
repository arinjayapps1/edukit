
let products;
const filterInput=document.querySelectorAll('.widget-filter-search');
const productsGrid=document.querySelector('.products-grid')
const csrf=document.querySelector('.csrf');
console.log("csrf");
console.log(csrf.value);

const fetchProducts=async()=>{
const response = await fetch('/product-catalogapi').catch(err=>{
  console.log("Error while fetching products");
 });
 if(response){
  return response.json();  
 }
}

const init= async()=>{
 let data= await fetchProducts();
 products=data.products;
  console.log(products);
}

init();

const display=(products1,element)=>{
element.innerHTML=products1.map((product)=>{
  return `<div class="col-md-4 col-sm-6 px-2 mb-4">
  <div class="card product-card">
    <button class="btn-wishlist btn-sm" type="button" data-bs-toggle="tooltip" data-bs-placement="left" title="Add to wishlist">
      <i class="ci-heart"></i>
    </button>
    <a class="card-img-top d-block overflow-hidden px-4 py-2" href="shop-single-v1.html">
      <img src=${product.imageUrl} alt="Product">
    </a>
    <div class="card-body py-2">
      <a class="product-meta d-block fs-xs pb-1" href="#">Sneakers &amp; Keds</a>
      <h3 class="product-title fs-sm">
        <a href="shop-single-v1.html">${product.name}</a>
      </h3>
      <div class="d-flex justify-content-between">
        <div class="product-price">
          <span class="text-accent">Rs. ${product.discPrice}.<small>00</small></span>
        </div>
        <div class="star-rating">
          <i class="star-rating-icon ci-star-filled active"></i>
          <i class="star-rating-icon ci-star-filled active"></i>
          <i class="star-rating-icon ci-star-filled active"></i>
          <i class="star-rating-icon ci-star-filled active"></i>
          <i class="star-rating-icon ci-star"></i>
        </div>
      </div>
    </div>
    <div class="card-body card-body-hidden">
      <div class="text-center pb-2">
        <div class="form-check form-option form-check-inline mb-2">
          <input class="form-check-input" type="radio" name="size1" id="s-75">
          <label class="form-option-label" for="s-75">7.5</label>
        </div>
        <div class="form-check form-option form-check-inline mb-2">
          <input class="form-check-input" type="radio" name="size1" id="s-80" checked>
          <label class="form-option-label" for="s-80">8</label>
        </div>
        <div class="form-check form-option form-check-inline mb-2">
          <input class="form-check-input" type="radio" name="size1" id="s-85">
          <label class="form-option-label" for="s-85">8.5</label>
        </div>
        <div class="form-check form-option form-check-inline mb-2">
          <input class="form-check-input" type="radio" name="size1" id="s-90">
          <label class="form-option-label" for="s-90">9</label>
        </div>
      </div>
      <input type="hidden" name="_csrf"  value=${csrf.value}>
      <input type="hidden" name="itemId"  value=${product.id}>
      <button class="btn btn-primary btn-sm d-block w-100 mb-2 add-cart" type="button">
        <i class="ci-cart fs-sm me-1"></i>Add to Cart
      </button>
      <div class="text-center">
        <a class="nav-link-style fs-ms" href="#quick-view" data-bs-toggle="modal">
          <i class="ci-eye align-middle me-1"></i>Quick view</a>
      </div>
    </div>
  </div>
  <hr class="d-sm-none">
</div>`
}).join('');
}

const addeventtoBtns=(className)=>{
  const addtocartbtns=document.querySelectorAll(className);
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
}

filterInput.forEach((input)=>{
  input.addEventListener('keyup',()=>{
    let value=input.value;
    value=value.toLowerCase();
      if(value){
      let filterProducts=products.filter((product)=>{
          let { name } =product;
          console.log(name);
          name=name.toLowerCase();
          if(name.startsWith(value)){
            return product;
          }  
      });
      display(filterProducts,productsGrid);
      addeventtoBtns('.add-cart');
      }
      else{
        display(products,productsGrid);
        addeventtoBtns('add-cart');
      }
  })
  })