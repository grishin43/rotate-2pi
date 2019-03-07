$(function () {
    let productSelector = '.product-rotate';
    initRotateMyProduct(productSelector);
});

function initRotateMyProduct(target) {
    $(target).each(function () {
       $(this).rotate2pi($(this).data());
    });
}