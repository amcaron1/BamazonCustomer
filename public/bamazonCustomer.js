// Declares global variables
var modal;
var modalMessage;
var productArray = [];

$(document).ready(function () {

    // Gets the addresses of the modal and modal message
    modal = document.getElementById("modal");
    modalMessage = document.getElementById("modal-message");

    // Hides the cart and its associated buttons
    $("#cart").hide();
    $("#order-button").hide();
    $("#back-button").hide();

    // Displays the products to the user
    displayProducts();
})

// Displays the products to the user
function displayProducts() {

    // Gets the products from the database
    $.get("/products", function (res) {

        // Creates and displays a table row for each product
        // Note that 'floatRight' right justifies the price, and 'floatFix' turns off the float so that the price does not float up
        // Note that 'stockQuantity is hidden.  It is stored here for future use.
        for (var i = 0; i < res.length; i++) {
            $("#product-table").append("<tr><td class='itemID'>" + res[i].item_id + "</td><td class='productName'>" + res[i].product_name + "</td ><td class='floatFix'><div class='productPrice floatRight'>" + formatCurrency(res[i].price) + "</div></td><td>" + "<input type='number' class='productQuantity' placeholder='0' min='0' max='100' value='0'>" + "</td><td>" + "<button type='button' class='btn btn-success btn-sm selectProductButton'>Select</button></td><td class='hidden stockQuantity'>" + res[i].stock_quantity + "</td></tr>");
        }
    })
}

// If enough product is in stock, calculates cost and stores the order in a table row and in the productArray
$(document).on("click", ".selectProductButton", function () {

    // Gets the values of the selected product
    var orderID = $(this).closest('tr').find('.itemID').text();
    var orderName = $(this).closest('tr').find('.productName').text();
    var orderPrice = $(this).closest('tr').find('.productPrice').text();
    var orderQuantity = $(this).closest('tr').find('.productQuantity').val();
    var stockQuantity = $(this).closest('tr').find('.stockQuantity').text();

    // If the user did not select a quanity, a modal message is set and displayed
    if (orderQuantity == 0) {
        modalMessage.textContent = "Quantity must be greater than zero.";
        modal.style.display = "block";
        
    } else {
        
        // stock_quantity was stored in a hidden column of the product-table so this code is not necessary.  It is included to demonstrate select by id.
        // orderID is passed two ways, by 'url' and by 'data'
        var data = {"id": orderID};
        $.ajax({
            'type': 'get',
            'url': '/product_info/' + orderID,
            'data': data,
            'success': function (res) {
                console.log("stock_quantity = " + res[0].stock_quantity); 
            }
        })
        // This is the non-ajax version of select by id
        $.get("/product_info/" + orderID, data, function (res) {
            console.log("stock_quantity = " + res[0].stock_quantity); 
        })

        // If the orderQuantity is greader than the stockQuantity, a modal message is set and displayed
        if (orderQuantity > parseInt(stockQuantity)) {
            modalMessage.textContent = "Insufficient quantity in stock.";
            modal.style.display = "block";

        } else {
      
            // Calculates the cost.  Note that '$ ' and ',' must be stripped from orderPrice.
            var cost = orderQuantity * orderPrice.slice(2).replace(/,/g, '');

            // Appends the product to the cart-table
            $("#cart-table").append("<tr><div><td class='itemID'>" + orderID + "</td><td class='productName'>" + orderName + "</td ><td class='floatFix'><div class='productPrice floatRight'>" + orderPrice + "</div></td><td class='productQuantity'>" + orderQuantity + "</td><td class='floatFix'><div class='floatRight'>" + formatCurrency(cost) + "</div></td></div></tr>");

            // Puts info in product array for future use
            productArray.push({ "orderID": orderID, "orderQuantity": orderQuantity, "cost": cost });
        }
    }
})

// Displays the cart contents and calculates the total
$(document).on("click", "#cart-button", function () {

    // If the cart is empty, a modal message is set and displayed
    if (productArray.length == 0) {
        modalMessage.textContent = "Cart is empty.";
        modal.style.display = "block";

    } else {

        // Calculates and displays the total
        var total = 0;
        for (var i = 0; i < productArray.length; i++) {
            total = total + productArray[i].cost;
        }
        $("#cart-table").append("<tr><div><td></td><td></td><td></td><td><div class='totalHeading'>" + 'Total' + "</div></td><td class='floatFix'><div class='floatRight totalLine'>" + formatCurrency(total) + "</div></td></div></tr>");

        // Hides the product table and shows the cart table
        $("#products").hide();
        $("#cart-button").hide();
        $("#cart").show();
        $("#order-button").show();
        $("#back-button").show();

    }
})

// For each item in the order, updates the stock_quantity and product_sales in the database
$(document).on("click", "#order-button", function () {
    for (var i = 0; i < productArray.length; i++) {
        $.ajax({
            'type': 'post',
            'url': '/product_update',
            'data': productArray[i],
            'success': function (res) {

                // If the order was successful, a modal message is set and displayed
                modalMessage.textContent = "Thank you for your order.";
                modal.style.display = "block";
            }
        })
    }
})

// Formats currency by inserting commas and '$ '
function formatCurrency(n) {
    return "$ " + n.toFixed(2).replace(/./g, function (currentChar, currentIndex, inputString) {
        return currentIndex > 0 && currentChar !== "." && (inputString.length - currentIndex) % 3 === 0 ? "," + currentChar : currentChar;
    });
}

// Closes the modal
$(document).on("click", "#close-button", function () {
    modal.style.display = "none";

    // Reloads the page after an order is placed
    if (modalMessage.textContent == "Thank you for your order.") {
        location.reload();
    }
})

// Reloads the page after the back-button is selected
$(document).on("click", "#back-button", function () {
    location.reload(); 
})