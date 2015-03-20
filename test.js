
var a = function () {}

a.prototype = {
    init : function (){
        this.someMethod()
    },
    someMethod : function () {
        print("Some method")
    }
}

var init = function (stage) {
	new a().init()
}
init()