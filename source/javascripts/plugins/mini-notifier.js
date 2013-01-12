(function($) {
    $.notify = function(message, options) {
        options = options || {};

        var color = null, backgroundColor = null;
        switch(options.type) {
            case "information":
                color = "#567B1B";
                backgroundColor = "#E3F0DB";
                break;
            case "error":
                color = "#A72947";
                backgroundColor = "#D79EAC";
                break;
        }

        var css = {
            position: "fixed",
            "z-index": 999,
            top: 0,
            left: 0,
            width: "100%",
            padding: "10px",
            display: "none",
            "text-align": "center",
            "background-color": backgroundColor,
            color: color
        };
        
        var notify = $("<div>" + message + "</div>").css(css).appendTo("body")
            .show(400, function() {
                setTimeout(function() { notify.hide(400); }, 4000);
            });
    };
})(jQuery);