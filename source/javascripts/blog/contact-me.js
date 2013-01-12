(function($) {
    $(function() {
        $(".contact-me-form input[type='submit']").click(function() {
            var url = "http://getsimpleform.com/messages?form_api_token=6f026e61a96c3a6d63342b09d67902de",
                data = $(".contact-me-form").serialize(),
                name = $(".contact-me-form input[name=name]"),
                email = $(".contact-me-form input[name=email]"),
                message = $(".contact-me-form textarea[name=message]"),
                emailRegularExpression = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (name.val().length === 0) {
                $.notify("What is your name?", { type: "error" });
            } else if (email.val().length === 0) {
                $.notify("What is your email address?", { type: "error" });
            } else if (!emailRegularExpression.test(email.val())) {
                $.notify("I don't believe this is your email address!", { type: "error" });
            } else if (message.val().length === 0) {
                $.notify("What do you want to say to me?", { type: "error" });
            } else {
                $.post(url, data).complete(function() {
                    name.add(email).add(message).val("");
                    $.notify("Thanks, I got your message.", { type: "information" });
                });
            }

            return false;
        });
    });
})(jQuery);