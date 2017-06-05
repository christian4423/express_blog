
/********************
 *   CSS Libraries  *
 ********************/

//bootstrap
   require("../node_modules/bootstrap/less/bootstrap.less");
// //font-awesome
   require("../node_modules/font-awesome/scss/font-awesome.scss");

/******************
 *   CSS Custom   *
 ******************/
require("./sass/main.scss");

/********************
 *   JS Libraries   *
 ********************/

//Jquery
require('../node_modules/jquery/src/jquery.js');
//Bootstrap
require("../node_modules/bootstrap/dist/js/bootstrap.min.js");
// SocketIO
//require('../node_modules/socket.io-client/dist/socket.io.js');

/********************
 *      Custom JS   *
 ********************/
require("./js/main.js");


//for webpack hot module middleware. Allows refresh on client in dev env.
if (module.hot) {
  module.hot.accept();
}