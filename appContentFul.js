/**
 * ContentFul
 */
const client = contentful.createClient({
  space: 'your space',
  environment: ' your master', // defaults to 'master' if not set
  accessToken: 'your token'
})




/**
 * Variables
 */

const cartBtn = document.querySelector(".cart-btn")
const closeCartBtn = document.querySelector(".close-cart")
const clearCartBtn = document.querySelector(".clear-cart")
const cartDOM = document.querySelector(".cart")
const cartOverlay = document.querySelector(".cart-overlay") 
const cartItems = document.querySelector(".cart-items") 
const cartTotal = document.querySelector(".cart-total") 
const cartContent = document.querySelector(".cart-content") 
const productsDOM = document.querySelector(".products-center") 

/**
 * Cart
 */

let cart = []


/**
 * Getting the products
 */

class Products{

   static async getProducts(){
       try {
         const response = await client.getEntries()
         const data = await response
         let products = data.items
          products = products.map((items) =>{
            const {title,price} = items.fields
            const {id} = items.sys
            const image = items.fields.image.fields.file.url 
            return {title,price,id,image}
          })
          return products
       } catch (error) {
          console.log(error)
       }
    }
    static async getProduct(id){
        try {
         const response = await client.getEntry(id)
         const data = await response
         return data
       } catch (error) {
          console.log(error)
       }
    }
}
/**
 * Display products
 */

class UI{

   static  displayProducts(products){
        let result =""
       
        products.forEach(product => {
            let ButtonText = Cart.getInCart(product.id)
            result +=  `
             <!--Single product-->
             <article class="product">
                <div class="img-container">
                    <img  class="product-img" src=${product.image} alt="product" >
                    <button class="bag-btn" data-id=${product.id} ${ButtonText && "disabled"}>
                        <i class="fas fa-shopping-cart">${ButtonText ? "In Cart" : "Add to cart" }</i>
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>
            <!-- end of single product-->
            `
        });
        productsDOM.innerHTML = result
    }

   static  getBagButtons(){
        const bagBtn = [...document.querySelectorAll(".bag-btn")]
        bagBtn.forEach(btn =>{
           btn.addEventListener("click",() =>{
            let id = btn.dataset.id
            if(!Cart.getInCart(id)){
               Cart.addToCart(id)
               this.TextChangeBtnAddToCart(btn)
               return
            }
             Cart.addCount(id)
           })
        })
    }


    static displayCart(){
        let result =""
        cart.forEach(product =>{
            result +=
            `
             <!-- cart item-->
                <div class="cart-item">
                    <img src=${product.image} alt="product" srcset="">
                    <div>
                        <h4>${product.title}</h4>
                        <h5>${product.price}</h5>
                        <span class="remove-item" data-id=${product.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${product.id}></i>
                        <p class="item-amount">${product.count}</p>
                        <i class="fas fa-chevron-down" data-id=${product.id}></i>
                    </div>
                </div>
                <!-- end of cart item-->
            `
        })
        cartContent.innerHTML = result
        this.addCountItem()
        this.deleteCountItem()
        this.removeItemCart()
        this.displayCartFooter()
        this.displayCartCount()
    }
    static displayCartFooter(){
        let mount = 0
        cart.forEach(product =>{
         mount+= product.price * product.count
       })
       cartTotal.innerText = mount.toFixed(2)
    }
    static displayCartCount(){
        cartItems.innerText=cart.length

    }
    static VisibleCart(){
        cartBtn.addEventListener("click",()=>{
            cartOverlay.style.visibility = "visible"
            cartDOM.style.transform= "translateX(0%)"
        })
    }
    static HiddenCart(){
        closeCartBtn.addEventListener("click",()=>{
            cartOverlay.style.visibility = "hidden"
            cartDOM.style.transform= "translateX(100%)"
        })
    }
    static ClearCart(){
        clearCartBtn.addEventListener("click",()=>{
            Cart.ClearCart()
        })
        
    }
    static removeItemCart(){
        const removeItems = [...document.querySelectorAll(".remove-item")]
        removeItems.forEach(removeItem =>{
            removeItem.addEventListener("click",()=>{
                Cart.deleteItemCart(removeItem.dataset.id)
            })
        })
        Products.getProducts().then(products => UI.displayProducts(products)
        ).then(() =>{
            UI.getBagButtons()
        })
        
       
    }
    static TextChangeBtnAddToCart(btn){
           btn.innerText = "In Cart"
           btn.disabled = true
        }
    
    static addCountItem(){
        const up = [...document.querySelectorAll(".fa-chevron-up")]
            up.forEach(element => {
                element.addEventListener("click",()=>{
                    Cart.addCount(element.dataset.id)
                })
            })
                       
    }
    static deleteCountItem(){
         const down = [...document.querySelectorAll(".fa-chevron-down")]
            down.forEach(element => {
                element.addEventListener("click",()=>{
                    Cart.deleteCount(element.dataset.id)
                })
            })
    }
}

/**
 * Cart 
 */

class Cart {

    static getInCart(id){
      return cart.find(item => item.id === id) 
    }

    static addCount(id){
        cart.map(item => {
            if(item.id == id){
               item.count += 1
            }
        })
        UI.displayCart()
        Storage.setProducts(cart)
    }
    static deleteCount(id){
        cart.map((product,index) => {
            if (product.id == id  && product.count > 1){
                 product.count -= 1 
            } 
        })
        UI.displayCart()
        Storage.setProducts(cart)
    }

    static addToCart(id){
         Products.getProduct(id).then(item => cart.push(
            {
                id:id,
                title:item.fields.title,
                price:item.fields.price,
                image: item.fields.image.fields.file.url,
                count:1
            })).then(() =>{
                UI.displayCart()
                Storage.setProducts(cart)
            })
            
    }
    static deleteItemCart(id){
        cart = cart.filter(item => item.id !== id)
        UI.displayCart()
        
        Storage.setProducts(cart)
    }

    static ClearCart(){
        cart = []
        UI.displayCart()
        Storage.setProducts(cart)
    }
}

/**
 * LocalStorage
 */

class Storage{
    static setProducts(cart){
        localStorage.setItem("cart",JSON.stringify(cart))
    }

    static getProducts(){
          cart = JSON.parse(localStorage.getItem("cart")) 
    }
  
}

/**
 * Init
 */

document.addEventListener("DOMContentLoaded", () =>{
    //Init
    Storage.getProducts()
    // Init cart 
    UI.displayCart()
    // Add Event btn  open cart
    UI.VisibleCart()
    // Add event btn close cart
    UI.HiddenCart()
    // Add event bnt clear cart
    UI.ClearCart()
    //Get all products 
    Products.getProducts().then(products => UI.displayProducts(products)
    ).then(() =>{
        UI.getBagButtons()
    })
  
})

