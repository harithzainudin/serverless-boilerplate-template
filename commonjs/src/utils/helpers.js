/**
 * This file is created to show the demo of how to create and organized your folder
 * You can put all your helpers function here and import it into you handlers to use it
 * Bear in mind that, if you think that the helpers function will also help other handlers
 * and will be use in other handlers, then that function should be here. We want to make our code DRY
 * You can see clients-and-utilities folder to see which common helpers you might use.
 */

function sum(x, y) {
  return x + y;
}

function sub(x, y) {
  return x - y;
}

function mul(x, y) {
  return x * y;
}

module.exports = { sum, sub, mul };
